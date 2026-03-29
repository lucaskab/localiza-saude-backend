# Localiza Saúde Backend - Architecture Documentation

## Overview

This project follows a **Clean Architecture** pattern with a functional programming approach, inspired by the challenge-hub-backend structure. The architecture is organized into distinct layers with clear separation of concerns.

## Architecture Layers

### 1. **Entities** (Prisma Models)
Located in: `prisma/schema/`

Database models defined using Prisma ORM. These represent the core business entities.

Example:
```prisma
model clinic {
  id          String     @id @default(cuid())
  name        String
  phone       String
  email       String     @unique
  type        ClinicType @default(MEDICAL)
  latitude    Float
  longitude   Float
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt()
}
```

### 2. **Repositories**
Located in: `src/http/repositories/`

Repositories handle data access and persistence. Each repository has:
- **Contract** (Interface): Defines the repository methods
- **Implementation**: Implements the contract using Prisma

**Pattern:**
```typescript
// Contract
export type ClinicRepository = {
  findAll: () => Promise<clinic[]>;
};

// Implementation
export const prismaClinicRepository: ClinicRepository = {
  async findAll() {
    const clinics = await prisma.clinic.findMany({
      orderBy: { createdAt: "desc" }
    });
    return clinics;
  },
};
```

### 3. **Use Cases**
Located in: `src/http/useCases/`

Use cases contain the business logic. They orchestrate the flow of data between repositories and controllers.

**Pattern:**
```typescript
export const getClinicsUseCase = {
  async execute(): Promise<{ clinics: clinic[] }> {
    const clinics = await prismaClinicRepository.findAll();
    return { clinics };
  },
};
```

### 4. **Controllers**
Located in: `src/http/controllers/`

Controllers handle HTTP request/response. They call use cases and return formatted responses.

**Pattern:**
```typescript
export const getClinicsController = {
  async handle(_: FastifyRequest, reply: FastifyReply) {
    const clinics = await getClinicsUseCase.execute();
    return reply.status(200).send(clinics);
  },
};
```

### 5. **Schemas** (Validation)
Located in: `src/schemas/routes/`

Zod schemas for request/response validation and OpenAPI documentation.

**Pattern:**
```typescript
export const getClinicsResponseSchema = z.object({
  clinics: z.array(clinicSchema),
});

export const getClinicsRouteOptions = {
  schema: {
    tags: ["Clinics"],
    summary: "Get all clinics",
    security: [{ bearerAuth: [] }],
    response: {
      200: getClinicsResponseSchema,
    },
  },
};
```

### 6. **Routes**
Located in: `src/http/routes/`

Route definitions that connect HTTP endpoints to controllers.

**Pattern:**
```typescript
const getClinics = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/clinics", getClinicsRouteOptions, getClinicsController.handle);
};

export default getClinics;
```

### 7. **Presenters** (Optional)
Located in: `src/http/presenters/`

Presenters transform data for HTTP responses. Use when you need to format or combine data before sending.

**Pattern:**
```typescript
export const clinicPresenter = {
  toHttp: (clinic: clinic) => {
    return {
      id: clinic.id,
      name: clinic.name,
      location: {
        lat: clinic.latitude,
        lng: clinic.longitude,
      },
    };
  },
};
```

### 8. **Providers**
Located in: `src/http/provider/`

Providers are utility services for specific operations (e.g., token generation, email sending).

**Pattern:**
```typescript
export const generateTokenProvider = {
  execute(userId: string) {
    const token = app.jwt.sign({ sub: userId }, { expiresIn: '1d' });
    return token;
  }
};
```

## Data Flow

```
Request → Route → Controller → Use Case → Repository → Database
                                    ↓
Response ← Presenter ← Controller ← Use Case
```

1. **HTTP Request** hits a route endpoint
2. **Route** passes request to appropriate **Controller**
3. **Controller** extracts data and calls **Use Case**
4. **Use Case** executes business logic using **Repositories**
5. **Repository** queries the database via Prisma
6. **Data flows back** through Use Case to Controller
7. **Presenter** (optional) formats the response
8. **Controller** sends HTTP response

## Functional Programming Principles

### 1. **Pure Functions**
Functions should be predictable and side-effect free when possible.

```typescript
// ✅ Good: Pure function
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ Bad: Side effects
let total = 0;
const calculateTotal = (items: Item[]) => {
  total = items.reduce((sum, item) => sum + item.price, 0);
};
```

### 2. **Composition**
Build complex operations from simple functions.

```typescript
const findAll = () => prisma.clinic.findMany();
const sortByDate = (clinics: clinic[]) => clinics.sort(...);
const filterActive = (clinics: clinic[]) => clinics.filter(...);

const getActiveClinics = async () => {
  const clinics = await findAll();
  return filterActive(sortByDate(clinics));
};
```

### 3. **Immutability**
Prefer const and avoid mutating data.

```typescript
// ✅ Good
const addClinic = (clinics: clinic[], newClinic: clinic) => {
  return [...clinics, newClinic];
};

// ❌ Bad
const addClinic = (clinics: clinic[], newClinic: clinic) => {
  clinics.push(newClinic);
  return clinics;
};
```

## Project Structure

```
src/
├── auth/                    # Better Auth configuration
│   └── index.ts
├── database/               # Database connection
│   └── prisma.ts
├── env.ts                  # Environment variables schema
├── http/
│   ├── controllers/        # HTTP request handlers
│   │   └── clinics/
│   │       └── get-clinics-controller.ts
│   ├── error-handler.ts    # Global error handling
│   ├── presenters/         # Response formatting
│   ├── provider/           # Utility providers
│   ├── repositories/       # Data access layer
│   │   └── clinics/
│   │       ├── clinics-repository-contract.ts
│   │       └── clinics-repository-implementation.ts
│   ├── routes/             # Route definitions
│   │   ├── _errors/        # Custom error classes
│   │   └── clinics/
│   │       └── get-clinics.ts
│   ├── server.ts           # Fastify server setup
│   └── useCases/           # Business logic
│       └── clinics/
│           └── get-clinics-use-case.ts
├── loaders/
│   └── router/
│       └── router.ts       # Auto-load all routes
└── schemas/
    └── routes/             # Zod validation schemas
        └── clinics/
            └── get-clinics.ts
```

## Creating a New Endpoint

Follow these steps to create a new endpoint (e.g., `GET /clinics/:id`):

### Step 1: Create Repository Contract
`src/http/repositories/clinics/clinics-repository-contract.ts`
```typescript
export type ClinicRepository = {
  findAll: () => Promise<clinic[]>;
  findById: (id: string) => Promise<clinic | null>; // ← Add this
};
```

### Step 2: Update Repository Implementation
`src/http/repositories/clinics/clinics-repository-implementation.ts`
```typescript
export const prismaClinicRepository: ClinicRepository = {
  async findAll() { /* ... */ },
  
  async findById(id: string) {
    return await prisma.clinic.findUnique({
      where: { id }
    });
  },
};
```

### Step 3: Create Use Case
`src/http/useCases/clinics/get-clinic-by-id-use-case.ts`
```typescript
import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";

export const getClinicByIdUseCase = {
  async execute(id: string) {
    const clinic = await prismaClinicRepository.findById(id);
    
    if (!clinic) {
      throw new BadRequestError("Clinic not found");
    }
    
    return { clinic };
  },
};
```

### Step 4: Create Schema
`src/schemas/routes/clinics/get-clinic-by-id.ts`
```typescript
import { z } from "zod";
import { clinicSchema } from "./get-clinics";

export const getClinicByIdParamsSchema = z.object({
  id: z.string().cuid(),
});

export const getClinicByIdResponseSchema = z.object({
  clinic: clinicSchema,
});

export const getClinicByIdRouteOptions = {
  schema: {
    tags: ["Clinics"],
    summary: "Get clinic by ID",
    params: getClinicByIdParamsSchema,
    response: {
      200: getClinicByIdResponseSchema,
    },
  },
};
```

### Step 5: Create Controller
`src/http/controllers/clinics/get-clinic-by-id-controller.ts`
```typescript
import type { FastifyReply, FastifyRequest } from "fastify";
import { getClinicByIdUseCase } from "@/http/useCases/clinics/get-clinic-by-id-use-case";
import type { GetClinicByIdParamsSchema } from "@/schemas/routes/clinics/get-clinic-by-id";

export const getClinicByIdController = {
  async handle(
    request: FastifyRequest<{ Params: GetClinicByIdParamsSchema }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const result = await getClinicByIdUseCase.execute(id);
    return reply.status(200).send(result);
  },
};
```

### Step 6: Create Route
`src/http/routes/clinics/get-clinic-by-id.ts`
```typescript
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getClinicByIdController } from "@/http/controllers/clinics/get-clinic-by-id-controller";
import { getClinicByIdRouteOptions } from "@/schemas/routes/clinics/get-clinic-by-id";

const getClinicById = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/clinics/:id", getClinicByIdRouteOptions, getClinicByIdController.handle);
};

export default getClinicById;
```

### Step 7: Done! ✅

The route is automatically loaded by the router loader. No need to manually register it.

## Code Conventions

### 1. **Naming Conventions**
- Files: `kebab-case.ts`
- Types/Interfaces: `PascalCase`
- Variables/Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Repository objects: `prisma{Entity}Repository`
- Use cases: `{action}{Entity}UseCase`
- Controllers: `{action}{Entity}Controller`

### 2. **File Organization**
- One entity per directory
- Group related files by feature
- Keep route files minimal (just route definition)
- Business logic goes in use cases, not controllers

### 3. **Error Handling**
Use custom error classes from `src/http/routes/_errors/`:
- `BadRequestError` - 400 status
- `UnauthorizedError` - 401 status

```typescript
if (!user) {
  throw new UnauthorizedError("User not authenticated");
}

if (!clinic) {
  throw new BadRequestError("Clinic not found");
}
```

### 4. **Type Safety**
- Always define types for function parameters and returns
- Use Zod schemas for validation
- Export types from schemas: `z.infer<typeof schema>`

### 5. **Async/Await**
- Always use async/await over promises
- Handle errors at the controller level (caught by error handler)

## Technology Stack

- **Runtime**: Bun
- **Framework**: Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod with fastify-type-provider-zod
- **Authentication**: Better Auth
- **Type Safety**: TypeScript

## Best Practices

1. **Keep layers independent**: Controllers shouldn't know about database implementation
2. **Single Responsibility**: Each function/module should do one thing well
3. **Dependency Injection**: Pass dependencies rather than importing them directly in use cases
4. **Test Business Logic**: Focus tests on use cases
5. **Validate Early**: Use Zod schemas at the route level
6. **Document APIs**: Use OpenAPI/Swagger tags and summaries

## Running the Project

```bash
# Install dependencies
bun install

# Generate Prisma Client
bun run generate

# Run migrations
bun run migrate

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## Environment Variables

Required variables in `.env`:

```env
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3333
```

## Additional Resources

- [Fastify Documentation](https://fastify.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zod Documentation](https://zod.dev/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
