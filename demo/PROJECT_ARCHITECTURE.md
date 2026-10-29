# CRM & Authentication Modular Architecture

This project has been restructured into a modular, clean-code architecture to ensure a clear separation of concerns between **Authentication** and **CRM** functionalities.

## 🏗️ Project Structure

The project is organized under the base package `com.hokma.auth.demo`:

### 1. `auth` Module (Authentication & Identity)
Handles all user identity, security, and session management.
- **`config`**: Security (JWT/OAuth2) and Swagger configurations.
- **`controller`**: `AuthController` for login, registration, and token management.
- **`dto`**: Authentication-specific objects (`LoginDto`, `AuthResponseDto`, etc.).
- **`entity`**: Core identity models (`User`, `Role`, `Provider`).
- **`repository`**: `UserRepository` for database access.
- **`security`**: Low-level security logic (`JwtService`, `JwtAuthenticationFilter`, `OAuth2LoginSuccessHandler`).
- **`service`**: Business logic for users and authentication.

### 2. `crm` Module (Customer Relationship Management)
Handles all business logic related to the CRM platform.
- **`controller`**: Endpoints for `Contacts`, `Leads`, `Analytics`, and `User Management`.
- **`dto`**: CRM-specific data transfer objects.
- **`entity`**: CRM models (`Contact`, `Lead`).
- **`repository`**: `ContactRepository`, `LeadRepository`.
- **`service`**: Logic for managing the CRM pipeline and dashboard statistics.

### 3. `shared` Module (Cross-Cutting Concerns)
Common utilities and configurations used by both modules.
- **`config`**: Shared bean definitions (e.g., `ModelMapper`).
- **`dto`**: Generic response structures like `ErrorResponse`.
- **`exception`**: Global exception handling logic.
- **`helper`**: Generic utility classes.

---

## 🔒 Security Posture

- **Stateless Authentication**: Uses JWT (JSON Web Tokens).
- **Hardened Filter**: `JwtAuthenticationFilter` intercepts and validates all requests, providing detailed JSON error responses for invalid/expired tokens.
- **Protected Routes**: All `/api/v1/**` endpoints (except login/register) require a valid Bearer token.
- **OAuth2 Integration**: Supports Google Login.

## 🚀 Getting Started

### 1. Database Setup
Ensure PostgreSQL is running and update `src/main/resources/application-dev.yaml` with your credentials:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/crm_db
    username: <your_username>
    password: <your_password>
```

### 2. Environment Variables
Standard defaults are provided, but for production, ensure `security.jwt.secret` is a long, random string.

### 3. Running the App
```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### 4. API Documentation
Once running, visit:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Doc**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 🧪 Development Notes
- **Lombok**: The project uses Lombok for boilerplate reduction. Ensure your IDE has the Lombok plugin installed.
- **JDK Compatibility**: Configured for compatibility with modern JDKs (up to Java 25).
- **ModelMapper**: Used for mapping between Entities and DTOs to keep layers decoupled.
