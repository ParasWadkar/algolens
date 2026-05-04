export default class GraphVisualizer {
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
        const nodes = [
            { id: 'A', x: 100, y: 100 },
            { id: 'B', x: 300, y: 100 },
            { id: 'C', x: 200, y: 250 },
            { id: 'D', x: 400, y: 250 },
            { id: 'E', x: 300, y: 400 }
        ];

        const links = [
            { source: 'A', target: 'B' },
            { source: 'B', target: 'C' },
            { source: 'A', target: 'C' },
            { source: 'B', target: 'D' },
            { source: 'C', target: 'E' },
            { source: 'D', target: 'E' }
        ];

        this.steps.push({
            nodes: nodes.map(n => ({ ...n, color: 'var(--card-bg)' })),
            links: links.map(l => ({ ...l, color: 'var(--border-color)' })),
            description: "<strong>Graph Visualizer</strong>A simple undirected graph."
        });

        // Mock Dijkstra/BFS
        const sequence = ['A', 'B', 'C', 'D', 'E'];
        for (let i = 0; i < sequence.length; i++) {
            this.steps.push({
                nodes: nodes.map(n => ({ 
                    ...n, 
                    color: sequence.slice(0, i + 1).includes(n.id) ? 'var(--primary)' : 'var(--card-bg)' 
                })),
                links: links,
                description: `<strong>Visiting Node ${sequence[i]}</strong>Exploring connections from ${sequence[i]}.`
            });
        }
    }

    render() {
        const step = this.steps[this.currentStep];
        const g = this.svg.selectAll('g.main').data([null]);
        const mainG = g.enter().append('g').attr('class', 'main').merge(g);

        // Links
        const links = mainG.selectAll('.link')
            .data(step.links);

        links.enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke-width', 2)
            .merge(links)
            .attr('x1', d => step.nodes.find(n => n.id === d.source).x)
            .attr('y1', d => step.nodes.find(n => n.id === d.source).y)
            .attr('x2', d => step.nodes.find(n => n.id === d.target).x)
            .attr('y2', d => step.nodes.find(n => n.id === d.target).y)
            .attr('stroke', d => d.color);

        // Nodes
        const nodes = mainG.selectAll('.node-group')
            .data(step.nodes, d => d.id);

        const nodesEnter = nodes.enter()
            .append('g')
            .attr('class', 'node-group')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        nodesEnter.append('circle')
            .attr('r', 25)
            .attr('stroke', 'var(--primary)')
            .attr('stroke-width', 2);

        nodesEnter.append('text')
            .attr('dy', 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--text-color)')
            .text(d => d.id);

        nodesEnter.merge(nodes)
            .select('circle')
            .transition()
            .duration(300)
            .attr('fill', d => d.color);

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
