# AlgoLens

AlgoLens is a Data Structures and Algorithms (DSA) visualizer web app that allows users to find LeetCode problems and visualize their solutions step-by-step.

## Features
- **LeetCode Integration:** Search for problems by name, tag, or difficulty using LeetCode's GraphQL API.
- **Dynamic Visualizers:** Automatically detects the problem category and loads the appropriate D3.js visualizer (Array, Tree, Graph, Linked List, Matrix).
- **Playback Controls:** Play, pause, and step through algorithm executions with adjustable speed.
- **Dark Mode:** Sleek dark mode interface designed for developers.
- **Mobile Responsive:** Fully functional on mobile and desktop devices.

## Folder Structure
```
algolens/
├── index.html          # Main landing page with search
├── visualizer.html     # Problem visualization page
├── css/                # Stylesheets
│   ├── base.css        # Resets and variables
│   ├── layout.css      # Grid and flexbox layouts
│   ├── components.css  # UI components (cards, buttons, search)
│   └── visualizer.css  # Visualizer-specific styles
├── js/                 # JavaScript logic
│   ├── api.js          # LeetCode API service
│   ├── router.js       # Navigation and URL management
│   ├── search.js       # Search bar logic
│   ├── detector.js     # Category detection logic
│   ├── main.js         # Entry point for index.html
│   └── visualizers/    # D3.js visualizer implementations
│       ├── array.js
│       ├── tree.js
│       ├── graph.js
│       ├── linkedlist.js
│       └── matrix.js
├── assets/             # Static assets (images, icons)
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

## How to Run
Since this project uses vanilla HTML/CSS/JS with no build tools, you can run it using any static file server.

1. **Live Server (VS Code):** Right-click `index.html` and select "Open with Live Server".
2. **Python:** Run `python -m http.server` in the root directory.
3. **Node.js:** Run `npx serve` in the root directory.

Open your browser and navigate to `http://localhost:5500` (or the port provided by your server).

## Technologies Used
- HTML5 & CSS3
- Vanilla JavaScript (ES6+)
- [D3.js](https://d3js.org/) for data visualizations
- LeetCode GraphQL API
