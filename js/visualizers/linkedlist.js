export default class LinkedListVisualizer {
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

        // Define arrowhead marker
        this.svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 5)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', 'var(--border-color)')
            .style('stroke', 'none');

        this.generateSteps();
        this.render();
    }

    generateSteps() {
        const values = [10, 20, 30, 40, 50];
        
        this.steps.push({
            nodes: values.map((v, i) => ({ id: i, val: v, active: false })),
            description: "<strong>Linked List</strong>A singly linked list with 5 nodes."
        });

        for (let i = 0; i < values.length; i++) {
            this.steps.push({
                nodes: values.map((v, j) => ({ id: j, val: v, active: j <= i })),
                description: `<strong>Traversing</strong>Currently at node with value ${values[i]}.`
            });
        }
    }

    render() {
        const step = this.steps[this.currentStep];
        const nodeWidth = 80;
        const nodeHeight = 50;
        const gap = 40;

        const mainG = this.svg.selectAll('g.main').data([null]).enter().append('g').attr('class', 'main').merge(this.svg.selectAll('g.main'));

        // Arrows
        const arrows = mainG.selectAll('.arrow')
            .data(step.nodes.slice(0, -1));

        arrows.enter()
            .append('line')
            .attr('class', 'arrow')
            .attr('stroke', 'var(--border-color)')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrowhead)')
            .merge(arrows)
            .attr('x1', (d, i) => 100 + i * (nodeWidth + gap) + nodeWidth)
            .attr('y1', this.height / 2)
            .attr('x2', (d, i) => 100 + (i + 1) * (nodeWidth + gap))
            .attr('y2', this.height / 2);

        // Nodes
        const nodes = mainG.selectAll('.node-group')
            .data(step.nodes, d => d.id);

        const nodesEnter = nodes.enter()
            .append('g')
            .attr('class', 'node-group')
            .attr('transform', (d, i) => `translate(${100 + i * (nodeWidth + gap)}, ${this.height / 2 - nodeHeight / 2})`);

        nodesEnter.append('rect')
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .attr('rx', 8)
            .attr('stroke', 'var(--primary)')
            .attr('stroke-width', 2);

        nodesEnter.append('text')
            .attr('x', nodeWidth / 2)
            .attr('y', nodeHeight / 2 + 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--text-color)')
            .text(d => d.val);

        nodesEnter.merge(nodes)
            .select('rect')
            .transition()
            .duration(300)
            .attr('fill', d => d.active ? 'var(--primary)' : 'var(--card-bg)');

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
