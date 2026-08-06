---
trigger: always_on
---

# Architecture Guidelines

## Goal

The system should be maintainable, testable, scalable, and easy to understand.

Optimize for long-term maintainability over short-term convenience.

Business logic must never depend on Laravel-specific implementation details.

---

# Architecture

Follow Clean Architecture.

Presentation

↓

Application

↓

Domain

↓

Infrastructure

Dependencies always point inward.

Never violate this rule.

---

# Layers

## Presentation

Responsibilities

- Controllers
- Form Requests
- API Resources
- Routes

Presentation should:

- validate input
- authorize request
- delegate work
- return response

No business logic.

---

## Application

Contains

- Services
- Actions
- DTOs

Responsible for

- orchestrating workflows
- transactions
- business use cases

Services may call multiple repositories.

Services never return Eloquent models directly.

Prefer DTOs.

---

## Domain

Contains

- Models
- Enums
- Policies
- Domain Rules
- Value Objects

This layer represents business concepts.

Avoid infrastructure concerns.

---

## Infrastructure

Contains

Repositories

Database

Logging

Notifications

Excel

Storage

Queue

Mail

Infrastructure implements interfaces defined by the application layer.

---

# Folder Structure

app/

    Actions/

    Contracts/

    DTO/

    Enums/

    Events/

    Exceptions/

    Http/

    Listeners/

    Models/

    Observers/

    Policies/

    Repositories/

    Services/

    Traits/

---

# Controllers

Controllers should remain small.

Ideal size

30–80 lines.

Maximum

150 lines.

Controllers should never contain:

- SQL
- loops with business rules
- calculations
- approval logic

---

# Services

Every business process belongs to a Service.

Examples

ReservationService

ApprovalService

VehicleService

DashboardService

FuelService

MaintenanceService

---

# Repository Pattern

Repositories encapsulate persistence.

Controllers never query models directly.

Services never construct SQL.

Repositories own data retrieval.

---

# Transactions

Multi-step operations must use transactions.

Examples

Reservation creation

Approval

Vehicle assignment

Status updates

---

# Events

Use events when something meaningful happens.

Examples

ReservationCreated

ReservationApproved

ReservationRejected

VehicleAssigned

FuelLogged

MaintenanceCompleted

Events should not contain business logic.

---

# Logging

Every important action creates an activity log.

Never duplicate logging logic.

Centralize it.

---

# Validation

Always use Form Requests.

Validation never belongs inside controllers.

---

# Authorization

Use Laravel Policies.

Never check roles manually inside controllers.

Use abilities.

---

# DTO

Use DTOs between Presentation and Application.

Avoid passing Request objects into Services.

---

# Database

Use UUIDs when practical.

Foreign keys required.

Indexes required.

Soft Deletes where appropriate.

Consistent naming.

---

# Performance

Always eager load relationships.

Paginate lists.

Avoid N+1 queries.

Cache dashboard statistics when appropriate.

---

# Error Handling

Never expose internal exceptions.

Use custom exceptions.

Return meaningful responses.

Log unexpected failures.

---

# Testing

Business logic should be testable without HTTP.

Focus tests on Services.

Feature tests verify endpoints.

Unit tests verify business rules.

---

# SOLID

Follow all SOLID principles.

Prefer composition over inheritance.

Avoid static helper classes.

---

# Code Style

Strict typing.

PSR-12.

Descriptive names.

Small functions.

Single Responsibility.

Readable over clever.

---

# Definition of Good Code

Good code is:

- predictable
- readable
- discoverable
- testable
- replaceable
- documented

The project should be understandable by a new engineer within one hour without additional explanation.
