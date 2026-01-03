<div align="center">
  
  # New Year Sparkler ✨
  
  *A magical, interactive virtual sparkler experience*
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Try_Now-success?style=for-the-badge)](https://ob-cheng.github.io/new-year-sparkler/)
  
</div>

## The Story

I built this project for my little brother who absolutely loves New Year sparklers. We initially thought they were completely sold out in stores, so I wanted to make sure he could still have his sparkler fun digitally.

Thankfully, we eventually found some real ones! But this little site turned out so nicely that I wanted to share it with the world.

<div align="center">
  <img src="public/team.png" width="70%" alt="Me and my brother enjoying sparklers">
  <p><em>The Dream Team</em></p>
</div>

## Features

### Interactive Sparkler
- Click to light, drag to wave it around
- Realistic particle effects with inertia-based tilting
- Heat-based colors: sparks transition from white-hot → yellow → orange → red

### Atmospheric Background
- Procedural "Lamplighter" character that walks around lighting vintage street lamps
- Click lamps to extinguish them - the lamplighter will re-light them
- Twinkling stars and gradient sky

### Snow Mode
- Toggle falling snow effect

### AR Mode (Experimental)
- Use your webcam for hand tracking (powered by MediaPipe)
- Thumbs up gesture to light the sparkler
- Hold the sparkler with your real hand

### Multilingual Support
- English, Russian (Зажигай!), Polish (Zapal!)

## Running Locally

**Prerequisites:** Node.js (v14+)

```bash
# Clone and install
git clone https://github.com/ob-cheng/new-year-sparkler.git
cd new-year-sparkler
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:5173/new-year-sparkler/`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run deploy` | Deploy to GitHub Pages |

<div align="center">
  
Made by [ob-cheng](https://github.com/ob-cheng)
  
</div>
