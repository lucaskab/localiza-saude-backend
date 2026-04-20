# Healthcare Provider Schedules - Quick Start Guide

## Overview

Healthcare provider schedules define when providers are available for appointments. Each schedule represents a recurring time block on a specific day of the week.

## Quick Reference

### Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/healthcare-provider-schedules` | ❌ | List all schedules |
| GET | `/healthcare-provider-schedules/:id` | ❌ | Get schedule by ID |
| GET | `/healthcare-providers/:healthcareProviderId/schedules` | ❌ | Get schedules by provider |
| POST | `/healthcare-provider-schedules` | ✅ | Create new schedule |
| PATCH | `/healthcare-provider-schedules/:id` | ✅ | Update schedule |
| DELETE | `/healthcare-provider-schedules/:id` | ✅ | Delete schedule |

## Common Use Cases

### 1. Get All Schedules for a Provider

```bash
curl -X GET \
  http://localhost:3333/healthcare-providers/clxx123/schedules
```

**Response:**
```json
{
  "schedules": [
    {
      "id": "clxx456",
      "healthcareProviderId": "clxx123",
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "12:00",
      "isActive": true,
      "healthcareProvider": { /* ... */ }
    }
  ]
}
```

### 2. Create Weekly Schedule

Create a provider's Monday schedule:

```bash
curl -X POST \
  http://localhost:3333/healthcare-provider-schedules \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "healthcareProviderId": "clxx123",
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "12:00"
  }'
```

### 3. Update Schedule Times

```bash
curl -X PATCH \
  http://localhost:3333/healthcare-provider-schedules/clxx456 \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "startTime": "09:00",
    "endTime": "13:00"
  }'
```

### 4. Temporarily Disable Schedule

```bash
curl -X PATCH \
  http://localhost:3333/healthcare-provider-schedules/clxx456 \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "isActive": false
  }'
```

### 5. Delete Schedule

```bash
curl -X DELETE \
  http://localhost:3333/healthcare-provider-schedules/clxx456 \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## Day of Week Reference

```javascript
const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};
```

## Example: Setting Up Full Week Schedule

```javascript
const providerSchedule = [
  // Monday - Friday: Morning shifts
  { dayOfWeek: 1, startTime: "08:00", endTime: "12:00" },
  { dayOfWeek: 2, startTime: "08:00", endTime: "12:00" },
  { dayOfWeek: 3, startTime: "08:00", endTime: "12:00" },
  { dayOfWeek: 4, startTime: "08:00", endTime: "12:00" },
  { dayOfWeek: 5, startTime: "08:00", endTime: "12:00" },
  
  // Monday - Friday: Afternoon shifts
  { dayOfWeek: 1, startTime: "14:00", endTime: "18:00" },
  { dayOfWeek: 2, startTime: "14:00", endTime: "18:00" },
  { dayOfWeek: 3, startTime: "14:00", endTime: "18:00" },
  { dayOfWeek: 4, startTime: "14:00", endTime: "18:00" },
  { dayOfWeek: 5, startTime: "14:00", endTime: "18:00" },
  
  // Saturday: Morning only
  { dayOfWeek: 6, startTime: "08:00", endTime: "12:00" }
];

// Create all schedules
for (const schedule of providerSchedule) {
  await fetch('http://localhost:3333/healthcare-provider-schedules', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      healthcareProviderId: 'clxx123',
      ...schedule
    })
  });
}
```

## Frontend Integration Example (React)

### Fetch Provider Schedules

```typescript
import { useEffect, useState } from 'react';

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

function ProviderSchedule({ providerId }: { providerId: string }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    fetch(`/healthcare-providers/${providerId}/schedules`)
      .then(res => res.json())
      .then(data => setSchedules(data.schedules));
  }, [providerId]);

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  return (
    <div>
      <h2>Provider Schedule</h2>
      {schedules.map(schedule => (
        <div key={schedule.id}>
          {getDayName(schedule.dayOfWeek)}: {schedule.startTime} - {schedule.endTime}
          {!schedule.isActive && ' (Inactive)'}
        </div>
      ))}
    </div>
  );
}
```

### Create Schedule Form

```typescript
function CreateScheduleForm({ providerId }: { providerId: string }) {
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '12:00'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/healthcare-provider-schedules', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        healthcareProviderId: providerId,
        ...formData
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Schedule created:', data.schedule);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={formData.dayOfWeek}
        onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
      >
        <option value={0}>Sunday</option>
        <option value={1}>Monday</option>
        <option value={2}>Tuesday</option>
        <option value={3}>Wednesday</option>
        <option value={4}>Thursday</option>
        <option value={5}>Friday</option>
        <option value={6}>Saturday</option>
      </select>

      <input
        type="time"
        value={formData.startTime}
        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
      />

      <input
        type="time"
        value={formData.endTime}
        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
      />

      <button type="submit">Create Schedule</button>
    </form>
  );
}
```

## Important Notes

### Time Format
- **Must be 24-hour format**: `HH:mm`
- ✅ Valid: `08:00`, `14:30`, `23:59`
- ❌ Invalid: `8:00`, `2:30 PM`, `25:00`

### Multiple Schedules
- You can have multiple schedules for the same day
- Example: Morning shift (8-12) and afternoon shift (14-18)

### Active/Inactive
- Use `isActive: false` to temporarily disable without deleting
- Inactive schedules won't affect availability calculations

### Provider Relation
- All responses include full `healthcareProvider` with `user` details
- Useful for displaying provider info without extra requests

## Testing

### Create Test Schedule
```bash
# Set your auth token
TOKEN="your-auth-token-here"

# Create a Monday morning schedule
curl -X POST http://localhost:3333/healthcare-provider-schedules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "healthcareProviderId": "clxx123",
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "12:00"
  }'
```

### Verify Creation
```bash
# Get all schedules for the provider
curl http://localhost:3333/healthcare-providers/clxx123/schedules
```

## Need More Details?

See [README.md](./README.md) for complete API documentation.