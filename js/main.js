import api from './api.js';
import search from './search.js';
import theme from './theme.js';

const problemGrid = document.getElementById('problem-grid');

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function stripHtml(value) {
    return String(value || '').replace(/<[^>]*>/g, ' ');
}

function getSummary(problem) {
    const sourceText = stripHtml(problem.content || problem.titleSlug || '');
    const compactText = sourceText.replace(/\s+/g, ' ').trim();

    if (!compactText) {
        return 'Problem details available in the visualizer.';
    }

    return compactText.length > 140 ? `${compactText.slice(0, 137)}...` : compactText;
}

function createProblemCard(problem) {
    const card = document.createElement('div');
    card.className = 'problem-card';
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open visualizer for ${problem.title}`);
    card.dataset.title = problem.title;
    card.dataset.slug = problem.titleSlug;
    card.dataset.difficulty = problem.difficulty;
    card.dataset.tags = JSON.stringify(problem.topicTags);

    const tagNames = Array.isArray(problem.topicTags) ? problem.topicTags.map(tag => tag.name).filter(Boolean) : [];
    const primaryTags = tagNames.slice(0, 3);
    const extraTags = Math.max(tagNames.length - primaryTags.length, 0);
    const summary = getSummary(problem);

    card.innerHTML = `
        <div>
            <div class="problem-card-header">
                <h3 class="problem-title">${escapeHtml(problem.title)}</h3>
                <span class="badge ${escapeHtml(problem.difficulty.toLowerCase())}">${escapeHtml(problem.difficulty)}</span>
            </div>
            <p class="problem-summary">${escapeHtml(summary)}</p>
            <div class="tag-list">
                ${primaryTags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                ${extraTags > 0 ? `<span class="tag">+${extraTags}</span>` : ''}
            </div>
            <span class="problem-link">
                Open visualizer
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </span>
        </div>
    `;

    // Make card keyboard-focusable and actionable
    card.tabIndex = 0;
    card.addEventListener('click', () => {
        const params = new URLSearchParams({
            title: problem.title || '',
            slug: problem.titleSlug || '',
            difficulty: problem.difficulty || '',
            tags: JSON.stringify(problem.topicTags || [])
        });
        window.location.href = `visualizer.html?${params.toString()}`;
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
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
    theme.init();
    displayProblems();
    search.init(displayProblems);
});
