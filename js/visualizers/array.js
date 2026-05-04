const PROBLEM_CACHE_PREFIX = 'algolens_problem_';

function getProblemFromCache(slug) {
    if (!slug) {
        return null;
    }

    const cachedValue = localStorage.getItem(`${PROBLEM_CACHE_PREFIX}${slug}`);
    if (!cachedValue) {
        return null;
    }

    try {
        const parsed = JSON.parse(cachedValue);
        return parsed.data || null;
    } catch (error) {
        console.warn('Failed to parse cached problem data:', error);
        return null;
    }
}

function stripHtml(value) {
    return String(value || '').replace(/<[^>]*>/g, ' ');
}

function parseExampleArray(content) {
    const text = stripHtml(content);
    const match = text.match(/\[([^\]]+)\]/);

    if (!match) {
        return [];
    }

    return match[1]
        .split(',')
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value));
}

function parseTarget(content) {
    const text = stripHtml(content);
    const match = text.match(/target\s*=\s*(-?\d+)/i);
    return match ? Number(match[1]) : null;
}

function clampIndex(index, length) {
    return Math.max(0, Math.min(index, Math.max(length - 1, 0)));
}

export default class ArrayVisualizer {
    constructor() {
        this.container = null;
        this.svg = null;
        this.width = 0;
        this.height = 0;
        this.data = [45, 12, 89, 34, 67, 23, 56, 90, 11];
        this.problem = null;
        this.slug = '';
        this.currentStep = 0;
        this.steps = [];
        this.isPlaying = false;
        this.speed = 1000;
        this.timer = null;
        this.onUpdate = null;
    }

    init(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.slug = options.slug || '';
        this.problem = getProblemFromCache(this.slug);

        if (this.problem && this.problem.content) {
            const parsedArray = parseExampleArray(this.problem.content);
            if (parsedArray.length > 0) {
                this.data = parsedArray;
            }
        }

        this.svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);

        this.steps = [];
        this.currentStep = 0;
        this.generateSteps();
        this.render();
    }

    getProblemDescriptionFallback() {
        return this.problem?.content ? stripHtml(this.problem.content) : 'Loading problem data...';
    }

    generateSteps() {
        const arr = [...this.data];
        const target = parseTarget(this.problem?.content);

        if (this.slug === 'two-sum' && arr.length >= 2 && target !== null) {
            const first = arr[0];
            const second = arr[1];

            this.steps = [
                {
                    arr: [...arr],
                    highlight: [0],
                    match: null,
                    description: '<strong>Step 1:</strong> Start with pointer i=0, value=2',
                },
                {
                    arr: [...arr],
                    highlight: [0, 1],
                    match: null,
                    description: `<strong>Step 2:</strong> Check i=0 + j=1: ${first}+${second}=${first + second}, matches target!`,
                },
                {
                    arr: [...arr],
                    highlight: [0, 1],
                    match: [0, 1],
                    description: '<strong>Step 3:</strong> Found answer: indices [0, 1]',
                },
            ];
            return;
        }

        this.steps.push({
            arr: [...arr],
            highlight: [],
            match: [],
            description: `<strong>Initial State</strong>The array is initialized from the problem example: ${arr.join(', ')}.`,
        });

        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                this.steps.push({
                    arr: [...arr],
                    highlight: [i, j],
                    match: null,
                    description: `<strong>Checking Pair</strong>Comparing index ${i} (${arr[i]}) and index ${j} (${arr[j]}).`,
                });
            }
        }
    }

    render() {
        const step = this.steps[this.currentStep];
        if (!step) {
            return;
        }

        const barWidth = (this.width - 100) / step.arr.length;
        const maxVal = Math.max(...step.arr, 1);
        const scale = (this.height - 100) / maxVal;

        const bars = this.svg.selectAll('.bar')
            .data(step.arr, (d, i) => i);

        bars.exit().remove();

        const enter = bars.enter()
            .append('g')
            .attr('class', 'bar')
            .attr('transform', (d, i) => `translate(${50 + i * barWidth}, ${this.height - 50})`);

        enter.append('rect')
            .attr('width', barWidth - 10)
            .attr('height', 0)
            .attr('fill', 'var(--primary)')
            .attr('rx', 4);

        enter.append('text')
            .attr('x', (barWidth - 10) / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--text-color)')
            .style('font-size', '12px')
            .text(d => d);

        const update = enter.merge(bars);

        update.transition()
            .duration(300)
            .attr('transform', (d, i) => `translate(${50 + i * barWidth}, ${this.height - 50 - d * scale})`);

        update.select('rect')
            .transition()
            .duration(300)
            .attr('height', d => d * scale)
            .attr('fill', (d, i) => {
                if (step.match && step.match.includes(i)) {
                    return '#22c55e';
                }
                if (step.highlight.includes(i)) {
                    return 'var(--hard)';
                }
                return 'var(--primary)';
            });

        update.select('text')
            .text(d => d);

        if (this.onUpdate) {
            this.onUpdate(step.description);
        }
    }

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.render();
        } else {
            this.pause();
        }
    }

    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.render();
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
        return this.isPlaying;
    }

    play() {
        this.isPlaying = true;
        this.timer = setInterval(() => this.next(), this.speed);
    }

    pause() {
        this.isPlaying = false;
        clearInterval(this.timer);
    }

    setSpeed(speed) {
        this.speed = speed;
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }

    getStepDescription() {
        return this.steps[this.currentStep]?.description || this.getProblemDescriptionFallback();
    }
}
