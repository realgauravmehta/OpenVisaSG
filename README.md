# OpenVisaSG

<div align="center">

**Free, Private, AI-Powered Singapore Visa Photo Generator**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vitejs.dev)
![Views](https://komarev.com/ghpvc/?username=realgauravmehta&repo=OpenVisaSG&label=Views&color=brightgreen&style=flat)

[**🚀 Try It Live**](https://realgauravmehta.github.io/OpenVisaSG/) • [Features](#-features) • [Quick Start](#-quick-start) • [How It Works](#-how-it-works)

</div>

---

## 🎯 What is This?

OpenVisaSG creates **ICA-compliant Singapore visa photos** directly in your browser. No uploads, no servers, no fees.

- ✅ **400×514px** output (official ICA digital format)
- ✅ **35×45mm** aspect ratio
- ✅ **White background** automatically applied
- ✅ **70% face coverage** via smart AI cropping
- ✅ **Print sheet** generation (4×6 inch, 4 photos)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎥 **Live Camera** | Capture directly from webcam or phone camera |
| 🤖 **AI Face Detection** | MediaPipe FaceMesh runs locally in your browser |
| 🖼️ **Background Removal** | WASM-powered, no server needed |
| ✂️ **Smart Crop** | Auto-scales and positions face to ICA specs |
| 📱 **Cross-Platform** | Works on Safari (iOS/macOS), Chrome, Firefox |
| 🔒 **100% Private** | Images never leave your device |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Development

```bash
# Clone the repository
git clone https://github.com/realgauravmehta/OpenVisaSG.git
cd OpenVisaSG

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

The `dist/` folder can be deployed to any static hosting service.

---

## 📸 How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Live Camera   │────▶│  Face Detection │────▶│   Capture Photo │
│   (Webcam API)  │     │   (MediaPipe)   │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Final Photo   │◀────│   Smart Crop    │◀────│  Remove BG      │
│   (400×514px)   │     │   (70% face)    │     │  (WASM)         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### ICA Singapore Photo Requirements

| Requirement | Implementation |
|-------------|----------------|
| Dimensions | 400×514 pixels |
| Aspect ratio | 35:45mm |
| Face coverage | 70-80% of height |
| Background | Plain white (#FFFFFF) |
| Eye position | ~47% from top |
| Format | JPEG |

---

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite 7** - Build tool
- **TailwindCSS 4** - Styling
- **MediaPipe** - Face landmark detection (WASM)
- **@imgly/background-removal** - Background removal (WASM)
- **Framer Motion** - Animations

---

## 📁 Project Structure

```
OpenVisaSG/
├── src/
│   ├── components/
│   │   ├── Camera/
│   │   │   └── CaptureFlow.jsx    # Main capture UI
│   │   └── Layout/
│   │       └── Landing.jsx        # Landing page
│   ├── hooks/
│   │   └── useFaceLandmarker.js   # MediaPipe hook
│   ├── utils/
│   │   ├── processor.js           # Image processing
│   │   └── validator.js           # ICA validation
│   ├── App.jsx                    # Router setup
│   └── main.jsx                   # Entry point
├── public/
├── index.html
└── package.json
```

---

## 🔐 Privacy

This application is designed with privacy as a core principle:

- **No server uploads** - All processing happens in your browser
- **No data collection** - We don't track or store anything
- **Local AI models** - MediaPipe and background removal run via WebAssembly
- **Open source** - Audit the code yourself

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) - Google's ML solutions
- [IMG.LY](https://img.ly/) - Background removal library
- [ICA Singapore](https://www.ica.gov.sg/) - Photo requirements reference

---

<div align="center">

**Made with ❤️ by Gaurav Mehta for hassle-free visa photos**

[⬆ Back to top](#openvisasg)

</div>
