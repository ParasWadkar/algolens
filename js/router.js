import api from './api.js';
import detector from './detector.js';
import theme from './theme.js';

function showLoadingSpinner(canvasId = 'visualizer-canvas') {
    const canvas = document.getElementById(canvasId);
    canvas.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
            <p>Loading problem...</p>
        </div>
    `;
}

function hideLoadingSpinner(canvasId = 'visualizer-canvas') {
    const canvas = document.getElementById(canvasId);
    const spinner = canvas?.querySelector('.spinner-container');
    if (spinner) {
        spinner.remove();
    }
}

function showError(message, details = '', canvasId = 'visualizer-canvas') {
    const canvas = document.getElementById(canvasId);
    canvas.innerHTML = `
        <div class="error-message" style="height: 100%; display: flex; flex-direction: column; justify-content: center; border: none; background: transparent;">
            <p style="font-weight: 600; margin-bottom: 1rem;">⚠️ ${message}</p>
            ${details ? `<p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">${details}</p>` : ''}
            <a href="index.html" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary); color: var(--bg-color); border-radius: 6px; font-weight: 600; text-decoration: none; width: fit-content;">← Back to Home</a>
        </div>
    `;
}

async function initVisualizer() {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    const slug = params.get('slug');
    const difficulty = params.get('difficulty');
    const tags = JSON.parse(params.get('tags') || '[]');

    if (!title || !slug) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('problem-title').textContent = title;
    const diffBadge = document.getElementById('problem-difficulty');
    diffBadge.textContent = difficulty;
    diffBadge.className = `badge ${difficulty.toLowerCase()}`;

    // Show loading state initially
    showLoadingSpinner('visualizer-canvas');
    document.getElementById('step-info').innerHTML = '<span style="color: var(--text-muted);">Loading algorithm steps...</span>';

    try {
        const category = detector.detectCategory(tags);
        console.log(`Detected category: ${category}`);

        const tagNames = tags.map(t => t.name || t.slug || '').filter(Boolean).join(', ');

        // Fetch problem data
        await api.fetchProblemBySlug(slug);

        // Dynamic import of visualizer based on category
        try {
            const module = await import(`./visualizers/${category}.js`);
            const visualizer = new module.default();
            
            // Initialize visualizer with error handling
            try {
                visualizer.init('visualizer-canvas', { slug, title, difficulty, tags });
                hideLoadingSpinner('visualizer-canvas');
            } catch (initErr) {
                console.error('Visualizer initialization error:', initErr);
                showError(
                    "Couldn't parse example input for this problem.",
                    "The problem example format might not be supported yet.",
                    'visualizer-canvas'
                );
                document.getElementById('step-info').innerHTML = '<span style="color: var(--text-muted);">Error loading visualization</span>';
                return;
            }
            
            // Connect controls
            document.getElementById('btn-prev').onclick = () => visualizer.prev();
            document.getElementById('btn-next').onclick = () => visualizer.next();
            
            const playPauseBtn = document.getElementById('btn-play-pause');
            const playIcon = document.getElementById('play-icon');
            const pauseIcon = document.getElementById('pause-icon');
            
            playPauseBtn.onclick = () => {
                const isPlaying = visualizer.togglePlay();
                playIcon.style.display = isPlaying ? 'none' : 'block';
                pauseIcon.style.display = isPlaying ? 'block' : 'none';
            };

            const speedSlider = document.getElementById('speed-slider');
            speedSlider.oninput = (e) => {
                visualizer.setSpeed(2100 - e.target.value);
            };

            // Initial step info
            document.getElementById('step-info').innerHTML = visualizer.getStepDescription();
            
            // Hook into visualizer updates
            visualizer.onUpdate = (desc) => {
                document.getElementById('step-info').innerHTML = desc;
            };

        } catch (importErr) {
            console.error('Failed to load visualizer module:', importErr);
            showError(
                'No visualizer available for this problem type yet.',
                `Detected tags: <strong>${tagNames || 'None'}</strong><br>Support for this problem type is coming soon!`,
                'visualizer-canvas'
            );
        }

    } catch (err) {
        console.error('Failed to initialize visualizer:', err);
        showError(
            'Failed to load problem data.',
            'Please check your connection and try again.',
            'visualizer-canvas'
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    theme.init();
    initVisualizer();
});
