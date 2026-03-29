# Localiza Saúde - Bruno API Collection

Complete Bruno collection for testing all Localiza Saúde API endpoints.

## 📦 What's Included

This collection contains all 6 clinic endpoints:

1. **List All Clinics** - GET `/clinics`
2. **Get Clinic by ID** - GET `/clinics/:id`
3. **Find Nearby Clinics** - GET `/clinics/nearby`
4. **Create Clinic** - POST `/clinics` (Auth required)
5. **Update Clinic** - PUT `/clinics/:id` (Auth required)
6. **Delete Clinic** - DELETE `/clinics/:id` (Auth required)

## 🚀 Quick Start

### 1. Open in Bruno

1. Open Bruno
2. Click **Open Collection**
3. Navigate to: `localiza-saude-backend/bruno-collection`
4. Select the folder and open

### 2. Select Environment

- **Local**: For local development (http://localhost:3333)
- **Production**: For production API (configure URL)

Switch environments in Bruno's environment dropdown.

### 3. Start Testing

1. Make sure your server is running: `bun run dev`
2. Select "Local" environment
3. Click on any request and hit "Send"

## 🌍 Environments

### Local Environment

Pre-configured with:
- `baseUrl`: http://localhost:3333
- `clinicId`: Sample clinic ID from seed data
- `ownerId`: Sample owner ID from seed data
- `latitude`: -23.5505 (São Paulo - Paulista Ave)
- `longitude`: -46.6333
- `radiusInKm`: 2
- `authToken`: your_auth_token_here (update this!)

### Production Environment

Template for production API:
- `baseUrl`: https://api.localizasaude.com
- All other variables need to be configured

## 📝 Request Details

### No Authentication Required

- **List All Clinics**: Returns all clinics
- **Get Clinic by ID**: Returns specific clinic
- **Find Nearby Clinics**: Geospatial search

### Authentication Required

- **Create Clinic**: POST with Bearer token
- **Update Clinic**: PUT with Bearer token
- **Delete Clinic**: DELETE with Bearer token

**Note**: Update `authToken` in your environment variables before using authenticated endpoints.

## 🔧 Configuration

### Update Environment Variables

1. Click on **Environments** in Bruno
2. Select **Local** (or create new environment)
3. Update variables as needed:

```
vars {
  baseUrl: http://localhost:3333
  clinicId: your_clinic_id
  ownerId: your_owner_id
  authToken: your_actual_token
  latitude: -23.5505
  longitude: -46.6333
  radiusInKm: 2
}
```

### Get Actual IDs

After seeding the database, get real IDs:

```bash
# List all clinics and get IDs
curl http://localhost:3333/clinics | jq '.clinics[].id'

# Use one of these IDs in your environment
```

## 🧪 Testing Workflow

### Basic Flow

1. **List All Clinics** - Verify API is working
2. **Get Clinic by ID** - Test with specific clinic
3. **Find Nearby** - Test geospatial search
4. **Create** - Add new clinic (requires auth)
5. **Update** - Modify clinic (requires auth)
6. **Delete** - Remove clinic (requires auth)

### Quick Verification

1. Select "List All Clinics"
2. Click "Send"
3. Should return 10 clinics (from seed data)

## 📍 Test Coordinates

Pre-configured test locations:

### São Paulo
- Paulista Ave: `-23.5505, -46.6333`
- Jardins: `-23.5685, -46.6641`
- Vila Mariana: `-23.5880, -46.6361`

### Rio de Janeiro
- Copacabana: `-22.9711, -43.1822`
- Ipanema: `-22.9838, -43.2043`
- Centro: `-22.9068, -43.1729`

Update `latitude` and `longitude` in environment to test different locations.

## 🔑 Authentication

For endpoints requiring authentication:

### Option 1: Environment Variable (Recommended)

1. Get your auth token from the auth endpoint
2. Add to environment: `authToken: your_token_here`
3. All authenticated requests will use this token

### Option 2: Manual Token

1. Open any authenticated request (Create, Update, Delete)
2. Go to **Auth** tab
3. Select **Bearer Token**
4. Paste your token

## 📊 Expected Responses

### Success Responses

**List All Clinics (200)**:
```json
{
  "clinics": [...]
}
```

**Get Clinic (200)**:
```json
{
  "clinic": {
    "id": "...",
    "name": "...",
    ...
  }
}
```

**Create/Update Clinic (201/200)**:
```json
{
  "clinic": {...}
}
```

**Delete Clinic (200)**:
```json
{
  "message": "Clinic deleted successfully"
}
```

### Error Responses

**Not Found (400)**:
```json
{
  "message": "Clinic not found"
}
```

**Validation Error (400)**:
```json
{
  "message": "Validation error",
  "errors": [...]
}
```

**Unauthorized (401)**:
```json
{
  "message": "Unauthorized"
}
```

## 🎯 Tips

### Use Scripts

Bruno supports scripts! Add in the **Scripts** tab:

```javascript
// After creating a clinic, save the ID
if (res.status === 201) {
  bru.setEnvVar("clinicId", res.body.clinic.id);
}
```

### Chain Requests

1. Create clinic → Save ID to environment
2. Update clinic → Use saved ID
3. Delete clinic → Use saved ID

### Test Different Scenarios

- Create clinics with different types (MEDICAL, DENTAL, etc.)
- Test nearby search with various radii
- Update specific fields
- Test validation errors

## 📚 Documentation

For more details, see:
- **API Reference**: `CLINICS_API.md`
- **Test Data**: `TEST_DATA.md`
- **Quick Guide**: `QUICK_TEST_GUIDE.md`

## 🔄 Updating IDs

After re-seeding the database:

```bash
# Re-seed
bun run seed

# Get new IDs
curl http://localhost:3333/clinics | jq '.clinics[0].id'

# Update in Bruno environment variables
```

## 🛠️ Troubleshooting

### "Connection refused"
- Make sure server is running: `bun run dev`
- Check baseUrl is correct: `http://localhost:3333`

### "Clinic not found"
- Update `clinicId` in environment with valid ID
- Run: `curl http://localhost:3333/clinics` to see valid IDs

### "Unauthorized"
- Add valid `authToken` in environment variables
- Get token from auth endpoint first

### No clinics returned
- Re-seed database: `bun run seed`
- Verify server is connected to database

## 📦 Collection Structure

```
bruno-collection/
├── bruno.json                      # Collection config
├── environments/
│   ├── Local.bru                  # Local environment
│   └── Production.bru             # Production template
├── Clinics/
│   ├── List All Clinics.bru       # GET /clinics
│   ├── Get Clinic by ID.bru       # GET /clinics/:id
│   ├── Find Nearby Clinics.bru    # GET /clinics/nearby
│   ├── Create Clinic.bru          # POST /clinics
│   ├── Update Clinic.bru          # PUT /clinics/:id
│   └── Delete Clinic.bru          # DELETE /clinics/:id
└── README.md                       # This file
```

## ✅ Quick Checklist

Before using:
- [ ] Server is running (`bun run dev`)
- [ ] Database is seeded (`bun run seed`)
- [ ] Collection opened in Bruno
- [ ] "Local" environment selected
- [ ] Environment variables configured
- [ ] Auth token added (for protected endpoints)

## 🎉 You're Ready!

Start testing the API with Bruno! 

Select any request and click "Send" to begin.

---

**Happy Testing! 🚀**