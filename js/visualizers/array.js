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
    const exampleMatch = text.match(/Example\s*1:[\s\S]*?Input:\s*[\s\S]*?\[([^\]]+)\]/i);
    const match = exampleMatch || text.match(/Input:\s*[\s\S]*?\[([^\]]+)\]/i);

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

function normalizeTagName(tag) {
    return String(tag || '')
        .toLowerCase()
        .replace(/[_\s]+/g, '-');
}

function getTagNames(problem, options) {
    const tags = options?.tags || problem?.topicTags || [];
    return tags
        .map((tag) => normalizeTagName(tag?.name || tag?.slug || ''))
        .filter(Boolean);
}

function detectArrayAlgorithm(problem, options) {
    const tagNames = getTagNames(problem, options);

    if (tagNames.some((tag) => tag.includes('sorting'))) {
        return 'sorting';
    }
    if (tagNames.some((tag) => tag.includes('two-pointers'))) {
        return 'two-pointers';
    }
    if (tagNames.some((tag) => tag.includes('sliding-window'))) {
        return 'sliding-window';
    }
    if (tagNames.some((tag) => tag.includes('binary-search'))) {
        return 'binary-search';
    }

    return 'linear-scan';
}

function createStep(arr, description, options = {}) {
    return {
        arr: [...arr],
        description,
        activeIndices: options.activeIndices || [],
        compareIndices: options.compareIndices || [],
        doneIndices: options.doneIndices || [],
        windowRange: options.windowRange || null,
    };
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
        this.algorithmType = 'linear-scan';
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
        this.algorithmType = this.slug === 'two-sum'
            ? 'two-sum'
            : detectArrayAlgorithm(this.problem, options);

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

    generateSteps() {
        const arr = [...this.data];
        const target = parseTarget(this.problem?.content);

        if (this.algorithmType === 'two-sum' && arr.length >= 2 && target !== null) {
            const first = arr[0];
            const second = arr[1];

            this.steps = [
                createStep(arr, '<strong>Step 1:</strong> Start with pointer i=0, value=2', { activeIndices: [0] }),
                createStep(arr, `<strong>Step 2:</strong> Check i=0 + j=1: ${first}+${second}=${first + second}, matches target!`, { activeIndices: [0, 1] }),
                createStep(arr, '<strong>Step 3:</strong> Found answer: indices [0, 1]', { doneIndices: [0, 1] }),
            ];
            return;
        }

        if (this.algorithmType === 'sorting') {
            const working = [...arr];

            this.steps.push(createStep(working, `<strong>Initial State</strong>Start bubble sort on ${working.join(', ')}.`));

            for (let i = 0; i < working.length - 1; i++) {
                for (let j = 0; j < working.length - i - 1; j++) {
                    this.steps.push(createStep(working, `<strong>Comparing</strong>Comparing index ${j} (${working[j]}) with index ${j + 1} (${working[j + 1]}).`, { compareIndices: [j, j + 1] }));

                    if (working[j] > working[j + 1]) {
                        [working[j], working[j + 1]] = [working[j + 1], working[j]];
                        this.steps.push(createStep(working, `<strong>Swapping</strong>Swapped values at indices ${j} and ${j + 1}.`, { activeIndices: [j, j + 1] }));
                    }
                }
            }

            this.steps.push(createStep(working, '<strong>Done</strong>The array is fully sorted.', { doneIndices: working.map((_, index) => index) }));
            return;
        }

        if (this.algorithmType === 'two-pointers') {
            let left = 0;
            let right = arr.length - 1;

            this.steps.push(createStep(arr, `<strong>Initial State</strong>Start with left=${left} and right=${right}.`, { activeIndices: [left, right] }));

            while (left < right) {
                this.steps.push(createStep(arr, `<strong>Compare</strong>Checking left=${left} (${arr[left]}) and right=${right} (${arr[right]}).`, { compareIndices: [left, right] }));
                left += 1;
                right -= 1;

                this.steps.push(createStep(arr, `<strong>Move Pointers</strong>Move inward to left=${left} and right=${right}.`, {
                    activeIndices: left <= right ? [left, right] : [],
                }));
            }

            this.steps.push(createStep(arr, '<strong>Complete</strong>The pointers have met or crossed.', { doneIndices: arr.map((_, index) => index) }));
            return;
        }

        if (this.algorithmType === 'sliding-window') {
            let left = 0;
            let right = 0;
            const windowTarget = target ?? arr.reduce((sum, value) => sum + value, 0);
            let windowSum = arr[0] || 0;

            this.steps.push(createStep(arr, `<strong>Initial State</strong>Start with a window at index 0 and sum=${windowSum}.`, { windowRange: [0, 0], activeIndices: [0] }));

            while (right < arr.length) {
                this.steps.push(createStep(arr, `<strong>Expand Window</strong>Add index ${right} (${arr[right]}) to the current window.`, { windowRange: [left, right], activeIndices: [right] }));

                if (windowSum > windowTarget && left < right) {
                    windowSum -= arr[left];
                    left += 1;
                    this.steps.push(createStep(arr, `<strong>Shrink Window</strong>Window sum is too large, move left to ${left}.`, { windowRange: [left, right], activeIndices: [left - 1, right] }));
                }

                right += 1;
                if (right < arr.length) {
                    windowSum += arr[right];
                }
            }

            this.steps.push(createStep(arr, '<strong>Complete</strong>Finished scanning with the sliding window.', { doneIndices: arr.map((_, index) => index) }));
            return;
        }

        if (this.algorithmType === 'binary-search') {
            let low = 0;
            let high = arr.length - 1;

            this.steps.push(createStep(arr, `<strong>Initial State</strong>Start binary search with low=${low}, high=${high}.`, { activeIndices: [low, high] }));

            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                this.steps.push(createStep(arr, `<strong>Check Mid</strong>Compare low=${low}, mid=${mid} (${arr[mid]}), high=${high}.`, { compareIndices: [low, mid, high] }));

                if (target !== null && arr[mid] === target) {
                    this.steps.push(createStep(arr, `<strong>Found</strong>Value ${arr[mid]} matches target ${target}.`, { doneIndices: [mid] }));
                    return;
                }

                if (target !== null && arr[mid] < target) {
                    low = mid + 1;
                    this.steps.push(createStep(arr, `<strong>Move Right</strong>Target is larger, move low to ${low}.`, { activeIndices: low < arr.length ? [low] : [] }));
                } else {
                    high = mid - 1;
                    this.steps.push(createStep(arr, `<strong>Move Left</strong>Target is smaller, move high to ${high}.`, { activeIndices: high >= 0 ? [high] : [] }));
                }
            }

            this.steps.push(createStep(arr, '<strong>Complete</strong>Target was not found.', { doneIndices: [] }));
            return;
        }

        this.steps.push(createStep(arr, `<strong>Initial State</strong>The array is initialized from the problem example: ${arr.join(', ')}.`));

        for (let i = 0; i < arr.length; i++) {
            this.steps.push(createStep(arr, `<strong>Linear Scan</strong>Comparing index ${i} (value=${arr[i]}) with target ${target ?? 'unknown'}.`, { activeIndices: [i] }));
        }

        this.steps.push(createStep(arr, '<strong>Complete</strong>Finished scanning the array.', { doneIndices: arr.map((_, index) => index) }));
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
                if (step.doneIndices && step.doneIndices.includes(i)) {
                    return '#22c55e';
                }
                if (step.activeIndices && step.activeIndices.includes(i)) {
                    return 'var(--medium)';
                }
                if (step.compareIndices && step.compareIndices.includes(i)) {
                    return 'var(--hard)';
                }
                if (step.windowRange && i >= step.windowRange[0] && i <= step.windowRange[1]) {
                    return 'var(--primary)';
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
        return this.steps[this.currentStep]?.description || 'Loading algorithm steps...';
    }
}
