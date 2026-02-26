# AssetsAlly Implementation Plan

## Overview
Full-stack implementation of an offline-first mobile auditor app and a unified user management dashboard.

## Core Modules
1. **Offline-First (Mobile)**: WatermelonDB SQLite layer, ES Proxy lazy-loading, Sync Engine (push/pull), Connectivity Context.
2. **User Management (Web/API)**: NestJS Users module with bcrypt hashing, Admin users listing and creation UI.

## Stabilization
- Patched `@expo/cli` to handle Node 20 fetch corruption.
- Forced React version split (18 Web / 19 Mobile) for monorepo stability.

## Verification
- Vitest for API/Web logic.
- Manual testing for native mobile features (JSI).
