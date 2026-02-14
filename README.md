# OpenSCAD Agent

An intelligent AI-powered web application for generating and verifying 3D models using OpenSCAD. Built with React, TypeScript, and Google's Gemini AI.

![OpenSCAD Agent Interface](https://img.shields.io/badge/OpenSCAD-Agent-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.3-purple)

## ✨ Features

### 🤖 AI-Powered Code Generation
- **Natural language input** - Describe 3D models in plain English
- **Streaming responses** - See code generate in real-time
- **Auto-correction** - Automatically fixes compilation errors
- **Two modes**:
  - **General Mode**: Create any OpenSCAD model

### 🔍 Intelligent Visual Verification
- **Multi-angle screenshots** - Captures 4 views (perspective, front, top, side) of rendered models
- **Automatic verification** - AI analyzes screenshots to verify the model matches your request
- **Auto-fix** - Detects issues and automatically regenerates code
- **Visual feedback** - Clear status messages showing verification progress

### 🎨 Real-time 3D Preview
- **Live rendering** - See your 3D models update as code changes
- **Interactive viewer** - Rotate, pan, and zoom the 3D model
- **Three.js powered** - Smooth, hardware-accelerated rendering

### 💾 Export & Download
- **STL export** - Download models as STL files ready for 3D printing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/openscad_agent.git
cd openscad_agent

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Setup

1. **Enter API Key**: Click the settings icon (⚙️) in the top-right
2. **Save Key**: Paste your Gemini API key and save
3. **Start Creating**: Type a description like "create a simple cube" in the chat

## 📖 Usage

```
http://localhost:5173
```

Create any OpenSCAD model by describing it:
- "create a sphere with radius 10"
- "make a gear with 20 teeth"
- "design a hollow cylinder"

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety
- **Vite 7.3** - Build tool and dev server
- **Three.js** - 3D rendering
- **three-stdlib** - STL loading

### AI & 3D
- **Google Gemini AI** - Code generation and verification
- **OpenSCAD WASM** - In-browser OpenSCAD compilation
- **Multimodal AI** - Image analysis for visual verification

### Deployment
- **GitHub Pages** - Static hosting
- **GitHub Actions** - Automated deployment

## 📦 Build & Deploy

### Local Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to GitHub Pages

The project includes automated deployment via GitHub Actions:

1. Push to `main` branch
2. GitHub Action automatically builds and deploys
3. Site available at `https://<username>.github.io/openscad_agent/`

See [deployment documentation](/.github/workflows/deploy.yml) for details.

## 🎓 Project Structure

```
openscad_agent/
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx    # AI chat interface
│   │   ├── CodeEditor.tsx       # OpenSCAD code editor
│   │   ├── Layout.tsx           # Main layout with header
│   │   └── OpenSCADViewer.tsx   # 3D model viewer & compiler
│   ├── App.tsx                  # Main app logic & AI integration
│   ├── App.css                  # Application styles
│   └── main.tsx                 # Entry point
├── public/
│   ├── module_connector.scad    # Robot mode connector library
│   └── .nojekyll                # GitHub Pages config
├── .github/
│   └── workflows/
│       └── deploy.yml           # Deployment automation
└── vite.config.ts               # Vite configuration
```

## 🔧 Configuration

### Vite Base Path

For GitHub Pages deployment, update `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',  // Match your repository name
})
```

### API Key Storage

API keys are stored in browser `localStorage`:
- Key: `openai_api_key`
- Never committed to version control
- User must enter their own key

## 📸 Screenshots

### General Mode
![General Mode Interface](screenshot-general.png)

### Robot Mode  
![Robot Mode Interface](screenshot-robot.png)

### Visual Verification
Four-angle screenshot capture for comprehensive verification:
- Perspective view
- Front view
- Top view
- Side view

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add amazing feature'`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

##  Acknowledgments

- **OpenSCAD** - The Programmers Solid 3D CAD Modeller
- **Google Gemini** - Multimodal AI capabilities
- **Three.js** - 3D graphics library
- **Vite** - Next generation frontend tooling

## 📧 Support

For issues, questions, or suggestions:
- Open an [issue](https://github.com/cashlo/openscad_agent/issues)
- Discussions welcome!
