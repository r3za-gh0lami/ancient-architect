# 🏛️ معمار کهن (Ancient Architect)

**A 3D Procedural Pomodoro & Productivity App based on Ancient Persian Architecture**

*Ancient Architect* is an innovative, 100% offline, and gamified productivity app (Pomodoro Timer) built for Android. It turns your deep work and study sessions into a visually stunning, real-time 3D construction of ancient Persian civilizations. 

Instead of planting regular trees, you lay bricks to rebuild the magnificent **Apadana Palace in Persepolis (تخت جمشید)**, the **Turquoise Dome of Isfahan**, and the **Windcatchers of Yazd**.

![Android](https://img.shields.io/badge/Android-Native-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-Modern-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-3D_Rendering-black?style=for-the-badge&logo=three.js&logoColor=white)
![Offline First](https://img.shields.io/badge/Offline-100%25-blue?style=for-the-badge)

---

## ✨ Key Features (ویژگی‌های کلیدی)

### 🧱 1. Live 3D Architectural Construction (موتور رندر سه‌بعدی)
Powered by **Three.js** inside a hardware-accelerated Webview, the app renders a cinematic, isometric 3D view of Persepolis. As your focus timer ticks down, the stone platforms, tall columns, and golden winged-bull capitals dynamically grow from the ground.

### 🎵 2. Procedural Persian Ambient Soundscape (موتور صوتی رویه‌ای)
Built using the `Web Audio API`, the app synthesizes soothing ambient sounds locally without the need for large MP3 files:
* 🎶 **Setar & Lofi Drone:** Melodic traditional Persian plucks generated in real-time.
* 🌧️ **Adobe Rain:** Raindrops hitting mud-brick roofs.
* 🏜️ **Desert Wind:** LFO-filtered wind through ancient windcatchers.
* ⛲ **Courtyard Fountain:** Water dripping in a traditional tile pool.

### 🚫 3. Strict Mode & Gamification (حالت سخت‌گیرانه)
The app actively monitors window visibility (`visibilitychange` and `blur`). If you leave the app to check Instagram or other distractions:
* The screen flashes red with a loud alarm.
* You are given a **30-second Grace Period** to return.
* If you fail, your building collapses!
* Completing a session rewards you with **Gold Coins**, **Bricks**, and a chance to excavate **Ancient Artifacts**.

### 📸 4. Instagram Story Card Generator (کارت استوری اینستاگرام)
With a single tap, the app renders a high-resolution (9:16) aesthetic canvas detailing your daily focus streak, total study hours, and a Persian poetry quote (from Ferdowsi or Hafez) framed in an ornate golden border, ready to be saved and shared as a PNG.

### 📊 5. Weekly Analytics & Museum (کارنامه و موزه)
* Track your focus distribution (Studying vs. Reading vs. Deep Work) with an interactive Bar Chart.
* A dedicated **Museum** tab displays historically accurate 3D artifacts you uncover during your focus sessions (e.g., Cyrus Cylinder, Golden Rhyton).

---

## 🛠️ Tech Stack & Architecture (معماری فنی)

* **Platform:** Android Native (Kotlin) + Accelerated WebView.
* **UI/Styles:** Custom Offline CSS bundle (no external dependencies, instant zero-latency loading).
* **3D Graphics Engine:** Three.js (Procedural geometries, MeshStandardMaterial, Real-time Shadow Mapping).
* **Audio Engine:** Pure JavaScript Web Audio API Synthesis.
* **Storage:** 100% Offline Local Storage. (Zero Server Costs).

---

## 🚀 How to Run (نحوه اجرا)

1. Clone the repository:
   ```bash
   git clone https://github.com/rezaa-artt/ancient-architect.git
   ```
2. Open the project in **Android Studio**.
3. Build and Run on any Android Emulator or physical device (Android 7.0+).
4. **Fast-Forward Test:** Select *Persepolis*, tap the **"⚡ Test (6 Sec)"** button, and hit Start to watch the 3D columns construct dynamically in 6 seconds!

---

## 📸 Screenshots
*(Coming soon: Add your app screenshots here!)*

---

## 🤝 Contribution & Future Roadmap
* **Phase 2:** Integrate Room Database (SQLite) for more robust local data persistence.
* **Phase 3:** Full 3D procedural modeling of **Safavid Isfahan** and **Yazd Windcatchers**.
* **Phase 4:** Tapsell Plus (تپسل) monetization integration.

<br/>
<p align="center">
  <b>طراحی و توسعه برای ارتقاء فرهنگ کار عمیق و مطالعه در ایران</b> 🇮🇷
</p>