const API_BASE_URL = 'https://alfa-leetcode-api.onrender.com';
const CACHE_PREFIX = 'algolens_';
const PROBLEM_CACHE_PREFIX = 'algolens_problem_';
const CACHE_TTL_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 20;
const DEFAULT_SKIP = 0;

function buildCacheKey(path, params = {}) {
    const sortedParams = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&');

    return `${CACHE_PREFIX}${path}${sortedParams ? `?${sortedParams}` : ''}`;
}

function getCachedData(cacheKey) {
    const cachedValue = localStorage.getItem(cacheKey);

    if (!cachedValue) {
        return null;
    }

    try {
        const parsed = JSON.parse(cachedValue);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            return parsed.data;
        }
    } catch (error) {
        console.warn('Ignoring malformed cache entry:', error);
    }

    localStorage.removeItem(cacheKey);
    return null;
}

function setCachedData(cacheKey, data) {
    localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data,
    }));
}

function getProblemCacheKey(slug) {
    return `${PROBLEM_CACHE_PREFIX}${slug}`;
}

function normalizeProblem(problem) {
    return {
        titleSlug: problem.titleSlug || '',
        title: problem.title || '',
        difficulty: problem.difficulty || 'Unknown',
        topicTags: Array.isArray(problem.topicTags) ? problem.topicTags : [],
        content: problem.content || '',
    };
}

function normalizeSelectedProblem(problem) {
    return {
        titleSlug: problem.titleSlug || '',
        title: problem.questionTitle || problem.title || '',
        difficulty: problem.difficulty || 'Unknown',
        topicTags: Array.isArray(problem.topicTags) ? problem.topicTags : [],
        content: problem.question || problem.content || '',
    };
}

function extractProblemList(payload) {
    const list = payload?.problemsetQuestionList;

    if (!Array.isArray(list)) {
        return [];
    }

    return list.map(normalizeProblem);
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
}

async function fetchProblems(query = '') {
    const normalizedQuery = query.trim();
    const cacheKey = buildCacheKey('problems', normalizedQuery ? { query: normalizedQuery } : { limit: DEFAULT_LIMIT, skip: DEFAULT_SKIP });
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    const url = normalizedQuery
        ? `${API_BASE_URL}/problems?limit=${DEFAULT_LIMIT}&skip=${DEFAULT_SKIP}`
        : `${API_BASE_URL}/problems?limit=${DEFAULT_LIMIT}&skip=${DEFAULT_SKIP}`;

    try {
        const data = await fetchJson(url);
        const problems = extractProblemList(data);
        const filteredProblems = normalizedQuery
            ? problems.filter((problem) => {
                const haystack = [problem.title, problem.titleSlug, problem.difficulty, ...(problem.topicTags || []).map((tag) => tag.name)]
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(normalizedQuery.toLowerCase());
            })
            : problems;

        setCachedData(cacheKey, filteredProblems);
        return filteredProblems;
    } catch (error) {
        console.error('Error fetching problems:', error);
        return [];
    }
}

async function fetchProblemBySlug(slug) {
    if (!slug) {
        return null;
    }

    const normalizedSlug = slug.trim();
    const cacheKey = getProblemCacheKey(normalizedSlug);
    const cachedData = getCachedData(cacheKey);

    if (cachedData && cachedData.content) {
        return cachedData;
    }

    try {
        const selectedProblem = await fetchJson(`${API_BASE_URL}/select?titleSlug=${encodeURIComponent(normalizedSlug)}`);
        const normalizedSelectedProblem = normalizeSelectedProblem(selectedProblem);

        if (normalizedSelectedProblem.titleSlug) {
            setCachedData(cacheKey, normalizedSelectedProblem);
            return normalizedSelectedProblem;
        }

        const data = await fetchJson(`${API_BASE_URL}/problems?titleSlug=${encodeURIComponent(normalizedSlug)}`);
        const [problem] = extractProblemList(data);
        if (problem) {
            setCachedData(cacheKey, problem);
            return problem;
        }

        return null;
    } catch (error) {
        console.error('Error fetching problem:', error);

        if (cachedData) {
            return cachedData;
        }

        return null;
    }
}

function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default {
    fetchProblems,
    fetchProblemBySlug,
    debounce,
};
