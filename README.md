# AlgoLens

> Visualize LeetCode problems step-by-step — no setup, no login, just clarity.

AlgoLens is a zero-friction DSA visualizer that connects you to real LeetCode problems and animates their solutions in real time. Search by name, tag, or difficulty; the app detects the algorithm type and renders an interactive step-by-step walkthrough. Built for developers who want to understand algorithms, not memorize solutions.

## Live Demo

[Coming soon — deploying to Cloudflare Pages]

## Features

- **Search LeetCode problems** by name, tag, or difficulty
- **Auto-detects algorithm type** from problem tags
- **Step-by-step animated visualizations** (array, tree)
- **Play / pause / speed controls** for playback
- **Dark & light mode** with persistence
- **Fully mobile responsive** (320px–768px tested)
- **No backend** — runs entirely in the browser
- **localStorage caching** for instant repeat loads

## Visualizers

| Type | Algorithms | Status |
|------|-----------|--------|
| Array | Linear scan, two pointers, sliding window, binary search, bubble sort | ✅ Live |
| Tree | Inorder, preorder, BFS level-order | ✅ Live |
| Graph | BFS, DFS | 🔜 Coming soon |
| Linked List | Traversal, reversal | 🔜 Coming soon |
| Matrix | BFS flood fill, DFS path | 🔜 Coming soon |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Visualizations | D3.js (CDN) |
| API | [alfa-leetcode-api.onrender.com](https://github.com/alfaArghya/leetcode-api) |
| Caching | localStorage |
| Hosting | Cloudflare Pages |

## Getting Started

### Run Locally

```bash
git clone https://github.com/ParasWadkar/algolens.git
cd algolens
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

**No installation, no dependencies.** Just a Python HTTP server and you're done.

## Project Structure

```
algolens/
├── index.html              # Homepage with search & problem grid
├── visualizer.html         # Single-problem visualization page
├── GEMINI.md              # AI-generated project notes
├── css/
│   ├── base.css           # CSS variables, animations, universal touch targets
│   ├── layout.css         # Container, header, responsive grid (3-2-1 cols)
│   ├── components.css     # Cards, badges, buttons, search, tags
│   └── visualizer.css     # Canvas area, side panel, controls, responsive breakpoints
├── js/
│   ├── api.js             # Fetch & cache problem data (60-min TTL)
│   ├── main.js            # Homepage: render cards, wire search, show skeletons/errors
│   ├── search.js          # Debounced search input handler
│   ├── router.js          # Parse URL params, load problem, initialize visualizer
│   ├── detector.js        # Map problem tags to visualizer category
│   ├── theme.js           # Dark/light theme toggle with localStorage persistence
│   └── visualizers/       # Algorithm-specific D3.js implementations
│       ├── array.js       # Generic array visualizer with algo type detection
│       ├── tree.js        # Binary tree with traversal animations (inorder/preorder/level-order)
│       ├── graph.js       # Placeholder for graph traversal (BFS/DFS)
│       ├── linkedlist.js  # Placeholder for linked list operations
│       └── matrix.js      # Placeholder for matrix algorithms
└── README.md              # This file
```

## How It Works

When you search for a problem, AlgoLens fetches the full problem description from the REST API, parses example inputs from the HTML content, and caches it for 60 minutes. The detector analyzes problem tags (e.g., "array", "tree", "binary search") to select the appropriate visualizer module. The visualizer generates a sequence of steps by parsing the example, detects the algorithm subtype (e.g., two-pointer vs. sliding window for arrays), renders each step with D3.js, and lets you animate through with play/pause/speed controls. All data stays in localStorage — reload and it's instant.

## Related Projects

- [FormBridge2-Tally](https://github.com/ParasWadkar/FormBridge2-Tally) by [@ParasWadkar](https://github.com/ParasWadkar) — Tally form to HTML/PDF converter

## License

MIT
