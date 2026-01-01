# ADR 001: Adopting Fastify v5

## Status
Accepted

## Context
We needed a Node.js framework for the Backend API.
Options:
1.  **Express**: Standard, but slow and outdated.
2.  **NestJS**: Powerful, but too much boilerplate/Java-like for this scope.
3.  **Fastify**: High performance, low overhead.

## Decision
We chose **Fastify**.

## Consequences
-   **Positive**:
    -   Benchmarks show 4x throughput vs Express.
    -   Native JSON schema validation (Ajv) prevents bad inputs.
    -   Great plugin ecosystem (fastify-cors, fastify-rate-limit).
-   **Negative**:
    -   Smaller community than Express (but growing).
    -   Plugin syntax slightly different for developers used to Express middleware.
