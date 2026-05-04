const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql';

const api = {
    cache: new Map(),

    async fetchProblems(query = "") {
        const cacheKey = `algolens_cache_${query}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
            const { timestamp, data } = JSON.parse(cachedData);
            // Cache for 1 hour
            if (Date.now() - timestamp < 3600000) {
                return data;
            }
        }

        const graphqlQuery = {
            query: `
                query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
                    problemsetQuestionList: questionList(
                        categorySlug: $categorySlug
                        limit: $limit
                        skip: $skip
                        filters: $filters
                    ) {
                        total: totalNum
                        questions: data {
                            acRate
                            difficulty
                            freqBar
                            questionId
                            frontendQuestionId: questionFrontendId
                            isFavor
                            paidOnly: isPaidOnly
                            status
                            title
                            titleSlug
                            topicTags {
                                name
                                id
                                slug
                            }
                            hasSolution
                            hasVideoSolution
                        }
                    }
                }
            `,
            variables: {
                categorySlug: "",
                skip: 0,
                limit: 20,
                filters: { search: query }
            }
        };

        try {
            const response = await fetch(LEETCODE_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(graphqlQuery),
            });

            const data = await response.json();
            const problems = data.data.problemsetQuestionList.questions;
            
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: problems
            }));
            
            return problems;
        } catch (error) {
            console.error('Error fetching problems:', error);
            return [];
        }
    },

    debounce(func, wait) {
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
};

export default api;
