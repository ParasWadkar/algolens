export default class ArrayVisualizer {
    constructor() {
        this.container = null;
        this.svg = null;
        this.width = 0;
        this.height = 0;
        this.data = [45, 12, 89, 34, 67, 23, 56, 90, 11];
        this.currentStep = 0;
        this.steps = [];
        this.isPlaying = false;
        this.speed = 1000;
        this.timer = null;
        this.onUpdate = null;
    }

    init(containerId) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);

        this.generateSteps();
        this.render();
    }

    generateSteps() {
        // Mock steps for demonstration (e.g. Bubble Sort)
        let arr = [...this.data];
        this.steps.push({
            arr: [...arr],
            highlight: [],
            description: "<strong>Initial State</strong>The array is initialized with random values."
        });

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                this.steps.push({
                    arr: [...arr],
                    highlight: [j, j + 1],
                    description: `<strong>Comparing</strong>Comparing elements at index ${j} (${arr[j]}) and ${j+1} (${arr[j+1]}).`
                });

                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    this.steps.push({
                        arr: [...arr],
                        highlight: [j, j + 1],
                        description: `<strong>Swapping</strong>${arr[j+1]} is greater than ${arr[j]}, so we swap them.`
                    });
                }
            }
        }

        this.steps.push({
            arr: [...arr],
            highlight: [],
            description: "<strong>Sorted!</strong>The array has been successfully sorted."
        });
    }

    render() {
        const step = this.steps[this.currentStep];
        const barWidth = (this.width - 100) / step.arr.length;
        const maxVal = Math.max(...this.data);
        const scale = (this.height - 100) / maxVal;

        const bars = this.svg.selectAll('.bar')
            .data(step.arr, (d, i) => i);

        // Enter
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

        // Update
        const update = enter.merge(bars);

        update.transition()
            .duration(300)
            .attr('transform', (d, i) => `translate(${50 + i * barWidth}, ${this.height - 50 - d * scale})`);

        update.select('rect')
            .transition()
            .duration(300)
            .attr('height', d => d * scale)
            .attr('fill', (d, i) => step.highlight.includes(i) ? 'var(--hard)' : 'var(--primary)');

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
        return this.steps[this.currentStep].description;
    }
}
