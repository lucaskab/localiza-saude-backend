# Appointments API Documentation

This document describes all available endpoints for managing appointments in the Localiza Saúde system.

## Endpoints Overview

All endpoints require authentication via Bearer token unless otherwise specified.

### 1. List All Appointments
**GET** `/appointments`

Returns a list of all appointments in the system with full relations.

**Authentication:** Required

**Response (200):**
```json
{
  "appointments": [
    {
      "id": "clxxx...",
      "customerId": "clxxx...",
      "customer": {
        "id": "clxxx...",
        "userId": "clxxx...",
        "user": {
          "id": "clxxx...",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+5511999999999",
          "image": null,
          "role": "CUSTOMER"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "healthcareProviderId": "clxxx...",
      "healthcareProvider": {
        "id": "clxxx...",
        "userId": "clxxx...",
        "specialization": "Cardiology",
        "licenseNumber": "CRM12345",
        "user": {
          "id": "clxxx...",
          "name": "Dr. Jane Smith",
          "email": "dr.jane@example.com",
          "phone": "+5511888888888",
          "image": null,
          "role": "HEALTHCARE_PROVIDER"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "scheduledAt": "2024-03-15T14:00:00.000Z",
      "status": "SCHEDULED",
      "totalDurationMinutes": 60,
      "totalPriceCents": 30000,
      "notes": "Patient needs follow-up",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "appointmentProcedures": [
        {
          "id": "clxxx...",
          "appointmentId": "clxxx...",
          "procedureId": "clxxx...",
          "procedure": {
            "id": "clxxx...",
            "name": "Consultation",
            "description": "General medical consultation",
            "priceInCents": 30000,
            "durationInMinutes": 60,
            "healthcareProviderId": "clxxx...",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
          },
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

---

### 2. Get Appointment by ID
**GET** `/appointments/:id`

Returns a single appointment by its ID.

**Authentication:** Required

**URL Parameters:**
- `id` (string, required): CUID of the appointment

**Response (200):**
```json
{
  "appointment": {
    "id": "clxxx...",
    "customerId": "clxxx...",
    "customer": { /* ... */ },
    "healthcareProviderId": "clxxx...",
    "healthcareProvider": { /* ... */ },
    "scheduledAt": "2024-03-15T14:00:00.000Z",
    "status": "SCHEDULED",
    "totalDurationMinutes": 60,
    "totalPriceCents": 30000,
    "notes": "Patient needs follow-up",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "appointmentProcedures": [ /* ... */ ]
  }
}
```

---

### 3. Get Appointments by Customer
**GET** `/customers/:customerId/appointments`

Returns all appointments for a specific customer.

**Authentication:** Required

**URL Parameters:**
- `customerId` (string, required): CUID of the customer

**Response (200):**
```json
{
  "appointments": [ /* array of appointments */ ]
}
```

---

### 4. Get Healthcare Provider Availability
**GET** `/healthcare-providers/:healthcareProviderId/availability`

Returns available time slots for a healthcare provider on a specific date.

**Authentication:** Required

**URL Parameters:**
- `healthcareProviderId` (string, required): CUID of the healthcare provider

**Query Parameters:**
- `date` (string, required): Date in YYYY-MM-DD format
- `procedureIds` (string, optional): Comma-separated list of procedure IDs

**Example Request:**
```
GET /healthcare-providers/clxxx.../availability?date=2024-03-15&procedureIds=clxxx1,clxxx2
```

**Response (200):**
```json
{
  "date": "2024-03-15",
  "totalDurationMinutes": 90,
  "availableSlots": [
    {
      "startTime": "08:00",
      "endTime": "09:30",
      "available": true
    },
    {
      "startTime": "08:30",
      "endTime": "10:00",
      "available": false
    },
    {
      "startTime": "09:00",
      "endTime": "10:30",
      "available": true
    }
  ]
}
```

**Notes:**
- Slots are generated in 30-minute intervals
- `totalDurationMinutes` is calculated from the selected procedures (or defaults to 30 minutes)
- Slots marked as `available: false` conflict with existing appointments
- The provider's schedule for that day of week is used to determine working hours

---

### 5. Create Appointment
**POST** `/appointments`

Creates a new appointment.

**Authentication:** Required

**Request Body:**
```json
{
  "customerId": "clxxx...",
  "healthcareProviderId": "clxxx...",
  "scheduledAt": "2024-03-15T14:00:00.000Z",
  "procedureIds": ["clxxx1", "clxxx2"],
  "notes": "Patient has specific requirements"
}
```

**Body Schema:**
- `customerId` (string, required): CUID of the customer
- `healthcareProviderId` (string, required): CUID of the healthcare provider
- `scheduledAt` (DateTime, required): Date and time of the appointment
- `procedureIds` (array of strings, required): At least one procedure ID
- `notes` (string, optional): Additional notes about the appointment

**Response (201):**
```json
{
  "appointment": {
    "id": "clxxx...",
    "customerId": "clxxx...",
    "customer": { /* ... */ },
    "healthcareProviderId": "clxxx...",
    "healthcareProvider": { /* ... */ },
    "scheduledAt": "2024-03-15T14:00:00.000Z",
    "status": "SCHEDULED",
    "totalDurationMinutes": 90,
    "totalPriceCents": 50000,
    "notes": "Patient has specific requirements",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "appointmentProcedures": [ /* ... */ ]
  }
}
```

**Notes:**
- `totalDurationMinutes` is automatically calculated from the selected procedures
- `totalPriceCents` is automatically calculated from the selected procedures
- Initial status is always `SCHEDULED`

---

### 6. Update Appointment
**PATCH** `/appointments/:id`

Updates an existing appointment.

**Authentication:** Required

**URL Parameters:**
- `id` (string, required): CUID of the appointment

**Request Body (all fields optional):**
```json
{
  "scheduledAt": "2024-03-16T15:00:00.000Z",
  "status": "CONFIRMED",
  "notes": "Updated notes"
}
```

**Body Schema:**
- `scheduledAt` (DateTime, optional): New date and time
- `status` (enum, optional): New status (SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
- `notes` (string, optional): Updated notes

**Response (200):**
```json
{
  "appointment": {
    "id": "clxxx...",
    /* ... updated appointment data ... */
  }
}
```

---

### 7. Delete Appointment
**DELETE** `/appointments/:id`

Deletes an appointment from the system.

**Authentication:** Required

**URL Parameters:**
- `id` (string, required): CUID of the appointment

**Response (200):**
```json
{
  "message": "Appointment deleted successfully"
}
```

**Notes:**
- This is a hard delete operation
- All related appointment procedures are cascade deleted

---

## Appointment Status Enum

The appointment status can be one of the following values:

- `SCHEDULED` - Initial status when appointment is created
- `CONFIRMED` - Customer or provider has confirmed the appointment
- `IN_PROGRESS` - Appointment is currently happening
- `COMPLETED` - Appointment has been completed
- `CANCELLED` - Appointment was cancelled
- `NO_SHOW` - Customer did not show up for the appointment

---

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Appointment not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [ /* validation errors */ ]
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Implementation Details

### File Structure

```
src/
├── schemas/routes/appointments/
│   ├── get-appointments.ts
│   ├── get-appointment-by-id.ts
│   ├── get-appointments-by-customer.ts
│   ├── get-availability.ts
│   ├── create-appointment.ts
│   ├── update-appointment.ts
│   └── delete-appointment.ts
├── http/
│   ├── useCases/appointments/
│   │   ├── get-appointments-use-case.ts
│   │   ├── get-appointment-by-id-use-case.ts
│   │   ├── get-appointments-by-customer-use-case.ts
│   │   ├── get-availability-use-case.ts
│   │   ├── create-appointment-use-case.ts
│   │   ├── update-appointment-use-case.ts
│   │   └── delete-appointment-use-case.ts
│   ├── controllers/appointments/
│   │   ├── get-appointments-controller.ts
│   │   ├── get-appointment-by-id-controller.ts
│   │   ├── get-appointments-by-customer-controller.ts
│   │   ├── get-availability-controller.ts
│   │   ├── create-appointment-controller.ts
│   │   ├── update-appointment-controller.ts
│   │   └── delete-appointment-controller.ts
│   └── routes/appointments/
│       ├── get-appointments.ts
│       ├── get-appointment-by-id.ts
│       ├── get-appointments-by-customer.ts
│       ├── get-availability.ts
│       ├── create-appointment.ts
│       ├── update-appointment.ts
│       └── delete-appointment.ts
```

### Architecture Pattern

All endpoints follow the same layered architecture:

1. **Route Layer**: Registers the endpoint with Fastify, applies middleware
2. **Controller Layer**: Handles HTTP request/response, extracts parameters
3. **Use Case Layer**: Contains business logic
4. **Repository Layer**: Handles database operations (already exists)
5. **Schema Layer**: Defines Zod validation schemas for requests/responses

### Authentication

All routes use the `authMiddleware` which validates the Bearer token in the Authorization header.