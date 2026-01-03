<div align="center">
  
  # New Year Sparkler ✨
  
  *A magical, interactive virtual sparkler experience*
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Try_Now-success?style=for-the-badge&logo=safari&logoColor=white)](https://ob-cheng.github.io/new-year-sparkler/)
  
  [![English](https://img.shields.io/badge/English-black?style=flat&logo=google-translate&logoColor=white)](README.md)
  [![Русский](https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-black?style=flat&logo=google-translate&logoColor=white)](README.ru.md)
  [![Polski](https://img.shields.io/badge/Polski-black?style=flat&logo=google-translate&logoColor=white)](README.pl.md)
  
</div>

## The Story

I built this project for my little brother who absolutely loves New Year sparklers. We initially thought they were completely sold out in stores, so I wanted to make sure he could still have his sparkler fun digitally.

The "Lamplighter" in the background is inspired by the real tradition in **Brest, Belarus** (where he was born), where a local lamplighter manually lights kerosene lamps on Sovetskaya Street every single evening.

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
- **Troll the Lamplighter:** Click any lamp to turn it off. He's a very patient professional and will calmly walk back to re-light it every single time. How long can you keep him busy?
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
