# Backend Architecture & Component Documentation

This document describes the backend architecture, specifically focusing on the newly implemented SOLID principles. By segregating the application logic into loosely coupled and cohesive components, the backend is now more robust, testable, and maintainable.

## 1. Core Principles Applied

- **Single Responsibility Principle (SRP):** Each class now has a single reason to change. Services (e.g., [ContactServiceImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/ContactServiceImpl.java#20-117)) handle pure business coordination, `Mappers` handle DTO-Entity translations, and `Validators` handle validation and security constraints.
- **Open/Closed Principle (OCP):** Validations and Data Mappings are implemented through generic interfaces (`Mapper<E, D>`, `Validator<D>`). If new mappings or validations are required, we can create new implementations without modifying existing code.
- **Liskov Substitution Principle (LSP):** Concrete classes implement domain-specific interfaces, meaning any component relying on [ContactService](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/ContactServiceImpl.java#20-117) or [ContactValidator](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/validator/ContactValidator.java#8-11) can accept any implementation honoring the contract.
- **Interface Segregation Principle (ISP):** We introduced focused interfaces like [Mapper](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/shared/mapper/Mapper.java#3-7), [Validator](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/shared/validator/Validator.java#3-7), and [OwnershipValidator](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/shared/validator/OwnershipValidator.java#5-8) instead of a bulky monolith interface, so components need only depend on the validations/mappings they use.
- **Dependency Inversion Principle (DIP):** Top-level logic components rely strictly on abstract interfaces instead of concrete classes (e.g., [ContactServiceImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/ContactServiceImpl.java#20-117) depends on the [ContactMapper](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/mapper/ContactMapper.java#7-9) interface, not [ContactMapperImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/mapper/ContactMapperImpl.java#7-51)).

---

## 2. Component Descriptions

### **2.1 Shared Abstractions (SOLID Core)**

- `shared/mapper/Mapper<E, D>`
  - generic interface handling bidirectional transformation between an Entity `E` and a Data Transfer Object `D`.
- `shared/validator/Validator<D>`
  - generic interface handling DTO validation rules for CRUD actions ([validateForCreate](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/shared/validator/Validator.java#4-5), [validateForUpdate](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/validator/LeadValidatorImpl.java#24-28)).
- `shared/validator/OwnershipValidator<E>`
  - interface specifically handling resource ownership authorization validation.

### **2.2 CRM Module (`crm/`)**

#### **Contact Components**
- **[ContactController](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/controller/ContactController.java#18-72)**: Only responsible for HTTP communication. Marshals requests and responses and interacts directly with [ContactService](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/ContactServiceImpl.java#20-117).
- **[ContactServiceImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/ContactServiceImpl.java#20-117)**: The orchestration layer. It depends heavily on abstraction injections to coordinate saving, mapping, and validating the contact entity. It delegates validation and data transformation.
- **[ContactValidatorImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/validator/ContactValidatorImpl.java#13-47)**: Encapsulates data validation ([validateEmailUniqueness](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/auth/validator/UserValidator.java#7-8)) and ownership rules. Throws standard API exceptions on rule violations.
- **[ContactMapperImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/mapper/ContactMapperImpl.java#7-51)**: Defines custom logic defining how to transition properties smoothly between `ContactDto` and [Contact](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/controller/ContactController.java#32-37) domain objects. Includes fallback strategies for default fields.
- **`ContactRepository`**: Pure Spring Data JPA abstraction responsible for interacting with the raw database.

#### **Lead Components**
- **[LeadController](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/controller/LeadController.java#18-63)**: Orchestrates external HTTP traffic routing to the [LeadService](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/LeadServiceImpl.java#21-120). Features endpoints like creation, retrieval, updates, and status toggles.
- **[LeadServiceImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/LeadServiceImpl.java#21-120)**: Pure business process layer. Enforces rules regarding creation, data linkage with [Contact](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/controller/ContactController.java#32-37), and orchestrates data preservation.
- **[LeadValidatorImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/validator/LeadValidatorImpl.java#13-49)**: Responsible solely for contextual validation scenarios, such as ensuring that the assigned Contact validly belongs to the authenticated user attempting the linkage.
- **[LeadMapperImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/mapper/LeadMapperImpl.java#7-49)**: Encloses mapping rules mapping the Lead entity and resolving relations gracefully without cyclical reference breakdowns into the final DTO payload.
- **`LeadRepository`**: Native JPA interface defining persistence instructions.

#### **Analytics Components**
- **`AnalyticsController`**: The entrypoint for reading aggregate data.
- **[AnalyticsServiceImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/AnalyticsServiceImpl.java#17-79)**: Aggregates disparate data metrics directly from standard repositories to assemble complex operational dashboard data representations.

#### **Task Components**
- **`TaskController`**: HTTP API for task CRUD, list visible tasks, dashboard tasks, and tasks by team.
- **`TaskServiceImpl`**: Orchestrates task creation/update with validation, assignee and team resolution; depends on `TaskMapper`, `TaskValidator`, `TaskRepository`, `TeamRepository`, `LeadRepository`, `UserRepository`.
- **`TaskValidatorImpl`**: Validates title and assignee; enforces ownership (creator, assignee, or team member) and team access.
- **`TaskMapperImpl`**: Maps between `Task` entity and `TaskDto`.
- **`TaskRepository`**: Queries by assignee, team, and “visible to user” (assigned to me or team task where I am member).

#### **Team Components**
- **`TeamController`**: HTTP API for team CRUD and add/remove members.
- **`TeamServiceImpl`**: Creates teams (owner + self as member), updates/deletes with ownership check; add/remove members with owner check.
- **`TeamValidatorImpl`**: Validates team name; enforces ownership (owner or member) for access.
- **`TeamMapperImpl`**: Maps between `Team` entity and `TeamDto` (including owner and member ids/names).
- **`TeamRepository`**: Queries by owner and by member or owner.
- **Pipeline by team**: `LeadService.getLeadsForTeam(teamId, pageable)` returns leads assigned to any member of the team; `LeadController` exposes `GET /leads/team/{teamId}`.

### **2.3 Authentication & User Module (`auth/`)**

- **`AuthController` & [AuthServiceImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/auth/service/impl/AuthServiceImpl.java#20-71)**: Act as the gatekeeper, governing explicit authentication exchanges logic (login, JWT generation, registration workflows). 
- **`UserController` & [UserServiceImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/auth/service/impl/UserServiceImpl.java#18-99)**: Handles isolated user resource data configurations (updating profiles). Now utilizes [UserValidator](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/auth/validator/UserValidator.java#6-9) to isolate strict credential policies.
- **[UserValidator](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/auth/validator/UserValidator.java#6-9) / [UserValidatorImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/auth/validator/UserValidatorImpl.java#8-34)**: An isolated interface testing `UserDto` preconditions before persistence (e.g. verifying email distinctness against the DB).
- **`SecurityConfig` & Jwt Filters**: Ensures strict stateless request policies, evaluating Bearer token presences and converting tokens to Spring `Authentication` threads securely.

---

## 3. Workflow Example (Creating a Contact)

1. The client invokes `POST /api/v1/contacts` -> **[ContactController](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/controller/ContactController.java#18-72)**.
2. **[ContactController](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/controller/ContactController.java#18-72)** routes payload to **[ContactServiceImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/ContactServiceImpl.java#20-117)**.
3. **[ContactServiceImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/ContactServiceImpl.java#20-117)** calls **`ContactValidator.validateForCreate`** -> Confirms the email is purely unique via repository rules.
4. **[ContactServiceImpl](file:///c:/Users/HP/IdeaProjects/crm/demo/src/main/java/com/hokma/auth/demo/crm/service/impl/ContactServiceImpl.java#20-117)** calls **`ContactMapper.toEntity`** -> Converts purely the incoming details securely into a local raw Java Entity.
5. Entity ownership binds to context user -> Persists to the repository organically.
6. The fully saved entity passes back into **`ContactMapper.toDto`** and routes downstream gracefully back to the user invoking the API.
