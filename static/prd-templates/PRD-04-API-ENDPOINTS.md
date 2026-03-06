# PRD-04: API Endpoints

[Back to Index](./PRD-00-INDEX.md) | [Previous: Database Schema](./PRD-03-DATABASE-SCHEMA.md) | [Next: Frontend UI](./PRD-05-FRONTEND-UI.md)

<!--
All endpoints require authentication unless otherwise noted.
Add your project-specific controller and frontend conventions here
(e.g., error handling wrappers, auth guard patterns, etc.)
-->

All endpoints require authentication unless otherwise noted.

**Base path:** `/api/v1/[app]`

---

## 4.1 [Resource 1] CRUD

### GET /api/v1/[app]/[resources]

List all [resources] with optional filtering and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| page | number | 1 | Page number |
| pageSize | number | 25 | Items per page |
| search | string | - | Search by name/title |
| status | string | - | Filter by status |
| sortBy | string | "createdAt" | Sort field |
| sortOrder | string | "desc" | Sort direction (asc/desc) |

**Response:** `200 OK`

```
{
  data: [Resource][],
  total: number,
  page: number,
  pageSize: number
}
```

**Permissions:** All authenticated users

---

### GET /api/v1/[app]/[resources]/:id

Get a single [resource] by ID.

**Path Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| id | UUID | [Resource] ID |

**Response:** `200 OK`

```
[Resource]
```

**Error Responses:**

| Status | Description |
| --- | --- |
| 404 | [Resource] not found |

**Permissions:** All authenticated users

---

### POST /api/v1/[app]/[resources]

Create a new [resource].

**Request Body:**

```
{
  name:        string   // required — [description]
  description: string   // optional — [description]
  [field]:     [type]   // required/optional — [description]
}
```

**Response:** `201 Created`

```
[Resource]
```

**Error Responses:**

| Status | Description |
| --- | --- |
| 400 | Validation error (missing required fields, invalid values) |
| 409 | Duplicate [unique field] |

**Permissions:** Editor+

---

### PUT /api/v1/[app]/[resources]/:id

Update an existing [resource].

**Path Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| id | UUID | [Resource] ID |

**Request Body:**

```
{
  name:        string  // optional — [description]
  description: string  // optional — [description]
  [field]:     [type]  // optional — [description]
}
```

**Response:** `200 OK`

```
[Resource]
```

**Error Responses:**

| Status | Description |
| --- | --- |
| 400 | Validation error |
| 404 | [Resource] not found |
| 409 | Duplicate [unique field] |
| 422 | Invalid state transition |

**Permissions:** Editor+

---

### DELETE /api/v1/[app]/[resources]/:id

Delete a [resource] (soft delete or hard delete).

**Path Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| id | UUID | [Resource] ID |

**Response:** `204 No Content`

**Error Responses:**

| Status | Description |
| --- | --- |
| 404 | [Resource] not found |
| 409 | Cannot delete - [resource] has dependencies |

**Permissions:** Admin+

---

## 4.2 [Resource 2] Operations

<!--
Add additional endpoint groups as needed.
Follow the same pattern: method, path, parameters, request/response, errors, permissions.
-->

### GET /api/v1/[app]/[resource-2]

[Description of what this endpoint does]

**Query Parameters:**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |

**Response:** `200 OK`

```
// Response type
```

**Permissions:** [Role requirement]

---

### POST /api/v1/[app]/[resource-2]

[Description]

**Request Body:**

```
// Request type
```

**Response:** `201 Created`

```
// Response type
```

**Permissions:** [Role requirement]

---

## 4.3 Configuration / Settings Endpoints

<!--
If the feature has admin-configurable settings, document those endpoints here.
-->

### GET /api/v1/[app]/settings/[group]

Get configuration settings for [group].

**Response:** `200 OK`

```
{
  [setting_key]: [type]
}
```

**Permissions:** Admin+

---

### PUT /api/v1/[app]/settings/[group]

Update configuration settings for [group].

**Request Body:**

```
{
  [setting_key]: [type]
}
```

**Response:** `200 OK`

**Permissions:** Admin+

---

## 4.4 Public / Unauthenticated Endpoints

<!--
If applicable, document endpoints that don't require authentication (e.g., share links, public access).
-->

### GET /api/v1/[app]/public/[resource]/:token

Access a shared [resource] without authentication.

**Path Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| token | string | Share link token |

**Response:** `200 OK`

```
// Public-safe response type (sensitive data excluded)
```

**Error Responses:**

| Status | Description |
| --- | --- |
| 404 | Token not found or expired |

**Permissions:** None (public access)

---

## API Summary

<!--
Provide a quick-reference table of all endpoints.
-->

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/v1/[app]/[resources]` | List [resources] | All |
| GET | `/api/v1/[app]/[resources]/:id` | Get [resource] | All |
| POST | `/api/v1/[app]/[resources]` | Create [resource] | Editor+ |
| PUT | `/api/v1/[app]/[resources]/:id` | Update [resource] | Editor+ |
| DELETE | `/api/v1/[app]/[resources]/:id` | Delete [resource] | Admin+ |
| GET | `/api/v1/[app]/settings/[group]` | Get settings | Admin+ |
| PUT | `/api/v1/[app]/settings/[group]` | Update settings | Admin+ |

---

## Next Document

Continue to [PRD-05-FRONTEND-UI.md](./PRD-05-FRONTEND-UI.md) for detailed frontend wireframes, component specifications, and interaction patterns.
