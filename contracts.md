# AutoRate API Contracts

## API Base URL
`/api`

---

## Authentication Endpoints

### POST /api/auth/register
Register new user
```json
Request:
{
  "name": "string",
  "email": "string",
  "password": "string"
}

Response:
{
  "id": "string",
  "name": "string",
  "email": "string",
  "isAdmin": false,
  "favorites": [],
  "token": "jwt_token"
}
```

### POST /api/auth/login
```json
Request:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "id": "string",
  "name": "string",
  "email": "string",
  "isAdmin": boolean,
  "favorites": ["vehicle_ids"],
  "token": "jwt_token"
}
```

### GET /api/auth/me
Get current user (requires auth)
```json
Response:
{
  "id": "string",
  "name": "string",
  "email": "string",
  "isAdmin": boolean,
  "favorites": ["vehicle_ids"]
}
```

---

## Vehicle Endpoints

### GET /api/vehicles
List vehicles with filters
```
Query params: brand, segment, year, minScore, search, skip, limit

Response:
{
  "vehicles": [...],
  "total": number
}
```

### GET /api/vehicles/:id
Get vehicle details

### POST /api/vehicles (Admin only)
Create vehicle

### PUT /api/vehicles/:id (Admin only)
Update vehicle

### DELETE /api/vehicles/:id (Admin only)
Delete vehicle

---

## Favorites Endpoints

### POST /api/favorites/:vehicleId
Add to favorites (requires auth)

### DELETE /api/favorites/:vehicleId
Remove from favorites (requires auth)

### GET /api/favorites
Get user favorites (requires auth)

---

## Static Data Endpoints

### GET /api/brands
List all brands with models

### GET /api/segments
List all segments

---

## Mock Data to Replace

From `mock.js`:
- `mockVehicles` → MongoDB vehicles collection
- `brands` → MongoDB brands collection (static seed)
- `segments` → Hardcoded in backend
- User auth → MongoDB users collection + JWT

---

## Frontend Integration Points

1. `AuthContext.js` - Replace mock login/register with API calls
2. `VehiclesPage.jsx` - Fetch from /api/vehicles
3. `VehicleDetailPage.jsx` - Fetch from /api/vehicles/:id
4. `FavoritesPage.jsx` - Fetch from /api/favorites
5. `AdminPage.jsx` - CRUD operations via API

---

## Database Collections

### users
- id, name, email, password_hash, isAdmin, favorites[], createdAt

### vehicles
- id, brand, model, year, segment, image, specs, scores, strengths, weaknesses, bestFor, createdAt, updatedAt

### brands (seed data)
- id, name, country, models[]
