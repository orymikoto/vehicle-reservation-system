# Physical Data Model - MineFleet Vehicle Reservation System

Database Engine: **PostgreSQL 16**

---

## Tables Overview

### 1. `users`
Stores user accounts for Admins and Approvers.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full name |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | Email address |
| `password` | `VARCHAR(255)` | `NOT NULL` | Hashed password |
| `role` | `VARCHAR(50)` | `NOT NULL` | Role (`ADMIN`, `APPROVER`) |
| `remember_token` | `VARCHAR(100)` | `NULLABLE` | Auth session token |
| `created_at` | `TIMESTAMP` | `NOT NULL` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | Last update timestamp |

**Indexes**:
- `users_email_index` (`email`)
- `users_role_index` (`role`)

---

### 2. `vehicles`
Stores fleet vehicles managed by the mining company.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier |
| `plate_number` | `VARCHAR(50)` | `UNIQUE, NOT NULL` | Vehicle license plate |
| `brand` | `VARCHAR(100)` | `NOT NULL` | Brand (e.g. Toyota, Caterpillar) |
| `model` | `VARCHAR(100)` | `NOT NULL` | Model name |
| `type` | `VARCHAR(50)` | `NOT NULL` | Type (`PASSENGER`, `CARGO`, `HEAVY_EQUIPMENT`, `AMBULANCE`) |
| `ownership` | `VARCHAR(50)` | `NOT NULL` | Ownership classification (`COMPANY`, `RENTAL`) |
| `status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'AVAILABLE'` | Current state (`AVAILABLE`, `RESERVED`, `MAINTENANCE`, `INACTIVE`) |
| `created_at` | `TIMESTAMP` | `NOT NULL` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | Last update timestamp |
| `deleted_at` | `TIMESTAMP` | `NULLABLE` | Soft delete timestamp |

**Indexes**:
- `vehicles_plate_number_index` (`plate_number`)
- `vehicles_status_index` (`status`)
- `vehicles_type_ownership_index` (`type`, `ownership`)

---

### 3. `drivers`
Stores personnel qualified to drive fleet vehicles.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier |
| `name` | `VARCHAR(255)` | `NOT NULL` | Driver name |
| `license_number` | `VARCHAR(100)` | `UNIQUE, NOT NULL` | Driver license number |
| `phone` | `VARCHAR(50)` | `NOT NULL` | Phone contact |
| `status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'AVAILABLE'` | Status (`AVAILABLE`, `ON_DUTY`, `INACTIVE`) |
| `created_at` | `TIMESTAMP` | `NOT NULL` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | Last update timestamp |
| `deleted_at` | `TIMESTAMP` | `NULLABLE` | Soft delete timestamp |

**Indexes**:
- `drivers_license_number_index` (`license_number`)
- `drivers_status_index` (`status`)

---

### 4. `reservations`
Stores vehicle reservation requests.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier |
| `reservation_code` | `VARCHAR(50)` | `UNIQUE, NOT NULL` | Human readable code (e.g. `RSV-2026-0001`) |
| `user_id` | `UUID` | `FOREIGN KEY (users.id), NOT NULL` | Reservation creator (Admin) |
| `vehicle_id` | `UUID` | `FOREIGN KEY (vehicles.id), NOT NULL` | Assigned vehicle |
| `driver_id` | `UUID` | `FOREIGN KEY (drivers.id), NOT NULL` | Assigned driver |
| `purpose` | `VARCHAR(255)` | `NOT NULL` | Reservation purpose / mine region |
| `destination` | `VARCHAR(255)` | `NOT NULL` | Destination location |
| `start_datetime` | `TIMESTAMP` | `NOT NULL` | Start time of reservation |
| `end_datetime` | `TIMESTAMP` | `NOT NULL` | End time of reservation |
| `status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'PENDING'` | Status (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `COMPLETED`) |
| `current_approval_level` | `INTEGER` | `NOT NULL, DEFAULT 1` | Current required approval level (1 or 2) |
| `created_at` | `TIMESTAMP` | `NOT NULL` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | Last update timestamp |
| `deleted_at` | `TIMESTAMP` | `NULLABLE` | Soft delete timestamp |

**Indexes**:
- `reservations_code_index` (`reservation_code`)
- `reservations_status_index` (`status`)
- `reservations_dates_index` (`start_datetime`, `end_datetime`)
- `reservations_vehicle_driver_index` (`vehicle_id`, `driver_id`)

---

### 5. `reservation_approvals`
Stores sequential approval decisions for each reservation.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier |
| `reservation_id` | `UUID` | `FOREIGN KEY (reservations.id) ON DELETE CASCADE, NOT NULL` | Target reservation |
| `approver_id` | `UUID` | `FOREIGN KEY (users.id), NOT NULL` | Assigned approver |
| `approval_level` | `INTEGER` | `NOT NULL` | Level (1 or 2) |
| `status` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'PENDING'` | State (`PENDING`, `APPROVED`, `REJECTED`) |
| `notes` | `TEXT` | `NULLABLE` | Remarks / reason for rejection |
| `approved_at` | `TIMESTAMP` | `NULLABLE` | Decision timestamp |
| `created_at` | `TIMESTAMP` | `NOT NULL` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | Last update timestamp |

**Indexes**:
- `res_approvals_reservation_level_idx` (`reservation_id`, `approval_level`)
- `res_approvals_approver_status_idx` (`approver_id`, `status`)
- `res_approvals_unique_level` UNIQUE (`reservation_id`, `approval_level`)

---

### 6. `fuel_logs`
Tracks fuel consumption and costs per vehicle.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier |
| `vehicle_id` | `UUID` | `FOREIGN KEY (vehicles.id), NOT NULL` | Target vehicle |
| `driver_id` | `UUID` | `FOREIGN KEY (drivers.id), NOT NULL` | Logging driver |
| `fuel_date` | `DATE` | `NOT NULL` | Date of refueling |
| `fuel_amount` | `NUMERIC(10,2)`| `NOT NULL` | Liters |
| `fuel_cost` | `NUMERIC(14,2)`| `NOT NULL` | Cost in IDR / currency |
| `odometer` | `INTEGER` | `NOT NULL` | Odometer reading (km) |
| `notes` | `TEXT` | `NULLABLE` | Additional notes |
| `created_at` | `TIMESTAMP` | `NOT NULL` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | Last update timestamp |

**Indexes**:
- `fuel_logs_vehicle_date_idx` (`vehicle_id`, `fuel_date`)

---

### 7. `maintenance_logs`
Tracks maintenance schedules, workshops, and repair costs.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Unique identifier |
| `vehicle_id` | `UUID` | `FOREIGN KEY (vehicles.id), NOT NULL` | Target vehicle |
| `service_date` | `DATE` | `NOT NULL` | Date of service |
| `service_type` | `VARCHAR(100)` | `NOT NULL` | Service type (`ROUTINE`, `REPAIR`, `EMERGENCY`) |
| `workshop` | `VARCHAR(255)` | `NOT NULL` | Workshop name |
| `cost` | `NUMERIC(14,2)`| `NOT NULL` | Maintenance cost |
| `next_service_date` | `DATE` | `NULLABLE` | Recommended next service date |
| `notes` | `TEXT` | `NULLABLE` | Notes / work done |
| `created_at` | `TIMESTAMP` | `NOT NULL` | Creation timestamp |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | Last update timestamp |

**Indexes**:
- `maintenance_logs_vehicle_date_idx` (`vehicle_id`, `service_date`)
