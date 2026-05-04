export default class TreeVisualizer {
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
        const treeData = {
            name: "10",
            children: [
                {
                    name: "5",
                    children: [{ name: "2" }, { name: "7" }]
                },
                {
                    name: "15",
                    children: [{ name: "12" }, { name: "20" }]
                }
            ]
        };

        const hierarchy = d3.hierarchy(treeData);
        const treeLayout = d3.tree().size([this.width - 100, this.height - 100]);
        const root = treeLayout(hierarchy);
        
        const nodes = root.descendants();
        const links = root.links();

        this.steps.push({
            nodes: nodes.map(n => ({ ...n, active: false })),
            links: links,
            description: "<strong>Binary Search Tree</strong>Initial structure of the BST."
        });

        // Mock BFS traversal
        const queue = [nodes[0]];
        const visited = [];
        while (queue.length > 0) {
            const current = queue.shift();
            visited.push(current.data.name);
            
            this.steps.push({
                nodes: nodes.map(n => ({ ...n, active: visited.includes(n.data.name) })),
                links: links,
                description: `<strong>BFS Traversal</strong>Visiting node ${current.data.name}.`
            });

            if (current.children) {
                queue.push(...current.children);
            }
        }
    }

    render() {
        const step = this.steps[this.currentStep];
        const g = this.svg.selectAll('g.main').data([null]);
        const gEnter = g.enter().append('g').attr('class', 'main').attr('transform', 'translate(50, 50)');
        const mainG = gEnter.merge(g);

        // Links
        const links = mainG.selectAll('.link')
            .data(step.links);

        links.enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', 'var(--border-color)')
            .attr('stroke-width', 2)
            .merge(links)
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        // Nodes
        const nodes = mainG.selectAll('.node-group')
            .data(step.nodes, d => d.data.name);

        const nodesEnter = nodes.enter()
            .append('g')
            .attr('class', 'node-group')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        nodesEnter.append('circle')
            .attr('r', 20)
            .attr('fill', 'var(--card-bg)')
            .attr('stroke', 'var(--primary)')
            .attr('stroke-width', 2);

        nodesEnter.append('text')
            .attr('dy', 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'var(--text-color)')
            .text(d => d.data.name);

        nodesEnter.merge(nodes)
            .select('circle')
            .transition()
            .duration(300)
            .attr('fill', d => d.active ? 'var(--primary)' : 'var(--card-bg)');

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
