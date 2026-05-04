# AlgoLens — Project Context for Gemini CLI

## What is this project?
AlgoLens is a DSA visualizer web app. It fetches LeetCode problems via the
unofficial GraphQL API and renders interactive step-by-step visualizations
using D3.js. No frameworks, no build tools — pure HTML/CSS/JS.

## Stack
- Frontend: Vanilla HTML, CSS, JavaScript
- Visualizations: D3.js (loaded via CDN)
- Hosting: Cloudflare Pages (static)
- No backend, no package.json

## Folder Structure
algolens/
├── index.html
├── visualizer.html
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── visualizer.css
├── js/
│   ├── api.js          # LeetCode GraphQL fetch + localStorage cache
│   ├── router.js       # Client-side routing
│   ├── search.js       # Search + filter logic
│   ├── detector.js     # Tag parser → picks correct visualizer
│   └── main.js         # Entry point
├── js/visualizers/
│   ├── array.js
│   ├── tree.js
│   ├── graph.js
│   ├── linkedlist.js
│   └── matrix.js
├── GEMINI.md           # This file
├── .gitignore
└── README.md

## Current Status
- [x] Scaffold complete
- [ ] LeetCode API verified working (may need CORS proxy)
- [ ] Visualizer animations tested
- [ ] Deployed to Cloudflare Pages

## Known Issues to Fix
- LeetCode GraphQL API may fail due to browser CORS restrictions.
  Fix: route requests through https://cors-anywhere.herokuapp.com or
  use a Cloudflare Worker as a proxy.

## Conventions
- Commit messages follow Conventional Commits (feat:, fix:, chore:, docs:)
- No external dependencies except D3.js via CDN
- All API responses cached in localStorage with key prefix `algolens_`