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

function createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'problem-card skeleton';
    card.innerHTML = `
        <div>
            <div class="problem-card-header">
                <h3 class="problem-title"><div class="skeleton-text large" style="width: 60%; margin-bottom: 0.5rem;"></div></h3>
                <span class="skeleton-text" style="width: 60px; height: 28px;"></span>
            </div>
            <p class="problem-summary">
                <div class="skeleton-text" style="width: 100%; margin-bottom: 0.5rem;"></div>
                <div class="skeleton-text" style="width: 85%;"></div>
            </p>
            <div class="tag-list">
                <div class="skeleton-text" style="width: 80px; height: 24px; border-radius: 4px;"></div>
                <div class="skeleton-text" style="width: 70px; height: 24px; border-radius: 4px;"></div>
                <div class="skeleton-text" style="width: 60px; height: 24px; border-radius: 4px;"></div>
            </div>
            <div class="skeleton-text" style="width: 40%; margin-top: 1rem;"></div>
        </div>
    `;
    return card;
}

function showSkeletons() {
    problemGrid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        problemGrid.appendChild(createSkeletonCard());
    }
}

function showError(message, onRetry) {
    problemGrid.innerHTML = `
        <div class="error-message" style="grid-column: 1/-1;">
            <p style="font-weight: 600; margin-bottom: 0.5rem;">⚠️ ${message}</p>
            <p>The API may be waking up — please wait 30 seconds and refresh.</p>
            <button onclick="location.reload()">Retry</button>
        </div>
    `;
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
    // Show skeleton cards while loading
    showSkeletons();
    
    try {
        const problems = await api.fetchProblems(query);
        
        problemGrid.innerHTML = "";
        
        if (problems.length === 0) {
            problemGrid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; color: var(--text-muted); padding: 3rem 1rem;">No problems found. Try a different search.</div>';
            return;
        }

        problems.forEach(problem => {
            problemGrid.appendChild(createProblemCard(problem));
        });
    } catch (error) {
        console.error('Failed to fetch problems:', error);
        showError("Couldn't load problems");
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    theme.init();
    displayProblems();
    search.init(displayProblems);
});
