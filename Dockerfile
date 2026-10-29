# ── Stage 1: Build frontend ───────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/crmfs
COPY crmfs/package*.json ./
RUN npm ci

COPY crmfs/ ./
RUN VITE_OUT_DIR=dist npm run build

# ── Stage 2: Build backend ────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build

WORKDIR /app/demo

# Copy built frontend into Spring Boot static resources
COPY --from=frontend-build /app/crmfs/dist ./src/main/resources/static

# Copy Maven files and download dependencies (cached layer)
COPY demo/pom.xml ./
RUN mvn dependency:go-offline -q

# Copy source and build, skipping the frontend exec plugin since we already built it
COPY demo/src ./src
RUN mvn clean package -DskipTests -Dfrontend.skip=true -q

# ── Stage 3: Runtime ──────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=backend-build /app/demo/target/*.jar app.jar

EXPOSE 8080

# Use shell form so env vars expand at runtime
ENTRYPOINT java -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} -jar app.jar
