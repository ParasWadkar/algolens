import detector from './detector.js';
import theme from './theme.js';

async function initVisualizer() {
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    const difficulty = params.get('difficulty');
    const tags = JSON.parse(params.get('tags') || '[]');

    if (!title) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('problem-title').textContent = title;
    const diffBadge = document.getElementById('problem-difficulty');
    diffBadge.textContent = difficulty;
    diffBadge.className = `badge ${difficulty.toLowerCase()}`;

    const category = detector.detectCategory(tags);
    console.log(`Detected category: ${category}`);

    // Dynamic import of visualizer based on category
    try {
        const module = await import(`./visualizers/${category}.js`);
        const visualizer = new module.default();
        visualizer.init('visualizer-canvas');
        
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

    } catch (err) {
        console.error('Failed to load visualizer:', err);
        document.getElementById('visualizer-canvas').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
                Visualizer for ${category} is coming soon!
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    theme.init();
    initVisualizer();
});
