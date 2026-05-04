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

function parseExampleTree(content) {
    const text = stripHtml(content);
    // Look for array in Example 1, then fallback to first array
    const exampleMatch = text.match(/Example\s*1:[\s\S]*?\[([^\]]+)\]/i);
    const match = exampleMatch || text.match(/\[([^\]]+)\]/);

    if (!match) {
        return [];
    }

    const values = match[1].split(',').map((v) => {
        const trimmed = v.trim();
        if (trimmed.toLowerCase() === 'null') {
            return null;
        }
        const num = Number(trimmed);
        return Number.isFinite(num) ? num : null;
    });

    return values;
}

function buildTreeFromArray(arr) {
    if (!arr || arr.length === 0) {
        return null;
    }

    const nodes = [];
    const nodeMap = new Map();

    // Create all nodes with their values
    arr.forEach((value, idx) => {
        if (value !== null) {
            const node = {
                id: idx,
                value: value,
                children: [],
                parent: null,
            };
            nodes.push(node);
            nodeMap.set(idx, node);
        }
    });

    // Build parent-child relationships using BFS indices
    arr.forEach((value, idx) => {
        if (value !== null) {
            const leftChildIdx = 2 * idx + 1;
            const rightChildIdx = 2 * idx + 2;

            const node = nodeMap.get(idx);

            if (leftChildIdx < arr.length && nodeMap.has(leftChildIdx)) {
                const leftChild = nodeMap.get(leftChildIdx);
                node.children.push(leftChild);
                leftChild.parent = node;
            }

            if (rightChildIdx < arr.length && nodeMap.has(rightChildIdx)) {
                const rightChild = nodeMap.get(rightChildIdx);
                node.children.push(rightChild);
                rightChild.parent = node;
            }
        }
    });

    // Return root (index 0 if it exists)
    return nodeMap.get(0) || null;
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

function detectTraversalType(problem, options) {
    const tagNames = getTagNames(problem, options);

    if (tagNames.some((tag) => tag.includes('binary-search-tree') || tag.includes('bst'))) {
        return 'inorder';
    }

    if (tagNames.some((tag) => tag.includes('depth-first-search') || tag.includes('dfs'))) {
        return 'preorder';
    }

    if (tagNames.some((tag) => tag.includes('breadth-first-search') || tag.includes('bfs'))) {
        return 'level-order';
    }

    // Default: preorder
    return 'preorder';
}

function createTreeStep(tree, visitedIds, currentId, description) {
    return {
        tree: tree,
        visitedIds: [...visitedIds],
        currentId: currentId,
        description: description,
    };
}

// Traversal generators
function generateInorderSteps(root) {
    const steps = [];
    const visited = [];
    const nodeMap = new Map();

    // Build a node value lookup map
    function buildMap(node) {
        if (!node) return;
        nodeMap.set(node.id, node);
        node.children.forEach(buildMap);
    }

    buildMap(root);

    function inorder(node) {
        if (!node) return;

        // Visit left subtree
        inorder(node.children[0]);

        // Visit node
        visited.push(node.id);
        steps.push(createTreeStep(root, visited, node.id, `Visiting node ${node.value} (inorder traversal)`));

        // Visit right subtree
        inorder(node.children[1]);
    }

    steps.push(createTreeStep(root, [], null, '<strong>Initial State</strong> Start inorder traversal (left, root, right).'));
    inorder(root);

    const values = visited.map((id) => nodeMap.get(id)?.value || '?');
    steps.push(createTreeStep(root, visited, null, `<strong>Complete</strong> Finished inorder traversal. Order: ${values.join(', ')}`));

    return steps;
}

function generatePreorderSteps(root) {
    const steps = [];
    const visited = [];
    const nodeMap = new Map();

    function buildMap(node) {
        if (!node) return;
        nodeMap.set(node.id, node);
        node.children.forEach(buildMap);
    }

    buildMap(root);

    function preorder(node) {
        if (!node) return;

        // Visit node first
        visited.push(node.id);
        steps.push(createTreeStep(root, visited, node.id, `Visiting node ${node.value} (preorder traversal)`));

        // Visit children
        preorder(node.children[0]);
        preorder(node.children[1]);
    }

    steps.push(createTreeStep(root, [], null, '<strong>Initial State</strong> Start preorder traversal (root, left, right).'));
    preorder(root);

    const values = visited.map((id) => nodeMap.get(id)?.value || '?');
    steps.push(createTreeStep(root, visited, null, `<strong>Complete</strong> Finished preorder traversal. Order: ${values.join(', ')}`));

    return steps;
}

function generateLevelOrderSteps(root) {
    const steps = [];
    const visited = [];
    const nodeMap = new Map();
    const queue = [root];
    const levelMap = new Map();
    levelMap.set(root.id, 0);

    function buildMap(node) {
        if (!node) return;
        nodeMap.set(node.id, node);
        node.children.forEach(buildMap);
    }

    buildMap(root);

    steps.push(createTreeStep(root, [], null, '<strong>Initial State</strong> Start level-order traversal (breadth-first).'));

    let currentLevel = 0;
    while (queue.length > 0) {
        const node = queue.shift();
        const level = levelMap.get(node.id);

        if (level > currentLevel) {
            currentLevel = level;
            steps.push(createTreeStep(root, visited, null, `<strong>Level ${currentLevel}</strong> Processing level ${currentLevel}.`));
        }

        visited.push(node.id);
        steps.push(createTreeStep(root, visited, node.id, `Visiting node ${node.value} at level ${level}`));

        node.children.forEach((child) => {
            levelMap.set(child.id, level + 1);
            queue.push(child);
        });
    }

    const values = visited.map((id) => nodeMap.get(id)?.value || '?');
    steps.push(createTreeStep(root, visited, null, `<strong>Complete</strong> Finished level-order traversal. Order: ${values.join(', ')}`));

    return steps;
}

export default class TreeVisualizer {
    constructor() {
        this.container = null;
        this.svg = null;
        this.width = 0;
        this.height = 0;
        this.tree = null;
        this.problem = null;
        this.slug = '';
        this.traversalType = 'preorder';
        this.currentStep = 0;
        this.steps = [];
        this.isPlaying = false;
        this.speed = 1000;
        this.timer = null;
        this.onUpdate = null;
        this.g = null; // Group for tree elements
    }

    init(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.slug = options.slug || '';
        this.problem = getProblemFromCache(this.slug);
        this.traversalType = detectTraversalType(this.problem, options);

        // Parse tree from problem content
        if (this.problem && this.problem.content) {
            const arr = parseExampleTree(this.problem.content);
            this.tree = buildTreeFromArray(arr);
        }

        // Fallback tree if parsing fails
        if (!this.tree) {
            const fallbackArr = [1, 2, 3, 4, 5, 6, 7];
            this.tree = buildTreeFromArray(fallbackArr);
        }

        this.svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);

        // Create a group for the tree (for zoom/pan in future)
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.width / 2}, 50)`);

        this.steps = [];
        this.currentStep = 0;
        this.generateSteps();
        this.render();
    }

    generateSteps() {
        if (!this.tree) {
            return;
        }

        if (this.traversalType === 'inorder') {
            this.steps = generateInorderSteps(this.tree);
        } else if (this.traversalType === 'level-order') {
            this.steps = generateLevelOrderSteps(this.tree);
        } else {
            // Default: preorder
            this.steps = generatePreorderSteps(this.tree);
        }
    }

    render() {
        const step = this.steps[this.currentStep];
        if (!step || !step.tree) {
            return;
        }

        // Clear previous elements
        this.g.selectAll('.node').remove();
        this.g.selectAll('.link').remove();

        // Build hierarchy from tree structure
        const root = d3.hierarchy(step.tree, (d) => d.children);

        // Compute tree layout
        const treeLayout = d3.tree().size([this.width - 100, this.height - 100]);
        treeLayout(root);

        const nodeRadius = 30;

        // Draw links
        this.g.selectAll('.link')
            .data(root.links())
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y)
            .attr('stroke', 'var(--text-color)')
            .attr('stroke-width', 2)
            .attr('opacity', 0.3);

        // Draw nodes
        const nodes = this.g.selectAll('.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d) => `translate(${d.x},${d.y})`);

        // Node circles
        nodes.append('circle')
            .attr('r', nodeRadius)
            .attr('fill', (d) => {
                if (step.currentId === d.data.id) {
                    // Current node being visited
                    return 'var(--medium)';
                }
                if (step.visitedIds.includes(d.data.id)) {
                    // Already visited
                    return '#22c55e';
                }
                // Not yet visited
                return 'var(--primary)';
            })
            .attr('stroke', 'var(--text-color)')
            .attr('stroke-width', 2);

        // Node values (text)
        nodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.3em')
            .attr('fill', 'var(--bg-color)')
            .style('font-weight', 'bold')
            .style('font-size', '14px')
            .text((d) => d.data.value);

        // Update step description
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
        return this.steps[this.currentStep]?.description || 'Loading tree traversal steps...';
    }
}
