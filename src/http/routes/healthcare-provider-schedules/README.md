# Healthcare Provider Schedules Routes

This module contains all routes related to healthcare provider schedules management.

## Overview

Healthcare provider schedules define when a healthcare provider is available to see patients. Each schedule represents a recurring time block on a specific day of the week.

## Endpoints

### 1. List All Schedules
**GET** `/healthcare-provider-schedules`

Get all healthcare provider schedules in the system.

**Authentication:** Not required

**Response (200):**
```json
{
  "schedules": [
    {
      "id": "clxx...",
      "healthcareProviderId": "clxx...",
      "healthcareProvider": {
        "id": "clxx...",
        "userId": "clxx...",
        "specialty": "Cardiologia",
        "professionalId": "CRM-12345",
        "bio": "Specialized in cardiology...",
        "user": {
          "id": "clxx...",
          "name": "Dr. John Doe",
          "email": "john@example.com",
          "phone": "+5511999999999",
          "image": "https://...",
          "role": "healthcare_provider"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "12:00",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Schedule by ID
**GET** `/healthcare-provider-schedules/:id`

Get a specific healthcare provider schedule by its ID.

**Authentication:** Not required

**URL Parameters:**
- `id` (string, required): Schedule ID

**Response (200):**
```json
{
  "schedule": {
    "id": "clxx...",
    "healthcareProviderId": "clxx...",
    "healthcareProvider": {
      "id": "clxx...",
      "userId": "clxx...",
      "specialty": "Cardiologia",
      "professionalId": "CRM-12345",
      "bio": "Specialized in cardiology...",
      "user": {
        "id": "clxx...",
        "name": "Dr. John Doe",
        "email": "john@example.com",
        "phone": "+5511999999999",
        "image": "https://...",
        "role": "healthcare_provider"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "12:00",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Get Schedules by Provider
**GET** `/healthcare-providers/:healthcareProviderId/schedules`

Get all schedules for a specific healthcare provider.

**Authentication:** Not required

**URL Parameters:**
- `healthcareProviderId` (string, required): Healthcare provider ID

**Response (200):**
```json
{
  "schedules": [
    {
      "id": "clxx...",
      "healthcareProviderId": "clxx...",
      "healthcareProvider": {
        "id": "clxx...",
        "userId": "clxx...",
        "specialty": "Cardiologia",
        "professionalId": "CRM-12345",
        "bio": "Specialized in cardiology...",
        "user": {
          "id": "clxx...",
          "name": "Dr. John Doe",
          "email": "john@example.com",
          "phone": "+5511999999999",
          "image": "https://...",
          "role": "healthcare_provider"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "12:00",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 4. Create Schedule
**POST** `/healthcare-provider-schedules`

Create a new healthcare provider schedule.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "healthcareProviderId": "clxx...",
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "12:00"
}
```

**Field Descriptions:**
- `healthcareProviderId` (string, required): ID of the healthcare provider
- `dayOfWeek` (number, required): Day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
- `startTime` (string, required): Start time in HH:mm format (24-hour)
- `endTime` (string, required): End time in HH:mm format (24-hour)

**Response (201):**
```json
{
  "schedule": {
    "id": "clxx...",
    "healthcareProviderId": "clxx...",
    "healthcareProvider": {
      "id": "clxx...",
      "userId": "clxx...",
      "specialty": "Cardiologia",
      "professionalId": "CRM-12345",
      "bio": "Specialized in cardiology...",
      "user": {
        "id": "clxx...",
        "name": "Dr. John Doe",
        "email": "john@example.com",
        "phone": "+5511999999999",
        "image": "https://...",
        "role": "healthcare_provider"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "12:00",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Update Schedule
**PATCH** `/healthcare-provider-schedules/:id`

Update an existing healthcare provider schedule.

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (string, required): Schedule ID

**Request Body:**
```json
{
  "dayOfWeek": 2,
  "startTime": "09:00",
  "endTime": "13:00",
  "isActive": true
}
```

**Field Descriptions:**
All fields are optional:
- `dayOfWeek` (number, optional): Day of the week (0-6)
- `startTime` (string, optional): Start time in HH:mm format
- `endTime` (string, optional): End time in HH:mm format
- `isActive` (boolean, optional): Whether the schedule is active

**Response (200):**
```json
{
  "schedule": {
    "id": "clxx...",
    "healthcareProviderId": "clxx...",
    "healthcareProvider": {
      "id": "clxx...",
      "userId": "clxx...",
      "specialty": "Cardiologia",
      "professionalId": "CRM-12345",
      "bio": "Specialized in cardiology...",
      "user": {
        "id": "clxx...",
        "name": "Dr. John Doe",
        "email": "john@example.com",
        "phone": "+5511999999999",
        "image": "https://...",
        "role": "healthcare_provider"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "dayOfWeek": 2,
    "startTime": "09:00",
    "endTime": "13:00",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

### 6. Delete Schedule
**DELETE** `/healthcare-provider-schedules/:id`

Delete a healthcare provider schedule.

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id` (string, required): Schedule ID

**Response (204):** No content

---

## Field Reference

### Day of Week Values
- `0` = Sunday (Domingo)
- `1` = Monday (Segunda-feira)
- `2` = Tuesday (Terça-feira)
- `3` = Wednesday (Quarta-feira)
- `4` = Thursday (Quinta-feira)
- `5` = Friday (Sexta-feira)
- `6` = Saturday (Sábado)

### Time Format
Times must be in 24-hour format: `HH:mm`
- Examples: `08:00`, `14:30`, `23:59`
- Invalid: `8:00`, `2:30 PM`, `25:00`

## Use Cases

1. **Display Provider Availability**: Use GET endpoints to show when a provider is available
2. **Manage Weekly Schedule**: Use POST/PATCH to set up recurring weekly availability
3. **Temporarily Disable**: Use PATCH with `isActive: false` to temporarily disable a schedule without deleting it
4. **Filter by Provider**: Use the `/healthcare-providers/:healthcareProviderId/schedules` endpoint to get all schedules for a specific provider

## Notes

- Schedules are recurring and represent weekly availability
- Multiple schedules can exist for the same day (e.g., morning and afternoon shifts)
- Inactive schedules (`isActive: false`) are not considered when calculating availability
- All responses include the full healthcare provider object with user details