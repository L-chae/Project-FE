// src/api/wordClusterApi.js
import httpClient from "./httpClient";

/**
 * Word Cluster API (연관 단어)
 *
 * 사용처(WordDetailPage) 요구사항
 * - getClustersByCenter(wordId, { useCache }) -> { similar: [], opposite: [] }
 * - createCluster(wordId) -> { similar: [], opposite: [] }
 * - UI에서 item.text / item.meaning / item.level / item.inMyList 사용
 *
 * 캐시 정책
 * - 메모리 캐시(새로고침 전까지 유지)
 * - 동일 wordId 중복 생성 방지: in-flight Promise 재사용
 */

// 메모리 캐시: key=wordId(string) -> grouped
const clusterCache = new Map();
// 생성 중복 방지: key=wordId(string) -> Promise<grouped>
const createPromiseCache = new Map();

/**
 * grouped 표준 형태 보장
 * - 서버가 grouped를 그대로 주거나, { data: grouped }로 감싸거나,
 *   기타 형태면 null 반환
 */
const normalizeGrouped = (data) => {
  if (!data || typeof data !== "object") return null;

  // grouped 직접
  if ("similar" in data || "opposite" in data) {
    return {
      similar: Array.isArray(data.similar) ? data.similar : [],
      opposite: Array.isArray(data.opposite) ? data.opposite : [],
    };
  }

  // { data: grouped } 형태
  if (data.data && typeof data.data === "object") {
    const d = data.data;
    if ("similar" in d || "opposite" in d) {
      return {
        similar: Array.isArray(d.similar) ? d.similar : [],
        opposite: Array.isArray(d.opposite) ? d.opposite : [],
      };
    }
  }

  return null;
};

/**
 * List<ClusterWord> 또는 유사 구조를 grouped로 매핑
 * - 백엔드 응답이 달라도 최대한 안전하게 처리
 * - text 없으면 UI 렌더에서 깨지므로 제외
 */
const mapRawClusters = (raw) => {
  const grouped = { similar: [], opposite: [] };

  (raw || []).forEach((item) => {
    const related =
      (item?.relatedWord && typeof item.relatedWord === "object" && item.relatedWord) ||
      (item?.related && typeof item.related === "object" && item.related) ||
      (item?.relatedWordDto &&
        typeof item.relatedWordDto === "object" &&
        item.relatedWordDto) ||
      {};

    const center =
      (item?.centerWord && typeof item.centerWord === "object" && item.centerWord) ||
      (item?.center && typeof item.center === "object" && item.center) ||
      (item?.word && typeof item.word === "object" && item.word) ||
      {};

    const type = item?.type;

    const text = related?.word ?? related?.text ?? related?.name;
    if (!text) return;

    const dto = {
      id:
        item?.clusterWordId ??
        item?.id ??
        `${center?.wordId ?? ""}-${related?.wordId ?? text}`,
      centerWordId: center?.wordId ?? item?.centerWordId ?? item?.wordId,
      wordId: related?.wordId ?? item?.relatedWordId,
      text,
      meaning: related?.meaning ?? related?.definition,
      level:
        typeof related?.level === "number"
          ? related.level
          : typeof item?.level === "number"
          ? item.level
          : undefined,
      score: item?.score,
      type, // "synonym" | "antonym" | "similarity" ...
      inMyList: !!(item?.inMyList || related?.inMyList),
    };

    if (type === "antonym") grouped.opposite.push(dto);
    else grouped.similar.push(dto);
  });

  return grouped;
};

/**
 * 특정 중심 단어의 클러스터 조회
 * GET /api/cluster?wordId={wordId}
 *
 * @param {string|number} wordId
 * @param {{useCache?: boolean}} options
 * @returns {Promise<{similar:any[], opposite:any[]}>}
 */
export const getClustersByCenter = async (wordId, options = {}) => {
  if (!wordId) throw new Error("getClustersByCenter: wordId가 필요합니다.");

  const { useCache = true } = options;
  const key = String(wordId);

  if (useCache && clusterCache.has(key)) return clusterCache.get(key);

  const res = await httpClient.get("/api/cluster", { params: { wordId: key } });

  // 1) grouped가 오면 우선 사용
  const groupedDirect = normalizeGrouped(res?.data);
  // 2) 아니면 raw list로 매핑
  const grouped = groupedDirect ?? mapRawClusters(res?.data);

  clusterCache.set(key, grouped);
  return grouped;
};

/**
 * 클러스터 생성
 * POST /api/cluster/create?wordId={wordId}
 *
 * - 같은 wordId에 대해 중복 호출 방지: Promise 재사용
 * - 응답이 grouped면 그대로 사용
 * - 응답이 없거나 다른 형태면 GET 재조회(캐시 무시)로 최신 grouped 확보
 *
 * @param {string|number} wordId
 * @returns {Promise<{similar:any[], opposite:any[]}>}
 */
export const createCluster = async (wordId) => {
  if (!wordId) throw new Error("createCluster: wordId가 필요합니다.");

  const key = String(wordId);

  if (createPromiseCache.has(key)) return createPromiseCache.get(key);

  const promise = (async () => {
    const res = await httpClient.post("/api/cluster/create", null, {
      params: { wordId: key },
    });

    const groupedFromCreate = normalizeGrouped(res?.data);
    const grouped =
      groupedFromCreate ?? (await getClustersByCenter(key, { useCache: false }));

    clusterCache.set(key, grouped);
    return grouped;
  })();

  createPromiseCache.set(key, promise);

  try {
    return await promise;
  } finally {
    createPromiseCache.delete(key);
  }
};

/**
 * 로그인 유저의 모든 클러스터 조회
 * GET /api/cluster/all
 */
export const getMyClusters = async () => {
  const res = await httpClient.get("/api/cluster/all");
  return res.data;
};

/**
 * 특정 중심 단어의 클러스터 삭제 (로그인 유저 기준)
 * DELETE /api/cluster?wordId={wordId}
 * - 관련 캐시 제거
 */
export const deleteClusterByCenter = async (wordId) => {
  if (!wordId) throw new Error("deleteClusterByCenter: wordId가 필요합니다.");

  const key = String(wordId);
  const res = await httpClient.delete("/api/cluster", { params: { wordId: key } });

  clusterCache.delete(key);
  createPromiseCache.delete(key);

  return res.data;
};

/**
 * 로그인 유저의 모든 클러스터 삭제
 * DELETE /api/cluster/all
 * - 캐시 전체 제거
 */
export const deleteAllClusters = async () => {
  const res = await httpClient.delete("/api/cluster/all");
  clusterCache.clear();
  createPromiseCache.clear();
  return res.data;
};

/**
 * (선택) 외부에서 캐시 초기화
 * - 로그아웃/계정 변경/대규모 갱신 시 사용
 */
export const clearClusterCache = () => {
  clusterCache.clear();
  createPromiseCache.clear();
};
