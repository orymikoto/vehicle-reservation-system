---
trigger: always_on
---

# Repository Rules

## Project

Project Name

MineFleet

Repository

vehicle-reservation-system

Purpose

Develop a production-quality Vehicle Reservation System for a mining company as described in the technical test.

This is NOT a prototype.

Every implementation should be maintainable, extensible, and follow clean architecture principles.

---

# Tech Stack

Backend

- Laravel 12
- PHP 8.3+
- Laravel Sanctum
- PostgreSQL 16

Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui

Charts

- ApexCharts

Export

- Laravel Excel

Logging

- spatie/laravel-activitylog

Testing

- Pest

Formatting

- Laravel Pint
- ESLint
- Prettier

---

# Architecture

Strictly follow

Clean Architecture

Presentation

Application

Domain

Infrastructure

Never place business logic inside Controllers.

Controllers should only

- validate
- authorize
- call services
- return response

Business rules belong inside Services.

Database access belongs inside Repositories.

---

# Folder Structure

app/

    Actions/

    DTO/

    Enums/

    Events/

    Exceptions/

    Http/

        Controllers/

        Requests/

        Resources/

    Listeners/

    Models/

    Observers/

    Policies/

    Repositories/

    Services/

    Traits/

    Contracts/

database/

docs/

tests/

---

# Design Principles

Follow

- SOLID
- DRY
- KISS
- Clean Code
- Convention over Configuration

Never duplicate logic.

Never hardcode IDs.

Never hardcode approval levels.

---

# Naming

Controllers

VehicleController

ReservationController

ApprovalController

DashboardController

ReportController

Services

VehicleService

ReservationService

ApprovalService

DashboardService

ReportService

Repositories

VehicleRepository

ReservationRepository

ApprovalRepository

DTO

CreateReservationDTO

ApproveReservationDTO

RejectReservationDTO

Enums

ReservationStatus

ApprovalStatus

VehicleStatus

---

# Authentication

Use Laravel Sanctum.

Two roles

- Admin
- Approver

Never use role IDs.

Always use role names.

---

# Authorization

Policies must be used.

Never check role inside controller.

Use

VehiclePolicy

ReservationPolicy

ApprovalPolicy

---

# Reservation Flow

Flow

Admin

↓

Create Reservation

↓

Assign Vehicle

↓

Assign Driver

↓

Select Level 1 Approver

↓

Select Level 2 Approver

↓

Approval Level 1

↓

Approval Level 2

↓

Approved

↓

Vehicle Usage

↓

History Recorded

Reservation cannot be used before final approval.

---

# Approval Rules

Minimum

2 approval levels.

Approver cannot approve twice.

Rejected reservations cannot continue approval.

Every approval must create activity log.

---

# Dashboard

Dashboard should contain

- Total Vehicles
- Available Vehicles
- Reserved Vehicles
- Under Maintenance

Charts

- Monthly Reservation
- Vehicle Utilization
- Fuel Consumption
- Reservation Status
- Top Used Vehicles

Dashboard queries should be optimized.

Avoid N+1 queries.

---

# Vehicle Module

Vehicle contains

- Plate Number
- Brand
- Model
- Type
- Ownership

Company

Rental

Status

Available

Reserved

Maintenance

Inactive

---

# Driver Module

Driver contains

- Name
- License Number
- Phone
- Status

---

# Fuel Module

Track

Vehicle

Fuel Date

Fuel Amount

Fuel Cost

Odometer

Notes

---

# Maintenance Module

Track

Vehicle

Service Date

Service Type

Workshop

Cost

Next Service

Notes

---

# Reports

Reports

Reservation Report

Vehicle Usage

Fuel Report

Maintenance Report

Export

Excel

Large exports should use queues if appropriate.

---

# Logging

Every important action must be logged.

Examples

Login

Logout

Reservation Created

Reservation Updated

Reservation Deleted

Approval

Reject

Vehicle Assigned

Driver Assigned

Export

CRUD

Use

spatie activity log

---

# Validation

Always use Form Requests.

Never validate inside controller.

---

# Database

Use UUID when practical.

Use foreign key constraints.

Use indexes.

Use soft deletes where appropriate.

Never use nullable foreign keys unless required.

---

# Migration Rules

Every migration

- foreign keys
- indexes
- cascade rules

---

# Seeders

Create

Roles

Users

Vehicles

Drivers

Approvers

Admin

Sample Reservations

---

# UI

Responsive

Desktop

Tablet

Mobile

Use

shadcn/ui

No Bootstrap.

---

# Components

Reusable components only.

Never duplicate forms.

Never duplicate tables.

---

# API

RESTful.

Naming

GET /vehicles

POST /vehicles

PUT /vehicles/{id}

DELETE /vehicles/{id}

Use Resource classes.

Never expose internal IDs unnecessarily.

---

# Performance

Always eager load relationships.

Use pagination.

Avoid duplicate queries.

Avoid raw SQL unless necessary.

---

# Code Style

PSR-12

Strict typing.

Small methods.

Single Responsibility.

Maximum controller length

150 lines.

Maximum service length

300 lines.

---

# Tests

Create tests for

Reservation

Approval

Authentication

Authorization

Dashboard

Reports

Export

---

# Documentation

README must include

Installation

Environment

PHP Version

Database Version

Framework Version

Credentials

Seed Data

Features

Architecture

Folder Structure

Commands

Screenshots

---

# Documentation Folder

Generate

docs/

    ERD.md

    PhysicalDataModel.md

    ActivityDiagram.md

    SequenceDiagram.md

    Architecture.md

---

# Git

Commits

feat:

fix:

refactor:

docs:

test:

style:

chore:

Never commit generated files unnecessarily.

---

# AI Behavior

Before implementing

1. Read existing code.

2. Search for reusable components.

3. Avoid duplicate implementation.

4. Follow existing naming conventions.

5. Ask only when requirements are ambiguous.

6. Never rewrite working code without reason.

7. Keep commits focused.

8. Keep architecture consistent.

9. Prefer maintainability over cleverness.

10. Every new feature must include validation, authorization, logging, tests, and documentation.

---

# Definition of Done

A task is complete only if

✓ Feature works

✓ Validation exists

✓ Authorization exists

✓ Logging exists

✓ Tests pass

✓ Responsive UI

✓ Documentation updated

✓ No lint errors

✓ No Pint errors

✓ No TypeScript errors

✓ No N+1 queries

✓ Production-ready code
