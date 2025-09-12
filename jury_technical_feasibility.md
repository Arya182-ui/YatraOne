# Jury Q&A: Technical Feasibility

---

### 1. How will your system handle low internet connectivity in small towns?
- **Offline Caching:** Saves last known bus locations/routes locally; shows cached data when offline or slow.
- **SMS-Based Access:** Users can get bus info and ETA via SMS, no internet needed.
- **Lightweight APIs:** Only essential, small-sized data is sent.
- **PWA & Graceful Fallback:** App works offline and syncs when back online.

---

### 2. Why did you choose Firebase + FastAPI? What if data grows at scale?
- **Firebase:** Real-time sync, scalable, managed backend, easy integration, built-in auth and notifications.
- **FastAPI:** High-performance, async Python backend for custom APIs, business logic, and ML/AI.
- **Scalability:** Firestore and FastAPI both scale horizontally. For very large data/traffic: use sharding, caching, data warehousing, and microservices as needed.

---

### 3. How do you ensure data security—especially with drivers’ live locations?
- **Authentication & Authorization:** Only authenticated, authorized users can access sensitive data.
- **Secure Transmission:** All data sent over HTTPS.
- **Backend Validation:** All requests validated and permissions enforced.
- **Firestore Security Rules:** Restrict who can read/write location data.
- **Data Minimization:** Only necessary data is exposed.
- **Audit Logging:** All sensitive actions are logged.
- **Environment Security:** Secrets stored in environment variables.

---

### 4. What are the risks of using driver’s smartphone as GPS? How will you prevent cheating or location spoofing?
- **Risks:** Location spoofing, device issues, privacy concerns, manual app closure.
- **Prevention:**
  - Anti-spoofing checks (detect mock locations, flag suspicious updates).
  - Backend validation (plausibility checks, ignore impossible jumps).
  - Tamper-proof logging.
  - App runs as background service, auto-restarts if closed.
  - Driver awareness and policy.
  - Dedicated GPS hardware for critical routes (optional).

---

### 5. How do you handle battery drain or app crashes on the driver’s phone?
- **Efficient Location Updates:** Optimized intervals, background/foreground service.
- **Crash Recovery:** Auto-restart location tracking, persistent notification.
- **Battery Monitoring:** Warn drivers if battery is low, alert admin if updates stop.
- **Backend Monitoring:** Flags buses that haven’t sent updates recently.
- **Driver Training:** Drivers trained to keep app running and phone charged.
- **Optional Hardware:** Dedicated GPS for critical routes.

---

### 6. How scalable is your backend if deployed in 50 cities simultaneously?
- **Cloud-Native Design:** Both Firebase and FastAPI are cloud-ready and scale horizontally.
- **Multi-Tenancy:** Data can be partitioned by city for isolation and performance.
- **Load Balancing:** FastAPI can be containerized and load-balanced.
- **Database Scaling:** Firestore supports sharding and indexing for large datasets.
- **Monitoring & Auto-Scaling:** Use cloud monitoring and auto-scaling to handle spikes.
- **Modular Architecture:** Easy to add more resources or microservices as needed.

---
