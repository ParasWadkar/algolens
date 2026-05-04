const detector = {
    detectCategory(tags) {
        const tagNames = tags.map(tag => tag.name.toLowerCase());
        
        if (tagNames.some(t => t.includes('array') || t.includes('sort') || t.includes('sliding window'))) {
            return 'array';
        }
        if (tagNames.some(t => t.includes('tree') || t.includes('binary search tree') || t.includes('trie'))) {
            return 'tree';
        }
        if (tagNames.some(t => t.includes('graph') || t.includes('shortest path') || t.includes('topological sort'))) {
            return 'graph';
        }
        if (tagNames.some(t => t.includes('linked list'))) {
            return 'linkedlist';
        }
        if (tagNames.some(t => t.includes('matrix') || t.includes('grid'))) {
            return 'matrix';
        }
        
        return 'array'; // Default
    }
};

export default detector;
