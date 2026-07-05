# SortForge

Visual sorting algorithm benchmark. Watch 15 algorithms race in real-time, write your own sort function, and compare performance across speed, memory, and operations.

## What it does

Picks a set of sorting algorithms, generates an array, runs them in parallel via Web Workers, and renders each algorithm's progress as animated bar visualizations. Results show time, memory, and operation counts. A built-in code editor lets you write custom sorts and benchmark them against the built-ins. Leaderboard tracks community submissions.

## Quick start

**Prerequisites**: Node.js 18+, Go 1.23+, npm

```bash
git clone https://github.com/Yxot/sortforge.git
cd sortforge
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

### Backend (leaderboard)
```bash
cd backend
go run .
# http://localhost:8080
```

> The frontend works standalone — sorting happens entirely in the browser via Web Workers. The Go backend is only needed for leaderboard submissions.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Editor | Monaco Editor |
| Workers | Web Workers (in-browser parallel sorting) |
| Backend | Go, net/http, SQLite |
| Canvas | HTML5 Canvas (no chart library) |

## Project structure

```
sortforge/
├── frontend/
│   └── src/
│       ├── algorithms/    # Sort implementations + registry + worker
│       ├── api/           # Backend API client
│       ├── components/    # React components
│       ├── styles/        # CSS (OKLCH design tokens)
│       ├── utils/         # Array generation, formatting, display names
│       └── types.ts       # Shared TypeScript types
└── backend/
    ├── main.go            # HTTP server entry point
    ├── handlers/          # API route handlers + CORS middleware
    ├── db/                # SQLite init + queries
    └── models/            # Go type definitions
```

## Algorithms

15 built-in algorithms across comparison and linear categories:

| Algorithm | Complexity | Stable |
|---|---|---|
| Bubble Sort | O(n²) | Yes |
| Selection Sort | O(n²) | No |
| Insertion Sort | O(n²) | Yes |
| Shell Sort | O(n log² n) | No |
| Quick Sort | O(n log n) | No |
| Merge Sort | O(n log n) | Yes |
| Heap Sort | O(n log n) | No |
| Tim Sort | O(n log n) | Yes |
| Cocktail Shaker Sort | O(n²) | Yes |
| Comb Sort | O(n²) | No |
| Gnome Sort | O(n²) | Yes |
| Counting Sort | O(n + k) | Yes |
| Radix Sort | O(nk) | Yes |
| Bucket Sort | O(n + k) | Yes |
| Bogo Sort | O((n+1)!) | No |

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/algorithms` | GET | List available algorithms |
| `/api/submissions` | POST | Submit benchmark result |
| `/api/leaderboard` | GET | Query submissions (sort, filter, paginate) |
| `/api/leaderboard/stats` | GET | Aggregate stats |

## Keyboard shortcuts

| Key | Action |
|---|---|
| Space | Run benchmark |
| 1 / 2 / 3 / 4 | Switch views |
| Ctrl+Enter | Run code in Playground |

## License

MIT
