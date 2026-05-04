function normalizeTagName(tag) {
    return String(tag || '')
        .toLowerCase()
        .replace(/[_\s]+/g, '-');
}

const detector = {
    detectCategory(tags) {
        const tagNames = tags.map(tag => {
            const name = tag.name || tag.slug || '';
            return normalizeTagName(name);
        });
        
        // Tree detection (binary tree, BST, tree traversal)
        if (tagNames.some(t => 
            t.includes('tree') || 
            t.includes('bst') || 
            t.includes('binary-search-tree') ||
            t.includes('trie')
        )) {
            return 'tree';
        }
        
        // Array detection
        if (tagNames.some(t => 
            t.includes('array') || 
            t.includes('sort') || 
            t.includes('sliding-window') ||
            t.includes('two-pointers') ||
            t.includes('binary-search')
        )) {
            return 'array';
        }
        
        // Graph detection
        if (tagNames.some(t => 
            t.includes('graph') || 
            t.includes('shortest-path') || 
            t.includes('topological-sort') ||
            t.includes('dfs') ||
            t.includes('bfs')
        )) {
            return 'graph';
        }
        
        // Linked list detection
        if (tagNames.some(t => t.includes('linked-list'))) {
            return 'linkedlist';
        }
        
        // Matrix detection
        if (tagNames.some(t => t.includes('matrix') || t.includes('grid'))) {
            return 'matrix';
        }
        
        return 'array'; // Default
    }
};

export default detector;
