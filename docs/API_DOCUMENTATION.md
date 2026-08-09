# NexaCargo API Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Architecture](#api-architecture)
4. [Endpoints](#endpoints)
   - [Auth](#auth-endpoints)
   - [Users](#users-endpoints)
   - [Admin](#admin-endpoints)
   - [Customers](#customers-endpoints)
   - [Quotes](#quotes-endpoints)
   - [Shipments](#shipments-endpoints)
   - [Tracking](#tracking-endpoints)
   - [Logistics](#logistics-endpoints)
   - [Drivers](#drivers-endpoints)
   - [Warehouse](#warehouse-endpoints)
   - [Finance](#finance-endpoints)
   - [Customs](#customs-endpoints)
   - [Insurance](#insurance-endpoints)
   - [Support](#support-endpoints)
   - [Notifications](#notifications-endpoints)
   - [Analytics](#analytics-endpoints)
   - [Reports](#reports-endpoints)
   - [Tasks](#tasks-endpoints)
   - [Dispatch](#dispatch-endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## 🔐 Overview {#overview}

### Base URL
```
Production: https://ncl-nexacargologistics-3.onrender.com/api/v1
Local: http://127.0.0.1:8000/api/v1
```

### Authentication
All endpoints (except auth and public tracking) require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Response Format
All responses follow this structure:

**Success:**
```json
{
  "id": "uuid",
  "field": "value",
  ...
}
```

**Error:**
```json
{
  "detail": "Human-readable error message"
}
```

---

## 🏗️ API Architecture {#api-architecture}

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Customer │ │Logistics │ │ Warehouse│ │  Admin   │  ...      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │             │            │            │                   │
│       └─────────────┴────────────┴────────────┘                   │
│                            │                                     │
│                    ┌───────▼───────┐                             │
│                    │  /api/proxy   │                             │
│                    └───────┬───────┘                             │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                    ┌───────▼───────┐                             │
│                    │   FastAPI     │                             │
│                    │   Backend     │                             │
│                    └───────┬───────┘                             │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────┐           │
│  │         ┌───────────────┼───────────────┐         │           │
│  │         │               │               │         │           │
│  │    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐    │           │
│  │    │  Auth   │    │  RBAC   │    │Logging  │    │           │
│  │    │Middleware│   │ Guards  │    │Middleware│   │           │
│  │    └────┬────┘    └────┬────┘    └────┬────┘    │           │
│  │         │               │               │         │           │
│  │         └───────────────┼───────────────┘         │           │
│  │                         │                         │           │
│  │    ┌────────────────────┼────────────────────┐    │           │
│  │    │                    │                    │    │           │
│  │    │  ┌─────────┐  ┌────▼────┐  ┌─────────┐ │    │           │
│  │    │  │  Auth   │  │  CRUD   │  │Notification│    │           │
│  │    │  │ Routes  │  │ Helpers │  │  Service  │ │    │           │
│  │    │  └─────────┘  └────┬────┘  └─────────┘ │    │           │
│  │    │                    │                    │    │           │
│  │    └────────────────────┼────────────────────┘    │           │
│  │                         │                         │           │
│  │    ┌────────────────────┼────────────────────┐    │           │
│  │    │                    │                    │    │           │
│  │    │  ┌─────────────────▼─────────────────┐  │    │           │
│  │    │  │        SQLAlchemy ORM             │  │    │           │
│  │    │  └─────────────────┬─────────────────┘  │    │           │
│  │    │                    │                    │    │           │
│  │    └────────────────────┼────────────────────┘    │           │
│  │                         │                         │           │
│  └─────────────────────────┼─────────────────────────┘           │
│                            │                                     │
│                    ┌───────▼───────┐                             │
│                    │   PostgreSQL  │                             │
│                    │   Database    │                             │
│                    └───────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Authentication {#authentication}

### Login Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client  │          │  FastAPI │          │ Supabase │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │  POST /auth/login   │                     │
     │────────────────────>│                     │
     │                     │  verify_password()  │
     │                     │─────┐               │
     │                     │     │               │
     │                     │<────┘               │
     │                     │                     │
     │  create_access_token()                    │
     │                     │─────┐               │
     │                     │     │               │
     │                     │<────┘               │
     │                     │                     │
     │  { access_token }   │                     │
     │<────────────────────│                     │
     │                     │                     │
```

---

## 📡 Endpoints {#endpoints}

---

### 🔓 Auth Endpoints {#auth-endpoints}

#### POST `/auth/login`

Authenticate a user and receive an access token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "phone": "+1234567890",
    "company": "Acme Inc",
    "status": "active"
  }
}
```

**Errors:**
- `401` - Invalid email or password
- `403` - Account not active

---

#### POST `/auth/register`

Register a new customer account.

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword123",
  "phone": "+1234567890",
  "company": "Acme Inc"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "jane@example.com",
    "name": "Jane Smith",
    "role": "customer"
  }
}
```

**Errors:**
- `409` - Email already registered
- `422` - Validation error

---

#### GET `/auth/me`

Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "customer",
  "status": "active"
}
```

---

#### POST `/auth/refresh-token`

Refresh the access token.

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": { ... }
}
```

---

#### POST `/auth/forgot-password`

Request a password reset link.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account exists for that email, a reset link has been sent."
}
```

---

#### POST `/auth/reset-password`

Reset password using token from email.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "newsecurepassword123"
}
```

**Response (200):**
```json
{
  "message": "Password has been reset. You can now log in."
}
```

---

#### POST `/auth/change-password`

Change password while authenticated.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully."
}
```

---

### 👥 Users Endpoints {#users-endpoints}

#### GET `/users`

List users (staff only). Supports filtering by role.

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff role

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `role` | string | Filter by role (e.g., "customer", "driver") |
| `staff_only` | boolean | Show only staff members |
| `skip` | int | Pagination offset (default: 0) |
| `limit` | int | Results per page (default: 200) |

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "status": "active",
    "branch_id": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

#### POST `/users`

Create a new staff member (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Request:**
```json
{
  "name": "New Staff",
  "email": "staff@example.com",
  "password": "securepassword123",
  "role": "logistics",
  "department": "Operations",
  "phone": "+1234567890",
  "branch_id": "550e8400-e29b-41d4-a716-446655440005"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "name": "New Staff",
  "email": "staff@example.com",
  "role": "logistics",
  "department": "Operations",
  "status": "active"
}
```

**Errors:**
- `409` - Email already exists
- `502` - Supabase not configured

---

#### GET `/users/{user_id}`

Get user details (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "status": "active"
}
```

---

#### PATCH `/users/{user_id}`

Update user details (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Request:**
```json
{
  "name": "Updated Name",
  "role": "logistics",
  "status": "suspended",
  "branch_id": "550e8400-e29b-41d4-a716-446655440005"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Name",
  "role": "logistics",
  "status": "suspended"
}
```

---

#### PATCH `/users/{user_id}/status`

Activate or suspend a user (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Request:**
```json
{
  "status": "suspended"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "suspended"
}
```

**Errors:**
- `400` - Cannot suspend own account

---

#### DELETE `/users/{user_id}`

Delete a user (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Response:** `204 No Content`

---

### 👑 Admin Endpoints {#admin-endpoints}

#### GET `/admin/dashboard`

Get high-level system overview (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Response (200):**
```json
{
  "users": 150,
  "customers": 120,
  "drivers": 15,
  "branches": 5,
  "shipments": 342,
  "shipments_in_transit": 45,
  "shipments_delivered": 280,
  "invoices": 298,
  "revenue": 1250000.00,
  "open_tickets": 12,
  "roles": 8
}
```

---

#### GET `/admin/analytics`

Get detailed system analytics (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Response (200):**
```json
{
  "users": {
    "total": 150,
    "by_role": {
      "admin": 2,
      "customer": 120,
      "driver": 15,
      "finance": 3,
      "logistics": 5,
      "warehouse": 3,
      "support": 2
    }
  },
  "shipments": {
    "total": 342,
    "active": 45,
    "delivered": 280
  },
  "support": {
    "open_tickets": 12
  },
  "finance": {
    "total_revenue": 1250000.00,
    "currency": "USD"
  }
}
```

---

#### GET `/admin/audit-logs`

View system audit logs (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `skip` | int | Pagination offset |
| `limit` | int | Results per page (default: 100) |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "actor_id": "uuid",
    "actor_email": "admin@example.com",
    "action": "user.created",
    "entity_type": "user",
    "entity_id": "uuid",
    "detail": "Created new staff member",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

#### GET `/admin/branches`

List all branches (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "New York HQ",
    "code": "NYC-01",
    "city": "New York",
    "country": "United States",
    "status": "active"
  }
]
```

---

#### POST `/admin/branches`

Create a new branch (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Request:**
```json
{
  "name": "Los Angeles Branch",
  "code": "LAX-01",
  "city": "Los Angeles",
  "country": "United States",
  "address": "123 Main St",
  "manager_id": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Los Angeles Branch",
  "code": "LAX-01",
  "city": "Los Angeles",
  "status": "active"
}
```

---

#### PATCH `/admin/branches/{branch_id}`

Update a branch (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Request:**
```json
{
  "name": "Updated Branch Name",
  "status": "inactive"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Branch Name",
  "status": "inactive"
}
```

---

#### DELETE `/admin/branches/{branch_id}`

Delete a branch (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Response:** `204 No Content`

---

#### GET `/admin/users`

List all users (admin view).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `role` | string | Filter by role |
| `skip` | int | Pagination offset |
| `limit` | int | Results per page |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "status": "active"
  }
]
```

---

#### GET `/admin/roles`

List all roles (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Response (200):**
```json
[
  {
    "id": "uuid",
    "key": "admin",
    "label": "Super Admin",
    "description": "Full system access",
    "is_system": true
  }
]
```

---

#### POST `/admin/roles`

Create a custom role (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Request:**
```json
{
  "key": "supervisor",
  "label": "Supervisor",
  "description": "Supervises warehouse operations"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "key": "supervisor",
  "label": "Supervisor",
  "is_system": false
}
```

---

#### PATCH `/admin/roles/{role_id}`

Update a role (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Request:**
```json
{
  "label": "Senior Supervisor",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "label": "Senior Supervisor"
}
```

---

#### DELETE `/admin/roles/{role_id}`

Delete a custom role (admin only). System roles cannot be deleted.

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Response:** `204 No Content`

**Errors:**
- `400` - System roles cannot be deleted

---

### 👤 Customers Endpoints {#customers-endpoints}

#### GET `/customers`

List customers (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Finance, Support

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search by name or email |
| `skip` | int | Pagination offset |
| `limit` | int | Results per page |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "company": "Acme Inc",
    "status": "active"
  }
]
```

---

#### POST `/customers`

Create a new customer (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Finance, Support

**Request:**
```json
{
  "name": "New Customer",
  "email": "customer@example.com",
  "password": "securepassword123",
  "company": "Acme Inc",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New Customer",
  "email": "customer@example.com",
  "role": "customer",
  "status": "active"
}
```

---

#### GET `/customers/{customer_id}`

Get customer details (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Finance, Support

**Response (200):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "company": "Acme Inc"
}
```

---

#### GET `/customers/{customer_id}/shipments`

Get customer's shipments (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Finance, Support

**Response (200):**
```json
[
  {
    "id": "uuid",
    "tracking_id": "SHP-ABC123",
    "status": "In Transit",
    "origin": "New York",
    "destination": "Los Angeles"
  }
]
```

---

#### GET `/customers/{customer_id}/invoices`

Get customer's invoices (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Finance, Support

**Response (200):**
```json
[
  {
    "id": "uuid",
    "invoice_no": "INV-XYZ789",
    "amount": 1500.00,
    "status": "Paid"
  }
]
```

---

#### PATCH `/customers/{customer_id}`

Update customer details (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Finance, Support

**Request:**
```json
{
  "name": "Updated Name",
  "company": "New Company",
  "status": "active"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "company": "New Company"
}
```

---

#### DELETE `/customers/{customer_id}`

Delete a customer (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Response:** `204 No Content`

---

### 📦 Quotes Endpoints {#quotes-endpoints}

#### GET `/quotes`

List quotes (customers see own, staff see all).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `skip` | int | Pagination offset |
| `limit` | int | Results per page |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "quote_ref": "QT-ABC123",
    "origin": "New York",
    "destination": "Los Angeles",
    "mode": "sea",
    "weight": 5000,
    "status": "quoted",
    "amount": 2500.00,
    "currency": "USD"
  }
]
```

---

#### POST `/quotes`

Create a new quote request.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "origin": "New York",
  "destination": "Los Angeles",
  "mode": "sea",
  "cargo_type": "general",
  "weight": 5000,
  "volume": 20.5,
  "incoterm": "FOB",
  "contact_name": "John Doe",
  "contact_email": "john@example.com",
  "contact_phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "quote_ref": "QT-ABC123",
  "origin": "New York",
  "destination": "Los Angeles",
  "mode": "sea",
  "amount": 2500.00,
  "status": "quoted",
  "currency": "USD"
}
```

---

#### POST `/quotes/calculate`

Calculate a price estimate without creating a quote.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "origin": "New York",
  "destination": "Los Angeles",
  "mode": "sea",
  "weight": 5000,
  "volume": 20.5,
  "cargo_type": "general"
}
```

**Response (200):**
```json
{
  "origin": "New York",
  "destination": "Los Angeles",
  "mode": "sea",
  "weight": 5000,
  "volume": 20.5,
  "currency": "USD",
  "amount": 2500.00,
  "breakdown": {
    "base": 80.0,
    "per_kg": 0.4,
    "per_cbm": 35.0
  }
}
```

---

#### GET `/quotes/{quote_id}`

Get quote details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "quote_ref": "QT-ABC123",
  "customer_id": "uuid",
  "origin": "New York",
  "destination": "Los Angeles",
  "mode": "sea",
  "amount": 2500.00,
  "status": "quoted"
}
```

---

#### PATCH `/quotes/{quote_id}`

Update quote (customers can only accept/reject own quotes).

**Headers:** `Authorization: Bearer <token>`

**Request (Customer):**
```json
{
  "status": "accepted"
}
```

**Request (Staff):**
```json
{
  "amount": 2750.00,
  "status": "quoted",
  "valid_until": "2024-02-15"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "amount": 2750.00,
  "status": "accepted"
}
```

---

#### POST `/quotes/{quote_id}/approve`

Accept a quote.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "accepted"
}
```

---

#### POST `/quotes/{quote_id}/reject`

Reject a quote.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "rejected"
}
```

---

#### DELETE `/quotes/{quote_id}`

Delete a quote.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

### 🚚 Shipments Endpoints {#shipments-endpoints}

#### GET `/shipments`

List shipments (customers see own, staff see all).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status_filter` | string | Filter by status |
| `skip` | int | Pagination offset |
| `limit` | int | Results per page |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "tracking_id": "SHP-ABC123",
    "customer_id": "uuid",
    "origin": "New York",
    "destination": "Los Angeles",
    "mode": "sea",
    "status": "In Transit",
    "eta": "2024-02-01"
  }
]
```

---

#### POST `/shipments`

Create a new shipment.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "origin": "New York",
  "destination": "Los Angeles",
  "mode": "sea",
  "cargo_type": "general",
  "weight": "5000 kg",
  "volume": "20.5 m³",
  "eta": "2024-02-01",
  "customer_id": "uuid",
  "quote_id": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "tracking_id": "SHP-XYZ789",
  "status": "Awaiting Dispatch"
}
```

---

#### GET `/shipments/{shipment_id}`

Get shipment details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "tracking_id": "SHP-ABC123",
  "customer_id": "uuid",
  "origin": "New York",
  "destination": "Los Angeles",
  "mode": "sea",
  "status": "In Transit",
  "lat": 34.0522,
  "lng": -118.2437,
  "eta": "2024-02-01"
}
```

---

#### PATCH `/shipments/{shipment_id}`

Update shipment details (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Warehouse, Customs, Driver

**Request:**
```json
{
  "status": "In Transit",
  "eta": "2024-02-05",
  "lat": 35.0,
  "lng": -115.0
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "In Transit"
}
```

---

#### DELETE `/shipments/{shipment_id}`

Delete a shipment (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Response:** `204 No Content`

---

#### POST `/shipments/{shipment_id}/status`

Update shipment status with history logging.

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Warehouse, Customs, Driver

**Request:**
```json
{
  "status": "In Transit",
  "note": "Departed origin port",
  "location": "Port of Los Angeles",
  "lat": 33.7395,
  "lng": -118.2610
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "In Transit"
}
```

---

#### POST `/shipments/{shipment_id}/cancel`

Cancel a shipment.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "Cancelled"
}
```

**Errors:**
- `400` - Cannot cancel Delivered/Cancelled shipment

---

#### GET `/shipments/{shipment_id}/tracking`

Get full tracking history.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "tracking_id": "SHP-ABC123",
  "status": "In Transit",
  "location": {"lat": 33.7395, "lng": -118.2610},
  "eta": "2024-02-01",
  "events": [
    {
      "id": "uuid",
      "status": "Dispatched",
      "note": "Left origin",
      "changed_at": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

#### GET `/shipments/{shipment_id}/history`

Get status history timeline.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "status": "Dispatched",
    "note": "Left origin",
    "changed_at": "2024-01-20T10:00:00Z"
  }
]
```

---

#### GET `/shipments/{shipment_id}/documents`

List shipment documents.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "doc_type": "invoice",
    "file_name": "invoice.pdf",
    "file_url": "https://..."
  }
]
```

---

#### POST `/shipments/{shipment_id}/documents`

Upload a document reference.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "doc_type": "invoice",
  "file_name": "invoice.pdf",
  "file_url": "https://storage.supabase.co/..."
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "doc_type": "invoice",
  "file_name": "invoice.pdf",
  "file_url": "https://..."
}
```

**Errors:**
- `400` - Invalid file URL (must be Supabase or localhost)

---

### 📍 Tracking Endpoints {#tracking-endpoints}

#### GET `/tracking/{tracking_id}` (Public)

Public tracking lookup by tracking number.

**No authentication required.**

**Response (200):**
```json
{
  "shipment": {
    "id": "uuid",
    "tracking_id": "SHP-ABC123",
    "origin": "New York",
    "destination": "Los Angeles",
    "status": "In Transit"
  },
  "events": [
    {
      "status": "Dispatched",
      "changed_at": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

#### GET `/tracking/shipment/{tracking_number}` (Public)

Public tracking by tracking number (newer endpoint).

**No authentication required.**

**Response (200):** Same as above.

---

#### GET `/tracking/shipment/{shipment_id}/location`

Get current shipment location (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "tracking_id": "SHP-ABC123",
  "status": "In Transit",
  "lat": 33.7395,
  "lng": -118.2610,
  "eta": "2024-02-01"
}
```

---

#### GET `/tracking/shipment/{shipment_id}/history`

Get location history (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "status": "Dispatched",
    "note": "Left origin",
    "changed_at": "2024-01-20T10:00:00Z"
  }
]
```

---

#### POST `/tracking/location-update`

Ingest a GPS location update (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Warehouse, Customs, Driver

**Request:**
```json
{
  "shipment_id": "uuid",
  "lat": 33.7395,
  "lng": -118.2610,
  "status": "In Transit",
  "note": "Arrived at checkpoint",
  "location": "Port of LA"
}
```

**Response (200):**
```json
{
  "tracking_id": "SHP-ABC123",
  "lat": 33.7395,
  "lng": -118.2610,
  "status": "In Transit"
}
```

---

#### WS `/tracking/live/{shipment_id}`

WebSocket for real-time tracking updates.

**Query:** `?token=<access_token>`

**Response Stream (every 5 seconds):**
```json
{
  "tracking_id": "SHP-ABC123",
  "status": "In Transit",
  "lat": 33.7395,
  "lng": -118.2610,
  "eta": "2024-02-01"
}
```

---

### 🚛 Logistics Endpoints {#logistics-endpoints}

#### GET `/logistics/containers`

List containers (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "container_no": "MSKU1234567",
    "type": "dry",
    "status": "Available",
    "capacity": "20ft"
  }
]
```

---

#### POST `/logistics/containers`

Create a container (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Request:**
```json
{
  "container_no": "MSKU1234567",
  "type": "dry",
  "capacity": "20ft"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "container_no": "MSKU1234567",
  "type": "dry",
  "status": "Available"
}
```

---

#### PATCH `/logistics/containers/{item_id}`

Update a container (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Request:**
```json
{
  "status": "In Use",
  "shipment_id": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "In Use"
}
```

---

#### DELETE `/logistics/containers/{item_id}`

Delete a container (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Response:** `204 No Content`

---

#### GET `/logistics/routes`

List routes (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "route_code": "RT-LAX-NYC",
    "origin": "Los Angeles",
    "destination": "New York",
    "status": "Active"
  }
]
```

---

#### POST `/logistics/routes`

Create a route (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Request:**
```json
{
  "route_code": "RT-LAX-NYC",
  "origin": "Los Angeles",
  "destination": "New York",
  "distance": "2800 miles",
  "duration": "5 days"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "route_code": "RT-LAX-NYC",
  "status": "Active"
}
```

---

#### PATCH `/logistics/routes/{item_id}`

Update a route (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Request:**
```json
{
  "status": "Completed",
  "driver_id": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "Completed"
}
```

---

#### DELETE `/logistics/routes/{item_id}`

Delete a route (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Response:** `204 No Content`

---

#### GET `/logistics/vehicles`

List vehicles (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "vehicle_no": "TRK-001",
    "type": "truck",
    "status": "Available"
  }
]
```

---

#### POST `/logistics/vehicles`

Create a vehicle (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Request:**
```json
{
  "vehicle_no": "TRK-001",
  "type": "truck",
  "capacity": "5000kg"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "vehicle_no": "TRK-001",
  "status": "Available"
}
```

---

#### PATCH `/logistics/vehicles/{item_id}`

Update a vehicle (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Request:**
```json
{
  "status": "In Use",
  "driver_id": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "In Use"
}
```

---

#### DELETE `/logistics/vehicles/{item_id}`

Delete a vehicle (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Response:** `204 No Content`

---

#### GET `/logistics/deliveries`

List deliveries (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "delivery_code": "DLV-001",
    "shipment_id": "uuid",
    "driver_id": "uuid",
    "status": "Pending"
  }
]
```

---

#### POST `/logistics/deliveries`

Create a delivery (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Request:**
```json
{
  "shipment_id": "uuid",
  "driver_id": "uuid",
  "route_id": "uuid",
  "vehicle_id": "uuid",
  "eta": "2024-02-01"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "delivery_code": "DLV-001",
  "status": "Pending"
}
```

---

#### PATCH `/logistics/deliveries/{item_id}`

Update a delivery (logistics, driver, customer, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Driver, Customer, Admin

**Request:**
```json
{
  "status": "In Transit",
  "progress": 50,
  "lat": 33.7395,
  "lng": -118.2610
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "In Transit"
}
```

---

#### DELETE `/logistics/deliveries/{item_id}`

Delete a delivery (logistics only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics

**Response:** `204 No Content`

---

### 🚗 Drivers Endpoints {#drivers-endpoints}

#### GET `/driver/deliveries`

List driver's assigned deliveries.

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Driver

**Response (200):**
```json
[
  {
    "id": "uuid",
    "delivery_code": "DLV-001",
    "shipment_id": "uuid",
    "status": "Pending"
  }
]
```

---

#### PATCH `/driver/deliveries/{delivery_id}`

Update a delivery (driver only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Driver

**Request:**
```json
{
  "status": "Picked Up",
  "progress": 25,
  "lat": 33.7395,
  "lng": -118.2610
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "Picked Up"
}
```

---

#### POST `/driver/deliveries/{delivery_id}/proof`

Upload proof of delivery.

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Driver

**Request:**
```
Query param: proof_url=https://...
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "Delivered",
  "progress": 100
}
```

---

#### GET `/driver/profile`

Get driver profile.

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Driver

**Response (200):**
```json
{
  "id": "uuid",
  "name": "John Driver",
  "email": "driver@example.com",
  "role": "driver",
  "last_seen": "2024-01-15T10:30:00Z"
}
```

---

### 🚛 Drivers Management Endpoints

#### GET `/drivers`

List all drivers (logistics, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Admin

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status_filter` | string | Filter by status |
| `skip` | int | Pagination offset |
| `limit` | int | Results per page |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "John Driver",
    "email": "driver@example.com",
    "role": "driver",
    "status": "on_duty"
  }
]
```

---

#### POST `/drivers`

Create a new driver (logistics, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Admin

**Request:**
```json
{
  "name": "New Driver",
  "email": "newdriver@example.com",
  "password": "securepassword123",
  "phone": "+1234567890",
  "branch_id": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New Driver",
  "email": "newdriver@example.com",
  "role": "driver"
}
```

---

#### GET `/drivers/{driver_id}`

Get driver details (logistics, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Admin

**Response (200):**
```json
{
  "id": "uuid",
  "name": "John Driver",
  "email": "driver@example.com",
  "role": "driver"
}
```

---

#### PUT `/drivers/{driver_id}`

Update driver (logistics, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Admin

**Request:**
```json
{
  "name": "Updated Name",
  "phone": "+0987654321",
  "status": "on_trip"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Name"
}
```

---

#### DELETE `/drivers/{driver_id}`

Delete a driver (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Response:** `204 No Content`

---

#### GET `/drivers/{driver_id}/tasks`

Get driver's tasks (logistics, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Admin

**Response (200):**
```json
[
  {
    "id": "uuid",
    "status": "Pending",
    "shipment_id": "uuid"
  }
]
```

---

#### PATCH `/drivers/{driver_id}/availability`

Set driver availability (logistics, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Admin

**Request:**
```json
{
  "status": "off_duty"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "off_duty"
}
```

---

### 🏭 Warehouse Endpoints {#warehouse-endpoints}

#### GET `/warehouse/warehouses`

List warehouses (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Main Warehouse",
    "code": "WH-001",
    "location": "New York",
    "status": "active"
  }
]
```

---

#### POST `/warehouse/warehouses`

Create a warehouse (warehouse only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Warehouse

**Request:**
```json
{
  "name": "New Warehouse",
  "code": "WH-002",
  "location": "Los Angeles",
  "manager_id": "uuid",
  "capacity": 10000
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New Warehouse",
  "status": "active"
}
```

---

#### GET `/warehouse/inventory`

List inventory items (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `warehouse_id` | string | Filter by warehouse |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "warehouse_id": "uuid",
    "sku": "SKU-001",
    "name": "Product A",
    "qty": 100,
    "status": "OK"
  }
]
```

---

#### POST `/warehouse/inventory`

Create inventory item (warehouse only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Warehouse

**Request:**
```json
{
  "warehouse_id": "uuid",
  "sku": "SKU-001",
  "name": "Product A",
  "qty": 100,
  "reorder_at": 20
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "sku": "SKU-001",
  "qty": 100,
  "status": "OK"
}
```

---

#### PATCH `/warehouse/inventory/{item_id}`

Update inventory item (warehouse only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Warehouse

**Request:**
```json
{
  "qty": 50,
  "status": "Low"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "qty": 50,
  "status": "Low"
}
```

---

#### DELETE `/warehouse/inventory/{item_id}`

Delete inventory item (warehouse only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Warehouse

**Response:** `204 No Content`

---

#### GET `/warehouse/tasks`

List warehouse tasks (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `task_type` | string | Filter by type (inbound, outbound, etc.) |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "task_type": "inbound",
    "description": "Receive shipment",
    "status": "Pending"
  }
]
```

---

#### POST `/warehouse/tasks`

Create a warehouse task (warehouse only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Warehouse

**Request:**
```json
{
  "warehouse_id": "uuid",
  "task_type": "inbound",
  "shipment_id": "uuid",
  "description": "Receive shipment XYZ"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "task_type": "inbound",
  "status": "Pending"
}
```

---

#### PATCH `/warehouse/tasks/{task_id}`

Update warehouse task (warehouse only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Warehouse

**Request:**
```json
{
  "status": "In Progress",
  "assigned_to": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "In Progress"
}
```

---

#### GET `/warehouse/analytics`

Get warehouse analytics (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "total_items": 150,
  "total_quantity": 5000,
  "low_stock": 10,
  "out_of_stock": 2,
  "warehouses": 3,
  "open_tasks": 15
}
```

---

### 💰 Finance Endpoints {#finance-endpoints}

#### GET `/finance/invoices`

List invoices (customers see own, finance sees all).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `skip` | int | Pagination offset |
| `limit` | int | Results per page |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "invoice_no": "INV-001",
    "customer_id": "uuid",
    "amount": 1500.00,
    "tax": 150.00,
    "total": 1650.00,
    "status": "Paid"
  }
]
```

---

#### GET `/finance/invoices/{invoice_id}`

Get invoice details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "invoice_no": "INV-001",
  "customer_id": "uuid",
  "amount": 1500.00,
  "tax": 150.00,
  "total": 1650.00,
  "status": "Paid"
}
```

---

#### POST `/finance/invoices`

Create an invoice (finance only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance

**Request:**
```json
{
  "customer_id": "uuid",
  "shipment_id": "uuid",
  "amount": 1500.00,
  "tax": 150.00,
  "due_date": "2024-03-01",
  "description": "Freight services"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "invoice_no": "INV-001",
  "total": 1650.00,
  "status": "Pending"
}
```

---

#### PATCH `/finance/invoices/{invoice_id}`

Update an invoice (finance only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance

**Request:**
```json
{
  "status": "Paid",
  "amount": 1600.00
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "Paid",
  "total": 1760.00
}
```

---

#### GET `/finance/payments`

List payments (customers see own, finance sees all).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "payment_ref": "PAY-001",
    "invoice_id": "uuid",
    "amount": 1650.00,
    "status": "completed"
  }
]
```

---

#### POST `/finance/payments`

Create a payment.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "invoice_id": "uuid",
  "amount": 1650.00,
  "method": "card"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "payment_ref": "PAY-001",
  "amount": 1650.00,
  "status": "completed"
}
```

---

#### GET `/finance/revenue`

Get revenue summary (finance only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance

**Response (200):**
```json
{
  "total_revenue": 50000.00,
  "outstanding": 15000.00,
  "paid_invoices": 85,
  "pending_invoices": 12,
  "overdue_invoices": 3
}
```

---

#### GET `/finance/outstanding`

Get outstanding invoices (finance only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance

**Response (200):**
```json
[
  {
    "id": "uuid",
    "invoice_no": "INV-005",
    "total": 2000.00,
    "status": "Pending"
  }
]
```

---

#### GET `/finance/expenses`

List expenses (finance only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `skip` | int | Pagination offset |
| `limit` | int | Results per page |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "category": "Operational",
    "amount": 5000.00,
    "description": "Fuel costs"
  }
]
```

---

#### POST `/finance/expenses`

Create an expense (finance only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance

**Request:**
```json
{
  "category": "Fuel",
  "amount": 5000.00,
  "description": "Monthly fuel costs",
  "branch_id": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "category": "Fuel",
  "amount": 5000.00
}
```

---

#### GET `/finance/profit-loss`

Get profit/loss summary (finance only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance

**Response (200):**
```json
{
  "revenue": 50000.00,
  "expenses": 20000.00,
  "profit": 30000.00,
  "margin_pct": 60.0
}
```

---

#### GET `/finance/monthly-report`

Get monthly financial report (finance only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance

**Response (200):**
```json
{
  "unit": "month",
  "rows": [
    {
      "period": "2024-01-01T00:00:00Z",
      "revenue": 25000.00,
      "expenses": 10000.00,
      "profit": 15000.00
    }
  ]
}
```

---

#### GET `/finance/yearly-report`

Get yearly financial report (finance only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance

**Response (200):**
```json
{
  "unit": "year",
  "rows": [
    {
      "period": "2024-01-01T00:00:00Z",
      "revenue": 300000.00,
      "expenses": 120000.00,
      "profit": 180000.00
    }
  ]
}
```

---

### 🛃 Customs Endpoints {#customs-endpoints}

#### GET `/customs/entries`

List customs entries (customs, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Customs, Admin

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status_filter` | string | Filter by status |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "entry_ref": "CUS-001",
    "shipment_id": "uuid",
    "direction": "import",
    "status": "pending"
  }
]
```

---

#### POST `/customs/entries`

Create a customs entry (customs, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Customs, Admin

**Request:**
```json
{
  "shipment_id": "uuid",
  "direction": "import",
  "hs_code": "8471.30",
  "declared_value": 50000.00,
  "notes": "Electronic equipment"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "entry_ref": "CUS-001",
  "status": "pending"
}
```

---

#### PATCH `/customs/entries/{entry_id}`

Update customs entry (customs, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Customs, Admin

**Request:**
```json
{
  "status": "cleared",
  "duty_amount": 2500.00,
  "notes": "Approved after review"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "cleared"
}
```

---

### 🛡️ Insurance Endpoints {#insurance-endpoints}

#### GET `/insurance/policies`

List insurance policies (customers see own, finance/admin see all).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "policy_ref": "INS-001",
    "shipment_id": "uuid",
    "coverage_amount": 50000.00,
    "premium": 750.00,
    "status": "requested"
  }
]
```

---

#### POST `/insurance/policies`

Request insurance coverage.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "shipment_id": "uuid",
  "coverage_amount": 50000.00
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "policy_ref": "INS-001",
  "coverage_amount": 50000.00,
  "premium": 750.00,
  "status": "requested"
}
```

---

#### PATCH `/insurance/policies/{policy_id}`

Update insurance policy (finance, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance, Admin

**Request:**
```json
{
  "status": "approved",
  "premium": 800.00
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "approved"
}
```

---

### 🎫 Support Endpoints {#support-endpoints}

#### GET `/support/tickets`

List support tickets (customers see own, support/admin see all).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status_filter` | string | Filter by status |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "ticket_ref": "TKT-001",
    "customer_id": "uuid",
    "subject": "Shipment delay",
    "priority": "high",
    "status": "open"
  }
]
```

---

#### POST `/support/tickets`

Create a support ticket.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "subject": "Shipment delay",
  "category": "delivery",
  "priority": "high",
  "description": "My shipment SHP-ABC123 has been delayed"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "ticket_ref": "TKT-001",
  "status": "open"
}
```

---

#### GET `/support/tickets/{ticket_id}`

Get ticket details with messages.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "ticket_ref": "TKT-001",
  "subject": "Shipment delay",
  "status": "open",
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "body": "My shipment has been delayed",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### POST `/support/tickets/{ticket_id}/messages`

Add a message to a ticket.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "body": "Any update on my ticket?"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "body": "Any update on my ticket?",
  "created_at": "2024-01-15T11:00:00Z"
}
```

---

#### PATCH `/support/tickets/{ticket_id}`

Update ticket (support, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Support, Admin

**Request:**
```json
{
  "status": "in_progress",
  "assigned_to": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "in_progress"
}
```

---

### 🔔 Notifications Endpoints {#notifications-endpoints}

#### GET `/notifications`

Get user's notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `skip` | int | Pagination offset |
| `limit` | int | Results per page |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Shipment Update",
    "message": "Your shipment SHP-ABC123 is now In Transit",
    "read": false,
    "status": "sent"
  }
]
```

---

#### POST `/notifications/{notification_id}/read`

Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "read": true
}
```

---

#### POST `/notifications`

Send a notification (admin only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Admin

**Request:**
```json
{
  "user_id": "uuid",
  "title": "System Update",
  "message": "Scheduled maintenance tonight",
  "type": "system"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "System Update",
  "status": "queued"
}
```

---

#### GET `/notifications/{notification_id}`

Get notification details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Shipment Update",
  "message": "Your shipment is In Transit"
}
```

---

#### DELETE `/notifications/{notification_id}`

Delete a notification.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

#### WS `/notifications/ws`

WebSocket for real-time notifications.

**Query:** `?token=<access_token>`

**Response Stream (every 10 seconds):**
```json
{
  "unread": 3,
  "latest": [
    {
      "id": "uuid",
      "title": "Shipment Update",
      "read": false
    }
  ]
}
```

---

### 📊 Analytics Endpoints {#analytics-endpoints}

#### GET `/analytics/dashboard`

Get dashboard analytics (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Response (200):**
```json
{
  "total_shipments": 342,
  "total_customers": 120,
  "total_drivers": 15,
  "open_tickets": 12,
  "total_revenue": 1250000.00,
  "shipments_by_status": {
    "Awaiting Dispatch": 10,
    "In Transit": 45,
    "Delivered": 280
  }
}
```

---

#### GET `/analytics/shipments`

Get shipment analytics (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Response (200):**
```json
{
  "total": 342,
  "by_status": {
    "Awaiting Dispatch": 10,
    "In Transit": 45
  },
  "by_mode": {
    "sea": 200,
    "air": 100,
    "road": 42
  }
}
```

---

#### GET `/analytics/customers`

Get customer analytics (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Response (200):**
```json
{
  "total_customers": 120,
  "top_by_shipments": [
    {
      "customer_id": "uuid",
      "shipments": 25
    }
  ]
}
```

---

#### GET `/analytics/drivers`

Get driver analytics (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Response (200):**
```json
{
  "total_drivers": 15,
  "by_availability": {
    "active": 12,
    "on_trip": 3
  },
  "deliveries_by_status": {
    "Pending": 5,
    "Delivered": 280
  }
}
```

---

#### GET `/analytics/revenue`

Get revenue analytics (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Response (200):**
```json
{
  "paid": 1250000.00,
  "outstanding": 150000.00,
  "invoices_by_status": {
    "Paid": 280,
    "Pending": 15
  }
}
```

---

#### GET `/analytics/performance`

Get performance analytics (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Response (200):**
```json
{
  "delivered": 280,
  "total_shipments": 342,
  "delivery_rate_pct": 81.87,
  "deliveries_by_status": {
    "Delivered": 280
  },
  "tickets_by_status": {
    "open": 12
  }
}
```

---

### 📄 Reports Endpoints {#reports-endpoints}

#### GET `/reports/shipment-report`

Get shipment report (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Response (200):**
```json
{
  "count": 342,
  "by_status": {
    "In Transit": 45,
    "Delivered": 280
  },
  "rows": [
    {
      "id": "uuid",
      "tracking_id": "SHP-ABC123",
      "status": "Delivered"
    }
  ]
}
```

---

#### GET `/reports/customer-report`

Get customer report (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Response (200):**
```json
{
  "count": 120,
  "rows": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

---

#### GET `/reports/finance-report`

Get finance report (finance only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Finance

**Response (200):**
```json
{
  "revenue": 1250000.00,
  "invoice_count": 295,
  "payment_count": 280,
  "invoices": [
    {
      "id": "uuid",
      "invoice_no": "INV-001",
      "total": 1650.00
    }
  ]
}
```

---

#### GET `/reports/driver-report`

Get driver report (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Response (200):**
```json
{
  "count": 15,
  "rows": [
    {
      "id": "uuid",
      "name": "John Driver",
      "email": "driver@example.com"
    }
  ]
}
```

---

#### GET `/reports/delivery-report`

Get delivery report (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Response (200):**
```json
{
  "count": 285,
  "by_status": {
    "Delivered": 280,
    "In Transit": 5
  },
  "rows": [
    {
      "id": "uuid",
      "delivery_code": "DLV-001",
      "status": "Delivered"
    }
  ]
}
```

---

#### GET `/reports/download/{report_type}`

Download report as CSV (staff only).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Any staff

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| report_type | string | shipment, customer, finance, driver, delivery |

**Response:** `text/csv` file download

---

### ✅ Tasks Endpoints {#tasks-endpoints}

#### GET `/tasks`

List warehouse tasks (warehouse sees assigned, logistics sees all).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status_filter` | string | Filter by status |
| `assigned_to` | string | Filter by assignee (logistics only) |
| `skip` | int | Pagination offset |
| `limit` | int | Results per page |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "task_type": "inbound",
    "description": "Receive shipment",
    "status": "Pending"
  }
]
```

---

#### POST `/tasks`

Create a task (logistics, warehouse).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Warehouse

**Request:**
```json
{
  "warehouse_id": "uuid",
  "task_type": "inbound",
  "shipment_id": "uuid",
  "description": "Receive shipment XYZ",
  "assigned_to": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "task_type": "inbound",
  "status": "Pending"
}
```

---

#### GET `/tasks/{task_id}`

Get task details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "task_type": "inbound",
  "description": "Receive shipment",
  "status": "Pending",
  "assigned_to": "uuid"
}
```

---

#### PUT `/tasks/{task_id}`

Update task (logistics, warehouse).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Warehouse

**Request:**
```json
{
  "status": "In Progress",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "In Progress"
}
```

---

#### PATCH `/tasks/{task_id}/status`

Update task status.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "Done"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "Done"
}
```

---

#### DELETE `/tasks/{task_id}`

Delete a task (logistics, warehouse).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Warehouse

**Response:** `204 No Content`

---

### 🚀 Dispatch Endpoints {#dispatch-endpoints}

#### POST `/dispatch/assign-driver`

Assign a driver to a shipment (logistics, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Admin, Driver, Customer

**Request:**
```json
{
  "shipment_id": "uuid",
  "driver_id": "uuid",
  "vehicle_id": "uuid",
  "route_id": "uuid",
  "eta": "2024-02-01"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "delivery_code": "DLV-001",
  "status": "Pending"
}
```

---

#### POST `/dispatch/reassign-driver`

Reassign a driver to a delivery (logistics, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Admin, Driver, Customer

**Request:**
```json
{
  "delivery_id": "uuid",
  "driver_id": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "driver_id": "uuid"
}
```

---

#### GET `/dispatch/available-drivers`

List available drivers (logistics, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Admin, Driver, Customer

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "John Driver",
    "status": "on_duty"
  }
]
```

---

#### GET `/dispatch/active-shipments`

List active shipments (logistics, admin).

**Headers:** `Authorization: Bearer <token>`  
**Roles:** Logistics, Admin, Driver, Customer

**Response (200):**
```json
[
  {
    "id": "uuid",
    "tracking_id": "SHP-ABC123",
    "status": "In Transit"
  }
]
```

---

## ❌ Error Handling {#error-handling}

### Error Response Format

```json
{
  "detail": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | OK | Successful request |
| `201` | Created | Resource created successfully |
| `204` | No Content | Successful deletion |
| `400` | Bad Request | Invalid input, business rule violation |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource (e.g., email) |
| `422` | Validation Error | Invalid request body |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | Unexpected server error |
| `502` | Bad Gateway | Backend unavailable |
| `503` | Service Unavailable | Backend spinning up |
| `504` | Gateway Timeout | Request timed out |

### Validation Error Example

```json
{
  "detail": "origin: Origin and destination must be different; weight: Weight must be greater than 0"
}
```

---

## ⏱️ Rate Limiting {#rate-limiting}

### Status: Planned (Not Yet Implemented)

> **Note:** Rate limiting is currently **not enforced** on any endpoint. The limits described below are **planned targets** for a future release.

### Planned Limits

| Endpoint Type | Planned Limit | Window |
|--------------|---------------|--------|
| Auth (login/register) | 10 requests | 60 seconds |
| API (authenticated) | 100 requests | 60 seconds |
| Public tracking | 50 requests | 60 seconds |

### Implementation Roadmap

Rate limiting will be implemented using a Redis-backed token bucket algorithm:

1. **Phase 1:** Auth endpoints (login/register/forgot-password) — prevent brute force
2. **Phase 2:** API endpoints — per-user rate limiting via Redis
3. **Phase 3:** Public endpoints — IP-based rate limiting

See `docs/SPECIFICATION.md` for the full security roadmap.

---

## 📝 API Testing with cURL

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Create Shipment
```bash
curl -X POST http://127.0.0.1:8000/api/v1/shipments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"origin": "New York", "destination": "Los Angeles", "mode": "sea"}'
```

### List Shipments
```bash
curl -X GET http://127.0.0.1:8000/api/v1/shipments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Shipment Status
```bash
curl -X POST http://127.0.0.1:8000/api/v1/shipments/SHIPMENT_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "In Transit", "note": "Departed origin"}'
```

### Public Tracking (No Auth)
```bash
curl -X GET http://127.0.0.1:8000/api/v1/tracking/SHP-ABC123
```

---

## 📊 API Endpoint Summary

| Module | Endpoints | Auth Required |
|--------|-----------|---------------|
| Auth | 8 | No (login/register), Yes (me, refresh) |
| Users | 7 | Yes (staff) |
| Admin | 15 | Yes (admin) |
| Customers | 8 | Yes (staff) |
| Quotes | 9 | Yes |
| Shipments | 12 | Yes |
| Tracking | 5 | Mixed |
| Logistics | 12 | Yes |
| Drivers | 10 | Yes |
| Warehouse | 12 | Yes |
| Finance | 14 | Yes |
| Customs | 3 | Yes |
| Insurance | 3 | Yes |
| Support | 5 | Yes |
| Notifications | 6 | Yes |
| Analytics | 6 | Yes |
| Reports | 6 | Yes |
| Tasks | 6 | Yes |
| Dispatch | 4 | Yes |
| **Total** | **~150** | |

---

*Documentation generated for NexaCargo API v1.0.0*
