<div align="center">
  <img src="public/icon.png" width="120" alt="Sparkler Icon">
  
  # ✨ New Year Sparkler
  
  ### *A magical, interactive virtual sparkler experience*
  
  [![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Try_Now-success?style=for-the-badge)](https://ob-cheng.github.io/new-year-sparkler/)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
  [![Made with Vite](https://img.shields.io/badge/Built_with-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  
  [✨ Features](#-features) • [🚀 Demo](#-demo) • [💻 Local Setup](#-local-development) • [🏗️ Tech Stack](#️-tech-stack) • [📖 Story](#-the-story)
</div>

---

## 🎆 The Story

I built this project for my little brother who **absolutely loves** New Year sparklers. We initially thought they were completely sold out in stores, so I wanted to make sure he could still have his sparkler fun digitally.

Thankfully, we eventually found some real ones! But this little site turned out so nicely that I wanted to share it with the world. 🌍

<div align="center">
  <img src="public/team.png" width="70%" alt="Me and my brother enjoying sparklers">
  <p><em>✨ The Dream Team ✨</em></p>
</div>

---

## ✨ Features

### 🎮 **Interactive Sparkler**
- 🖱️ **Click to Light** - Tap anywhere to ignite your virtual sparkler
- 🌀 **Dynamic Physics** - Realistic particle effects with inertia-based tilting
- 🎯 **Touch & Drag** - Wave it around with realistic motion physics
- 🔥 **Heat-Based Colors** - Sparks transition from white-hot → yellow → orange → red

### 🌃 **Atmospheric Background**
- 🏮 **Procedural Lamplighter** - Watch a silhouette character walk around lighting vintage street lamps
- 💡 **Interactive Lamps** - Click to extinguish lamps, the lamplighter will re-light them
- ⭐ **Twinkling Stars** - Dynamic starfield with subtle animations
- 🎨 **Premium Gradient Sky** - Deep midnight to twilight blue

### ❄️ **Snow Mode** 
- Toggle a cozy falling snow effect with realistic physics

### 📹 **AR Mode** (Experimental)
- 🤚 Use your webcam for hand tracking (powered by MediaPipe)
- 👍 **Gesture Controls** - Thumbs up to light the sparkler
- 🪄 **Magic Effects** - Hold the sparkler with your real hand

### 🌍 **Multilingual Support**
Instructions available in:
- 🇬🇧 English
- 🇷🇺 Russian (Зажигай!)
- 🇵🇱 Polish (Zapal!)

---

## 🚀 Demo

### [**🌐 Try it Live →**](https://ob-cheng.github.io/new-year-sparkler/)

<div align="center">
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/Bundle_Size-69.12_kB-orange?style=flat-square" alt="Bundle Size">
  <img src="https://img.shields.io/badge/Gzipped-25.53_kB-blue?style=flat-square" alt="Gzipped">
</div>

---

## 💻 Local Development

### Prerequisites
- 📦 [Node.js](https://nodejs.org/) (v14 or higher)
- 📝 npm or yarn

### Quick Start

```bash
# 1️⃣ Clone the repository
git clone https://github.com/ob-cheng/new-year-sparkler.git
cd new-year-sparkler

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/new-year-sparkler/`

### 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🔧 Start development server with hot-reload |
| `npm run build` | 📦 Build for production (outputs to `dist/`) |
| `npm run preview` | 👀 Preview production build locally |
| `npm run deploy` | 🚀 Deploy to GitHub Pages |

---

## 🏗️ Tech Stack

### Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| <img src="https://vitejs.dev/logo.svg" width="16" alt="Vite"> **Vite** | ⚡ Lightning-fast build tool | `^7.2.4` |
| <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg" width="16" alt="HTML5"> **HTML5 Canvas** | 🎨 High-performance rendering | - |
| <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg" width="16" alt="JavaScript"> **Vanilla JavaScript** | 🚀 No framework overhead, pure performance | ES6+ |
| 🎭 **MediaPipe Hands** | 🤚 Real-time hand tracking for AR mode | Latest |

### Development Tools

- 🎨 **CSS3** - Custom animations & glassmorphism UI
- 🔤 **Google Fonts (Inter)** - Clean, modern typography
- 📄 **GitHub Pages** - Free hosting & CI/CD
- 🔧 **gh-pages** - Automated deployment tool

---

## 📁 Project Structure

```
new-year-sparkler/
├── 📂 public/              # Static assets
│   ├── icon.png           # App icon
│   ├── team.png           # Team photo
│   └── vite.svg           # Vite logo
├── 📂 src/
│   ├── 📂 entities/       # Game entities
│   │   ├── Spark.js       # Individual particle logic
│   │   └── Sparkler.js    # Main sparkler with physics
│   ├── 📂 systems/        # Game systems
│   │   ├── BackgroundSystem.js   # Sky, lamps, lamplighter
│   │   ├── HandTracker.js        # AR hand tracking
│   │   └── SnowSystem.js         # Snow particles
│   ├── 📂 styles/
│   │   └── style.css      # Main stylesheet
│   └── main.js            # Application entry point
├── index.html             # HTML entry point
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies & scripts
```

---

## 🎯 Performance Optimizations

- ✅ **Object Pooling** - Reuse particle objects (no garbage collection lag)
- ✅ **Offscreen Canvas** - Pre-rendered glow sprites (60 FPS on mobile)
- ✅ **Layered Rendering** - Separate canvases for background/stick/sparks
- ✅ **Mobile Detection** - Adaptive particle counts (600 mobile, 1200+ desktop)
- ✅ **Efficient Physics** - Optimized collision & particle systems

---

## 🚀 Deployment

This project is configured for **GitHub Pages** with automated deployment.

```bash
# Build and deploy to gh-pages branch
npm run deploy
```

The deployment workflow:
1. Runs `npm run build` (compiles to `dist/`)
2. Pushes `dist/` contents to `gh-pages` branch
3. Site goes live at: `https://[username].github.io/new-year-sparkler/`

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. ✍️ **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🔃 **Open** a Pull Request

### Ideas for Contributions
- 🎨 New sparkler colors or effects
- 🌍 Additional language support
- 🎵 Sound effects
- 📱 Mobile gesture improvements
- 🎮 New interaction modes

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- 🎨 Inspired by the simple joy of New Year celebrations
- 👨‍👦 Built with love for my little brother
- 🔥 Particle physics inspired by [Three.js examples](https://threejs.org/)
- 🤚 AR powered by [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)

---

<div align="center">
  
  ### ⭐ If you enjoyed this, please give it a star!
  
  Made with ❤️ and ✨ by [ob-cheng](https://github.com/ob-cheng)
  
  [Report Bug](https://github.com/ob-cheng/new-year-sparkler/issues) • [Request Feature](https://github.com/ob-cheng/new-year-sparkler/issues)
  
</div>
