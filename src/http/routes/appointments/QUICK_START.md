# Appointments API - Quick Start Guide

This guide provides quick examples for testing all appointment endpoints.

## Prerequisites

1. Ensure you have a valid Bearer token (obtain via login/authentication)
2. Replace `YOUR_TOKEN` with your actual token
3. Replace placeholder IDs with actual IDs from your database

## Base URL

```
http://localhost:3333
```

## Quick Test Examples

### 1. List All Appointments

```bash
curl -X GET http://localhost:3333/appointments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get Appointment by ID

```bash
curl -X GET http://localhost:3333/appointments/clxxx... \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Appointments by Customer

```bash
curl -X GET http://localhost:3333/customers/clxxx.../appointments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Provider Availability

**Without procedures (30-minute default slots):**
```bash
curl -X GET "http://localhost:3333/healthcare-providers/clxxx.../availability?date=2024-03-15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**With specific procedures:**
```bash
curl -X GET "http://localhost:3333/healthcare-providers/clxxx.../availability?date=2024-03-15&procedureIds=clxxx1,clxxx2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Create Appointment

```bash
curl -X POST http://localhost:3333/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "clxxx...",
    "healthcareProviderId": "clxxx...",
    "scheduledAt": "2024-03-15T14:00:00.000Z",
    "procedureIds": ["clxxx1", "clxxx2"],
    "notes": "Patient needs follow-up"
  }'
```

### 6. Update Appointment

**Update scheduled time:**
```bash
curl -X PATCH http://localhost:3333/appointments/clxxx... \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledAt": "2024-03-16T15:00:00.000Z"
  }'
```

**Update status:**
```bash
curl -X PATCH http://localhost:3333/appointments/clxxx... \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED"
  }'
```

**Update notes:**
```bash
curl -X PATCH http://localhost:3333/appointments/clxxx... \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Updated appointment notes"
  }'
```

**Update multiple fields:**
```bash
curl -X PATCH http://localhost:3333/appointments/clxxx... \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledAt": "2024-03-16T15:00:00.000Z",
    "status": "CONFIRMED",
    "notes": "Confirmed for tomorrow at 3pm"
  }'
```

### 7. Delete Appointment

```bash
curl -X DELETE http://localhost:3333/appointments/clxxx... \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Workflow

### Complete Appointment Lifecycle

1. **Check provider availability:**
   ```bash
   # Get available slots for March 15th
   curl -X GET "http://localhost:3333/healthcare-providers/PROVIDER_ID/availability?date=2024-03-15&procedureIds=PROCEDURE_ID" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Create appointment at available slot:**
   ```bash
   curl -X POST http://localhost:3333/appointments \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "customerId": "CUSTOMER_ID",
       "healthcareProviderId": "PROVIDER_ID",
       "scheduledAt": "2024-03-15T08:00:00.000Z",
       "procedureIds": ["PROCEDURE_ID"],
       "notes": "New appointment"
     }'
   ```

3. **Confirm the appointment:**
   ```bash
   curl -X PATCH http://localhost:3333/appointments/APPOINTMENT_ID \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "CONFIRMED"}'
   ```

4. **Mark as in progress:**
   ```bash
   curl -X PATCH http://localhost:3333/appointments/APPOINTMENT_ID \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "IN_PROGRESS"}'
   ```

5. **Complete the appointment:**
   ```bash
   curl -X PATCH http://localhost:3333/appointments/APPOINTMENT_ID \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "COMPLETED"}'
   ```

## Common Scenarios

### Cancel an Appointment
```bash
curl -X PATCH http://localhost:3333/appointments/APPOINTMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELLED",
    "notes": "Patient requested cancellation"
  }'
```

### Mark No-Show
```bash
curl -X PATCH http://localhost:3333/appointments/APPOINTMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "NO_SHOW",
    "notes": "Patient did not arrive"
  }'
```

### Reschedule Appointment
```bash
curl -X PATCH http://localhost:3333/appointments/APPOINTMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledAt": "2024-03-20T10:00:00.000Z",
    "notes": "Rescheduled by patient request"
  }'
```

## Status Values

Valid status values for updates:
- `SCHEDULED` - Initial status
- `CONFIRMED` - Appointment confirmed
- `IN_PROGRESS` - Currently happening
- `COMPLETED` - Finished successfully
- `CANCELLED` - Cancelled by either party
- `NO_SHOW` - Patient didn't show up

## Tips

1. **Date Format**: Always use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
2. **Availability Check**: Always check availability before creating appointments
3. **Procedure IDs**: Must be valid and belong to the healthcare provider
4. **Time Zones**: All times are in UTC, convert as needed
5. **Authentication**: Token must be valid and not expired

## Getting IDs

To get valid IDs for testing:

```bash
# Get customers
curl -X GET http://localhost:3333/customers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get healthcare providers
curl -X GET http://localhost:3333/healthcare-providers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get procedures for a provider
curl -X GET http://localhost:3333/healthcare-providers/PROVIDER_ID/procedures \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

**401 Unauthorized**: Check your Bearer token
**404 Not Found**: Verify the ID exists in the database
**400 Bad Request**: Check request body format and required fields
**Validation errors**: Ensure dates are valid and IDs are CUIDs

## Using with Bruno/Postman

Import these examples into Bruno or Postman:
1. Create a new collection
2. Set environment variable `baseUrl` = `http://localhost:3333`
3. Set environment variable `token` = `your_bearer_token`
4. Use `{{baseUrl}}` and `{{token}}` in requests