# Jury Q&A: Future Readiness

---

### 1. How will AI-based arrival prediction be implemented technically?
- **Data Collection:** Collect historical bus movement data (location, speed, time, traffic, weather, etc.).
- **Model Training:** Use regression or ML models (e.g., Random Forest, XGBoost) to predict ETA based on real-time and historical features.
- **Backend Integration:** Save the trained model (e.g., as a .pkl file) and load it in the FastAPI backend to predict ETA for each request.
- **Continuous Improvement:** Retrain the model as more data is collected for higher accuracy.

---

### 2. What’s your plan for multilingual support and accessibility (elderly/disabled)?
- **Multilingual UI:** Already supports English and Hindi; easy to add more languages using i18n libraries.
- **Simple Design:** Large fonts, high-contrast colors, and minimal text for easy reading.
- **Accessibility:** Can add screen reader support, voice prompts, and keyboard navigation.
- **SMS/IVR:** Non-app users can access info via SMS or future IVR (voice call) integration.

---

### 3. If the government wants to integrate this into their Smart City Mission apps, how easy will it be?
- **Open APIs:** The system provides secure, well-documented APIs for live data, analytics, and feedback.
- **Modular Architecture:** Easy to integrate with other apps or dashboards.
- **Data Sharing:** Can export data in standard formats (CSV, JSON, etc.) for government use.
- **Custom Dashboards:** Can build custom views or analytics for Smart City requirements.
- **Support & Training:** Ready to provide technical support and onboarding for government teams.

---
