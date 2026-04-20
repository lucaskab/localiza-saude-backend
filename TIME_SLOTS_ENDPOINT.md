# Time Slots Endpoint Documentation

## Overview

The Time Slots endpoint returns **ALL** possible time slots for a healthcare provider on a given day, with each slot marked as `available: true` or `available: false`. This allows the frontend to display a complete grid/calendar view showing both available and unavailable slots.

## Endpoint

```
GET /healthcare-providers/:healthcareProviderId/slots
```

## Authentication

Required: Bearer token

## Query Parameters

| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| `date` | string | Yes | YYYY-MM-DD | The date to check availability |
| `procedureIds` | string | Yes | comma-separated CUIDs | IDs of selected procedures |

### Example

```
GET /healthcare-providers/clxxx123/slots?date=2024-12-20&procedureIds=cly123,cly456
```

## How It Works

### 1. Slot Interval Calculation

The slot interval is determined by the **shortest procedure** that the healthcare provider offers:

- If provider offers: 15min, 30min, 60min procedures
- Slot interval = **15 minutes** (shortest)
- Slots generated: 08:00, 08:15, 08:30, 08:45, 09:00, etc.

### 2. Availability Determination

A slot is marked `available: true` only if **ALL** of these conditions are met:

1. **Duration Check**: The slot start time + total duration of selected procedures ≤ provider's end time
2. **No Conflicts**: No existing appointments overlap with the required time window
3. **Within Working Hours**: Slot is within the provider's schedule for that day of week

### 3. Example Scenario

**Provider Configuration:**
- Working hours: 08:00 - 18:00
- Offers procedures: 15min, 30min, 60min
- Slot interval: 15min (based on shortest procedure)

**User Selection:**
- Procedure A: 30min
- Procedure B: 30min
- **Total duration: 60min**

**Existing Appointments:**
- 10:00 - 11:00 (blocked)
- 14:30 - 15:00 (blocked)

**Generated Slots:**

| Start Time | End Time | Available | Reason |
|------------|----------|-----------|---------|
| 08:00 | 08:15 | ✅ true | Can fit 60min (08:00-09:00), no conflicts |
| 08:15 | 08:30 | ✅ true | Can fit 60min (08:15-09:15), no conflicts |
| 08:30 | 08:45 | ✅ true | Can fit 60min (08:30-09:30), no conflicts |
| ... | ... | ✅ true | ... |
| 09:30 | 09:45 | ❌ false | 60min window (09:30-10:30) conflicts with 10:00 appointment |
| 09:45 | 10:00 | ❌ false | 60min window (09:45-10:45) conflicts with 10:00 appointment |
| 10:00 | 10:15 | ❌ false | Conflicts with existing appointment |
| ... | ... | ❌ false | ... |
| 11:00 | 11:15 | ✅ true | Can fit 60min (11:00-12:00), no conflicts |
| ... | ... | ... | ... |
| 17:00 | 17:15 | ✅ true | Can fit 60min (17:00-18:00), exactly fits |
| 17:15 | 17:30 | ❌ false | Cannot fit 60min (would need until 18:15, but closes at 18:00) |
| 17:30 | 17:45 | ❌ false | Cannot fit 60min |
| 17:45 | 18:00 | ❌ false | Cannot fit 60min |

## Response Format

```typescript
{
  date: string;                    // YYYY-MM-DD
  healthcareProviderId: string;    // Provider ID
  totalDurationMinutes: number;    // Sum of selected procedures
  slotIntervalMinutes: number;     // Based on shortest procedure
  workingHours: {
    startTime: string;             // HH:MM
    endTime: string;               // HH:MM
  };
  slots: Array<{
    startTime: string;             // HH:MM
    endTime: string;               // HH:MM (startTime + interval)
    available: boolean;            // true if can book, false otherwise
  }>;
}
```

## Response Example

```json
{
  "date": "2024-12-20",
  "healthcareProviderId": "clxxx123",
  "totalDurationMinutes": 60,
  "slotIntervalMinutes": 15,
  "workingHours": {
    "startTime": "08:00",
    "endTime": "18:00"
  },
  "slots": [
    {
      "startTime": "08:00",
      "endTime": "08:15",
      "available": true
    },
    {
      "startTime": "08:15",
      "endTime": "08:30",
      "available": true
    },
    {
      "startTime": "08:30",
      "endTime": "08:45",
      "available": false
    },
    {
      "startTime": "08:45",
      "endTime": "09:00",
      "available": false
    }
    // ... more slots
  ]
}
```

## Error Cases

### 400 Bad Request

**Provider Not Found:**
```json
{
  "message": "Healthcare provider not found"
}
```

**No Procedures Selected:**
```json
{
  "message": "At least one procedure must be specified"
}
```

**Invalid Procedures:**
```json
{
  "message": "One or more procedures not found or do not belong to this provider"
}
```

**No Procedures Configured:**
```json
{
  "message": "Healthcare provider has no procedures configured"
}
```

### No Schedule for Day

If the provider doesn't work on the selected day, returns:
```json
{
  "date": "2024-12-20",
  "healthcareProviderId": "clxxx123",
  "totalDurationMinutes": 60,
  "slotIntervalMinutes": 30,
  "workingHours": {
    "startTime": "00:00",
    "endTime": "00:00"
  },
  "slots": []
}
```

## Frontend Usage Examples

### React/React Native

```typescript
interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface TimeSlotsResponse {
  date: string;
  healthcareProviderId: string;
  totalDurationMinutes: number;
  slotIntervalMinutes: number;
  workingHours: {
    startTime: string;
    endTime: string;
  };
  slots: TimeSlot[];
}

// Fetch slots
const fetchTimeSlots = async (
  providerId: string,
  date: string,
  procedureIds: string[]
) => {
  const response = await fetch(
    `/healthcare-providers/${providerId}/slots?date=${date}&procedureIds=${procedureIds.join(',')}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return await response.json() as TimeSlotsResponse;
};

// Display in UI
const TimeSlotPicker = ({ slots }: { slots: TimeSlot[] }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.startTime}
          disabled={!slot.available}
          className={slot.available ? 'bg-green-500' : 'bg-gray-300'}
        >
          {slot.startTime}
        </button>
      ))}
    </div>
  );
};
```

### Display Patterns

**Grid View:**
```
08:00 ✅  08:15 ✅  08:30 ✅  08:45 ✅
09:00 ✅  09:15 ❌  09:30 ❌  09:45 ❌
10:00 ❌  10:15 ❌  10:30 ✅  10:45 ✅
```

**List View:**
```
✅ 08:00 - 08:15  Available
✅ 08:15 - 08:30  Available
❌ 08:30 - 08:45  Not Available
❌ 08:45 - 09:00  Not Available
```

**Time Picker:**
```
Morning (08:00 - 12:00)
  ✅ 08:00  ✅ 08:15  ✅ 08:30  ❌ 08:45

Afternoon (12:00 - 18:00)
  ✅ 13:00  ✅ 13:15  ❌ 13:30  ❌ 13:45
```

## Comparison with Availability Endpoint

| Feature | `/availability` | `/slots` |
|---------|----------------|----------|
| Returns | Only available slots | All slots with status |
| Response | `{ availableSlots: [...] }` | `{ slots: [{ available: true/false }] }` |
| Use Case | Simple booking form | Calendar/grid view |
| Slot Visibility | Hidden unavailable | Shows all slots |
| UI Pattern | Dropdown/select | Grid/calendar |

## Use Cases

### 1. Calendar View
Display a full day calendar with all time slots, visually indicating which are available.

### 2. Time Grid Selection
Show a grid where users can see the full schedule and understand why certain times are unavailable.

### 3. Next Available Slot
Frontend can easily find the next available slot by filtering `slots.filter(s => s.available)[0]`.

### 4. Availability Heatmap
Show patterns of availability throughout the day.

### 5. Smart Scheduling
Allow users to see all options and make informed decisions about appointment timing.

## Performance Considerations

- **Caching**: Consider caching slots for a provider+date+procedures combination
- **Rate Limiting**: Implement rate limiting as this endpoint can be called frequently
- **Indexing**: Ensure database indexes on:
  - `healthcare_provider_schedule.healthcareProviderId`
  - `healthcare_provider_schedule.dayOfWeek`
  - `appointment.scheduledAt`
  - `procedure.healthcareProviderId`

## Testing Examples

### Bruno/Postman

```http
GET {{baseUrl}}/healthcare-providers/{{providerId}}/slots?date=2024-12-20&procedureIds={{proc1}},{{proc2}}
Authorization: Bearer {{token}}
```

### cURL

```bash
curl -X GET \
  "http://localhost:3333/healthcare-providers/clxxx123/slots?date=2024-12-20&procedureIds=cly123,cly456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Implementation Details

### Slot Generation Algorithm

1. Get provider's shortest procedure duration → `slotInterval`
2. Get provider's working hours for the day → `startTime`, `endTime`
3. Generate slots from `startTime` to `endTime` at `slotInterval` increments
4. For each slot:
   - Check if `slotStart + totalDuration ≤ endTime`
   - Check for appointment conflicts in the time window `[slotStart, slotStart + totalDuration]`
   - Mark as `available: true` only if both conditions pass

### Time Complexity

- O(n × m) where:
  - n = number of slots (working hours / slot interval)
  - m = number of existing appointments

### Optimizations Applied

- Single database query for all appointments in the day
- In-memory conflict checking
- Early termination when slot cannot fit procedures