# Developer Onboarding Guide

Welcome to the Smart Bus Platform team! Follow this checklist to get started:

## Day 1 Checklist
- [ ] Clone the repo and install dependencies
- [ ] Set up Python (3.10+) and Node.js (18+)
- [ ] Copy `.env.example` to `.env` in both `backend/` and `frontend/`
- [ ] Fill in all required environment variables (see README)
- [ ] Review new config files: `src/config.ts`, `src/constants.ts`
- [ ] Start backend: `uvicorn app.main:app --reload`
- [ ] Start frontend: `npm run dev`
- [ ] Start driver app: `cd driver_app && flutter pub get && flutter run`
- [ ] Test login, registration, OTP, dashboard, and PWA install flows
- [ ] Test driver app: login, online/offline toggle, assigned bus, location updates
- [ ] Read `backend/README.md`, `frontend/README.md`, `driver_app/README.md`, and `SIH_Documentation.md` for codebase structure and project overview
- [ ] Review code style, commit guidelines, and security features (CSRF, CORS, PWA, driver status)
- [ ] Join team chat and introduce yourself

## Useful Links
- [Project README](./README.md)
- [Backend Docs](./backend/README.md)
- [Frontend Docs](./frontend/README.md)
- [Driver App Docs](./driver_app/README.md)
- [SIH Documentation](./SIH_Documentation.md)
- [Changelog](./CHANGELOG.md)

## Tips
- Use VS Code + recommended extensions
- Run tests before pushing
- Ask questions early!
