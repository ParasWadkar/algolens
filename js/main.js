import api from './api.js';
import search from './search.js';

const problemGrid = document.getElementById('problem-grid');

function createProblemCard(problem) {
    const card = document.createElement('div');
    card.className = 'problem-card';
    card.dataset.title = problem.title;
    card.dataset.slug = problem.titleSlug;
    card.dataset.difficulty = problem.difficulty;
    card.dataset.tags = JSON.stringify(problem.topicTags);

    card.innerHTML = `
        <div>
            <h3 class="problem-title">${problem.title}</h3>
            <div class="problem-meta">
                <span class="badge ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
            </div>
            <div class="tag-list">
                ${problem.topicTags.slice(0, 3).map(tag => `<span class="tag">${tag.name}</span>`).join('')}
                ${problem.topicTags.length > 3 ? `<span class="tag">+${problem.topicTags.length - 3}</span>` : ''}
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        const params = new URLSearchParams({
            title: problem.title,
            slug: problem.titleSlug,
            difficulty: problem.difficulty,
            tags: JSON.stringify(problem.topicTags)
        });
        window.location.href = `visualizer.html?${params.toString()}`;
    });

    return card;
}

async function displayProblems(query = "") {
    problemGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; color: var(--text-muted);">Searching...</div>';
    
    const problems = await api.fetchProblems(query);
    
    problemGrid.innerHTML = "";
    
    if (problems.length === 0) {
        problemGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; color: var(--text-muted);">No problems found.</div>';
        return;
    }

    problems.forEach(problem => {
        problemGrid.appendChild(createProblemCard(problem));
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayProblems();
    search.init(displayProblems);
});
