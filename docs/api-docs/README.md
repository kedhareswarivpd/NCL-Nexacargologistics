# NexaCargo Visual API Documentation

## Viewing the Documentation

Open the HTML file in your browser to see visual diagrams for every API endpoint:

```
docs/api-docs/index.html
```

Each endpoint includes:
- **Flow diagrams** showing request/response path
- **Sequence diagrams** for multi-step operations
- **Color-coded methods** (GET=blue, POST=green, PATCH=orange, DELETE=red, WS=teal)
- **Auth badges** (PUBLIC=green, AUTH=red, STAFF=blue, ADMIN=purple)
- **Request/response examples**

## Running Locally

```bash
# Navigate to the project directory
cd NCL-Nexacargologistics

# Open the documentation
start docs/api-docs/index.html    # Windows
open docs/api-docs/index.html     # macOS
xdg-open docs/api-docs/index.html # Linux
```

## API Base URL

```
Production: https://ncl-nexacargologistics-3.onrender.com/api/v1
Local: http://127.0.0.1:8000/api/v1
```

## Authentication

All endpoints (except auth and public tracking) require:
```
Authorization: Bearer <access_token>
```

## Total Endpoints: ~150 across 18 modules
