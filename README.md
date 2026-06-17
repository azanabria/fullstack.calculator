# 🧮 Full-Stack Calculator

A production-quality calculator application with a **React** frontend and a **Go** backend REST API, fully containerized with Docker.

![Architecture](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-Go%201.22-00ADD8?style=flat-square&logo=go)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Frontend (React)  │  HTTP   │   Backend (Go)      │
│                     │────────▶│                     │
│  • Vite + React 18  │  :8080  │  • Chi Router       │
│  • Glassmorphism UI │         │  • Calculator Svc   │
│  • Vanilla CSS      │         │  • Input Validation │
│  • nginx (prod)     │         │  • Error Handling   │
└─────────────────────┘         └─────────────────────┘
       :3000                           :8080
```

## Features

### Calculator Operations
| Operation | Symbol | Example | API Operation |
|-----------|--------|---------|---------------|
| Addition | + | 10 + 5 = 15 | `add` |
| Subtraction | − | 10 − 3 = 7 | `subtract` |
| Multiplication | × | 4 × 3 = 12 | `multiply` |
| Division | ÷ | 15 ÷ 3 = 5 | `divide` |
| Exponentiation | xʸ | 2 ^ 3 = 8 | `power` |
| Square Root | √ | √16 = 4 | `sqrt` |
| Percentage | % | 50% of 200 = 100 | `percentage` |

### UI
- 🌙 Dark theme with glassmorphism design
- ✨ Smooth micro-animations
- 📱 Responsive / mobile-friendly
- ⚠️ Inline error handling

---

## Getting Started

### Prerequisites
- **Local dev**: [Go 1.22+](https://go.dev/dl/), [Node.js 20+](https://nodejs.org/)
- **Docker**: [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

---

### Option 1: Docker Compose (Recommended)

Run the full stack with a single command:

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8080](http://localhost:8080)

### Option 2: Individual Containers

**Backend only:**
```bash
docker build -t calc-api ./server
docker run -p 8080:8080 calc-api
```

**Frontend only:**
```bash
docker build -t calc-web ./client
docker run -p 3000:3000 calc-web
```

### Option 3: Local Development

**Backend:**
```bash
cd server
go mod tidy
go run .
# API running at http://localhost:8080
```

**Frontend:**
```bash
cd client
npm install
npm run dev
# UI running at http://localhost:5173
```

---

## API Documentation

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-17T17:00:00Z"
}
```

### Calculate

```
POST /api/calculate
Content-Type: application/json
```

**Request body:**
```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

> `b` is optional for `sqrt` operation.

**Success response (200):**
```json
{
  "success": true,
  "result": 15,
  "operation": "add",
  "expression": "10 + 5 = 15"
}
```

**Error response (400):**
```json
{
  "success": false,
  "error": "Division by zero is not allowed"
}
```

### Examples with curl

```bash
# Addition
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "add", "a": 10, "b": 5}'

# Division by zero (error case)
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "divide", "a": 10, "b": 0}'

# Square root
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "sqrt", "a": 16}'

# Percentage (50% of 200)
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "percentage", "a": 200, "b": 50}'
```

---

## Testing

### Backend (Go)

Run standard unit tests:
```bash
cd server
go test ./... -v
```

Generate and view test coverage:
```bash
cd server
go test -coverprofile coverage.out ./...
go tool cover -html=coverage.out
```

### Frontend (React)

Run standard unit tests (interactive watch mode):
```bash
cd client
npm run test:watch
```

Run unit tests once:
```bash
cd client
npm test
```

Generate test coverage report:
```bash
cd client
npm run test:coverage
```

---

## Project Structure

```
fullstack.calculator/
├── docker-compose.yml          # Orchestrates both services
├── README.md                   # This file
├── server/                     # Go backend
│   ├── main.go                 # Server entrypoint
│   ├── go.mod                  # Go module
│   ├── Dockerfile              # Backend container
│   └── internal/
│       ├── model/types.go      # Request/response structs
│       ├── service/
│       │   ├── calculator.go   # Business logic
│       │   └── calculator_test.go
│       ├── validator/
│       │   └── validator.go    # Input validation
│       └── handler/
│           ├── calculator.go   # HTTP handlers
│           └── calculator_test.go
└── client/                     # React frontend
    ├── src/
    │   ├── App.jsx             # App shell
    │   ├── index.css           # Design system
    │   ├── App.css             # Calculator styles
    │   ├── components/         # UI components
    │   ├── services/api.js     # API client
    │   └── utils/validation.js # Input validation
    ├── Dockerfile              # Frontend container
    └── nginx.conf              # Production server config
```

---

## Design Rationale

### Why Go for the Backend?
- **Performance**: Compiled binary with minimal resource usage (~15MB Docker image)
- **Type safety**: Compile-time error catching for request/response handling
- **Standard library**: `net/http` + `encoding/json` cover most needs; chi adds minimal routing sugar
- **Concurrency**: Built-in goroutine support for future scaling

### Why Separate Microservices?
- **Independent deployment**: Update frontend or backend without touching the other
- **Technology flexibility**: Each service uses the best tool for its job
- **Scalability**: Scale API independently from the static frontend
- **Testability**: Each service has its own test suite running in isolation

### Architecture Decisions
- **Service layer pattern** (backend): Pure calculation functions are separated from HTTP concerns, making them trivially testable
- **Single API endpoint**: `POST /api/calculate` with an operation discriminator keeps the API simple while supporting extensibility
- **Client-side validation**: Catches obvious errors before hitting the network, improving UX
- **nginx reverse proxy**: In production, the frontend container proxies `/api/*` to the backend, avoiding CORS in deployed environments
