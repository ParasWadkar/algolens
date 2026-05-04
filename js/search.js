import api from './api.js';

const search = {
    init(onSearch) {
        const searchInput = document.getElementById('problem-search');
        if (!searchInput) return;

        const debouncedSearch = api.debounce((e) => {
            onSearch(e.target.value);
        }, 300);

        searchInput.addEventListener('input', debouncedSearch);
    }
};

export default search;
