# Clean Architecture Guidelines - MineFleet

MineFleet enforces strict **Clean Architecture** principles to isolate core domain business rules from frameworks, web protocols, and persistence mechanisms.

---

## 1. Architectural Layers & Principles

```
+-------------------------------------------------------------+
|                     PRESENTATION LAYER                      |
| (Http Controllers, API Resources, Form Requests, Routing)   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                      APPLICATION LAYER                      |
|  (Use Cases / Services, Workflow Actions, DTO Transfer)     |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                        DOMAIN LAYER                         |
| (Entities / Eloquent Models, Business Rules, Enums, Policies)|
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    INFRASTRUCTURE LAYER                     |
| (Repositories, Activity Log, Database, Queues, Excel Export)|
+-------------------------------------------------------------+
```

### Dependency Rule
Dependencies strictly point **inward**.
- Presentation depends on Application and Domain interfaces.
- Application depends on Domain contracts.
- Infrastructure implements Application/Domain Contracts.
- Domain **never** depends on Presentation or Infrastructure.

---

## 2. Directory Mapping & Layer Responsibilities

```
app/
├── Actions/          # Atomic single-purpose application workflows
├── Contracts/        # Interface definitions for Repositories & Services
├── DTO/              # Data Transfer Objects strictly typed for layer crossing
├── Enums/            # Domain enums (ReservationStatus, VehicleType, etc.)
├── Events/           # Domain and application events
├── Exceptions/       # Custom business exception handlers
├── Http/
│   ├── Controllers/  # Max 150 lines, input/output delegation only
│   ├── Requests/     # Form Requests enforcing request validation
│   └── Resources/    # JSON API response serializers
├── Listeners/        # Event listeners and asynchronous processors
├── Models/           # Eloquent Entities & Relationships
├── Observers/       # Model event listeners
├── Policies/         # Authorization rules per resource
├── Repositories/     # Infrastructure data access implementations
├── Services/         # Max 300 lines, core business orchestration
└── Traits/           # Cross-cutting reusable behavioral traits
```

---

## 3. Strict Layering Enforcement Rules

1. **Controllers**:
   - Must only validate requests via Form Requests.
   - Must check authorization via Laravel Policies (`$this->authorize(...)`).
   - Call Application Services passing strictly typed DTOs.
   - Must return API Resource objects or HTTP JSON status codes.
   - **Zero SQL queries or business rules inside Controllers**.

2. **Services**:
   - Orchestrate business workflows and DB transactions.
   - Interact with database via Repository interfaces.
   - Dispatch domain events and record activity logs via `spatie/laravel-activitylog`.
   - Never accept HTTP `$request` objects directly; use DTOs.

3. **Repositories**:
   - Encapsulate data retrieval and persistence logic.
   - Prevent N+1 queries by explicitly defining eager loading relationships.

4. **DTOs**:
   - Read-only data containers initialized from Form Requests.
   - Provide strong static typing across layers.
