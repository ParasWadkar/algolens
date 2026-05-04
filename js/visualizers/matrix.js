export default class MatrixVisualizer {
    constructor() {
        this.container = null;
        this.svg = null;
        this.width = 0;
        this.height = 0;
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
        const matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ];

        this.steps.push({
            matrix: matrix.map(row => row.map(val => ({ val, active: false }))),
            description: "<strong>Matrix (2D Array)</strong>A 3x3 grid initialized with values."
        });

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                this.steps.push({
                    matrix: matrix.map((row, r) => row.map((val, c) => ({ 
                        val, 
                        active: r === i && c === j,
                        visited: r < i || (r === i && c <= j)
                    }))),
                    description: `<strong>Traversing</strong>Visiting cell [${i}, ${j}] with value ${matrix[i][j]}.`
                });
            }
        }
    }

    render() {
        const step = this.steps[this.currentStep];
        const cellSize = 60;
        const startX = (this.width - cellSize * 3) / 2;
        const startY = (this.height - cellSize * 3) / 2;

        const mainG = this.svg.selectAll('g.main').data([null]).enter().append('g').attr('class', 'main').merge(this.svg.selectAll('g.main'));

        const rows = mainG.selectAll('.row')
            .data(step.matrix);

        const rowsEnter = rows.enter()
            .append('g')
            .attr('class', 'row')
            .attr('transform', (d, i) => `translate(${startX}, ${startY + i * cellSize})`);

        const cells = rowsEnter.merge(rows).selectAll('.cell')
            .data(d => d);

        const cellsEnter = cells.enter()
            .append('g')
            .attr('class', 'cell')
            .attr('transform', (d, i) => `translate(${i * cellSize}, 0)`);

        cellsEnter.append('rect')
            .attr('width', cellSize - 4)
            .attr('height', cellSize - 4)
            .attr('rx', 4)
            .attr('stroke', 'var(--border-color)')
            .attr('stroke-width', 1);

        cellsEnter.append('text')
            .attr('x', cellSize / 2)
            .attr('y', cellSize / 2 + 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--text-color)')
            .text(d => d.val);

        cellsEnter.merge(cells)
            .select('rect')
            .transition()
            .duration(300)
            .attr('fill', d => d.active ? 'var(--primary)' : (d.visited ? 'rgba(56, 189, 248, 0.2)' : 'var(--card-bg)'))
            .attr('stroke', d => d.active ? 'var(--primary)' : 'var(--border-color)');

        if (this.onUpdate) {
            this.onUpdate(step.description);
        }
    }

    next() {
        if (this.currentStep < this.steps.length - 1) { this.currentStep++; this.render(); }
        else this.pause();
    }

    prev() {
        if (this.currentStep > 0) { this.currentStep--; this.render(); }
    }

    togglePlay() {
        if (this.isPlaying) this.pause();
        else this.play();
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
        if (this.isPlaying) { this.pause(); this.play(); }
    }

    getStepDescription() {
        return this.steps[this.currentStep].description;
    }
}
