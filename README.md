# MineFleet — Multi-Location Mining Vehicle Reservation System

[![Sekawan Media Recruitment Technical Test](https://img.shields.io/badge/Sekawan_Media-Project_Lead_Technical_Test-146C43?style=for-the-badge)](https://github.com/orymikoto/vehicle-reservation-system)
[![Laravel Version](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![PHP Version](https://img.shields.io/badge/PHP-8.3%2B-777BB4?style=for-the-badge&logo=php)](https://php.net)
[![React TypeScript](https://img.shields.io/badge/React-18_TypeScript-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)

**MineFleet** is a production-quality enterprise Vehicle Reservation System designed for a mining company operating across **6 operational mine sites** (Mine Site A to Mine Site F).

---

## 🔑 Demo Account Credentials

For evaluating the application across different user authorization roles:

| Role | Operational Scope | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Global (All 6 Mine Sites) | `admin@minefleet.com` | `password` |
| **Site Admin** | Mine Site A (Location Scoped) | `admin.loc-msa@minefleet.com` | `password` |
| **Approver L1** | Mine Site A (Level 1 Approval) | `approver1@minefleet.com` | `password` |
| **Approver L2** | Mine Site A (Level 2 Approval) | `approver2@minefleet.com` | `password` |

---

## 🛠️ Environment & Version Specifications

- **PHP Version**: `PHP 8.3+` (Strict typing enabled)
- **Database Engine**: `MySQL 8.0+` / `PostgreSQL 16`
- **Backend Framework**: `Laravel 12`
- **Frontend Framework**: `React 18` + `TypeScript` + `Vite`
- **Styling System**: `TailwindCSS v4` + Enterprise Light Theme System
- **Testing Engine**: `Pest 3.x`
- **Code Formatter**: `Laravel Pint` (PSR-12)

### 💡 Framework Selection Rationale
- **Laravel 12 (Backend)**: Provides robust ORM (Eloquent), built-in API authentication (`Sanctum`), database migrations, policy authorization, activity logging integration (`spatie/laravel-activitylog`), and Excel export capabilities (`maatwebsite/excel`).
- **React + TypeScript + Vite (Frontend)**: Guarantees strict compile-time type safety, sub-second Hot Module Replacement (HMR), reusability of component primitives, and responsive user experiences.

---

## 🚀 How to Install and Run Locally

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/orymikoto/vehicle-reservation-system.git
cd vehicle-reservation-system

# Install PHP dependencies
composer install

# Configure environment file
cp .env.example .env

# Set up database connection in .env (MySQL or PostgreSQL)
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=minefleet_db
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations and seed multi-location initial dataset
php artisan migrate:fresh --seed

# Start Laravel backend server
php artisan serve
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

### 3. Run Automated Tests & Formatter
```bash
# Run backend Pest test suite
php vendor/bin/pest

# Run code style formatter (PSR-12)
php vendor/bin/pint

# Run frontend TypeScript build check
npm run build
```

---

## ⚙️ Application Workflow & Features

1. **Multi-Location Fleet Management**: Vehicles, drivers, fuel logs, maintenance, and reservations belong to explicit operational mine sites.
2. **2-Level Sequential Approval Flow**:
   - Admin creates reservation -> Selects Level 1 & Level 2 Approvers.
   - Level 1 Approver approves -> Advances to Level 2.
   - Level 2 Approver approves -> Vehicle status automatically changes to `RESERVED`.
3. **Vehicle & Driver Time-Slot Overlap Validation**: Strict date/time range conflict checking during reservation creation prevents double-booking.
4. **Inter-Site Transfers**: 2-step approval workflow for moving vehicles and drivers between operational mine sites.
5. **Fuel & Maintenance Analytics**: Dashboard tracking monthly trends, fuel vs. maintenance spending, and site-level expense rankings with custom timeframe filters (3 Months, 1 Year, 3 Years).
6. **Filtered Excel Export**: Contextual filename generation (`rsv-data-[global/site]-yyyy-mm-dd.xlsx`) respecting active view search, status, and site filters.
7. **Audit Trail**: Spatie activity log records all login events, approvals, rejections, transfers, and deletions.

---

## 🏛️ Architecture & Design Principles

The project strictly enforces **Clean Architecture** principles across 4 decoupled layers:

```
Presentation (Controllers, Form Requests, API Resources)
    ↓
Application (Services, Actions, DTOs)
    ↓
Domain (Models, Enums, Policies, Domain Rules)
    ↓
Infrastructure (Repositories, Database, Spatie Activity Log, Maatwebsite Excel)
```

### Architecture Highlights:
- **Controllers** only validate, authorize, call services, and return responses (Max 150 lines).
- **Services** encapsulate all business logic, transactions, and approval rules (Max 300 lines).
- **Repositories** handle data persistence and eager loading to eliminate N+1 queries.
- **DTOs** pass strongly-typed data between Presentation and Application layers.
- **Policies** enforce role and location-scoped authorization.
