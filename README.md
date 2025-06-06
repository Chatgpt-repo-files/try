# 🌍 Counting Adventures

A map-style counting concepts learning game designed for children. Navigate through countries, cities, and districts to learn counting in a fun, interactive way!

## 🎮 Game Features

- **Map-style progression**: Country → City → District hierarchy
- **Interactive counting games**: Count objects and select the correct answer
- **Progressive unlocking**: Complete levels to unlock new areas
- **Practice mode**: Additional practice for completed districts
- **Child-friendly design**: Bright colors, large buttons, fun animations
- **Responsive design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Option 1: Frontend Only (Easiest)
If you just want to play the game without running the backend API the
provided `index.html` contains a small built in data set.

1. **Download the HTML file** from the artifacts above (or open `frontend/index.html`)
2. **Save it** as `index.html` on your computer
3. **Double-click** the file to open it in your web browser
4. **Start playing!** 🎉
   - Progress resets when you refresh because there is no server storing it

### Option 2: Full Setup with Backend

#### Prerequisites
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)

#### Installation Steps

1. **Create project directory:**
```bash
mkdir counting-adventures
cd counting-adventures
```

2. **Create the file structure:**
```
counting-adventures/
├── server.js
├── package.json
├── README.md
└── frontend/
    └─ index.html
```

3. **Copy the files:**
   - Copy the `server.js` code into `server.js`
   - Copy the `package.json` code into `package.json`
   - Create a `frontend` folder
   - Copy the HTML game code into `frontend/index.html`

4. **Install dependencies:**
```bash
npm install
```

5. **Start the server:**
```bash
npm start
```

6. **Open your browser:**
   - Go to `http://localhost:3000`
   - Start playing! 🎮

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```
This uses `nodemon` to automatically restart the server when you make changes.

### Frontend Only Development
If you want to work on just the frontend:
```bash
npm run frontend-only
```
This serves the frontend files on `http://localhost:8000`

## 📁 Project Structure

```
counting-adventures/
├── server.js              # Express.js backend server
├── package.json           # Node.js dependencies and scripts
├── README.md             # This file
└── frontend/
    └─ index.html        # Complete game frontend (HTML + CSS + JS)
```

## 🔗 API Endpoints

The backend provides these REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/countries` | Get all countries |
| GET | `/api/countries/:id/cities` | Get cities in a country |
| GET | `/api/cities/:id/districts` | Get districts in a city |
| POST | `/api/districts/:id/complete` | Mark district as complete |
| GET | `/api/game-state` | Get complete game state |
| POST | `/api/reset-game` | Reset game to initial state |

## 🎯 Game Flow

1. **Main Menu** → Choose "Start Game"
2. **Country Map** → Click an unlocked country (starts with "Numberland")
3. **City Map** → Click an unlocked city (starts with "Count City")
4. **District Selection** → Click an unlocked district (starts with "Boat Harbor")
5. **Counting Game** → Count the objects and select the correct answer
6. **Success!** → District completed, next level unlocks
7. **Practice** → Optional practice mode with different objects

## 🎨 Customization

### Adding New Content

#### New Countries:
```javascript
// In server.js or frontend game data
countries: [
    { id: 4, name: "New Country", description: "Description", unlocked: false }
]
```

#### New Concepts:
```javascript
// Add new concept emojis
const conceptEmojis = {
    boats: "⛵",
    apples: "🍎",
    cars: "🚗",     // New concept
    flowers: "🌸"   // New concept
};
```

### Styling Changes
All styles are in the `<style>` section of `index.html`. Key CSS classes:
- `.country`, `.city`, `.district` - Map elements
- `.game-screen` - Game interface
- `.object` - Counting objects
- `.answer-btn` - Answer buttons

## 🐛 Troubleshooting

### Common Issues:

**Game won't load:**
- Make sure you're using a modern web browser
- Check browser console for errors (F12 → Console)

**Server won't start:**
- Make sure Node.js is installed: `node --version`
- Check if port 3000 is already in use
- Try a different port: `PORT=3001 npm start`

**Can't click on countries/cities:**
- Only unlocked (colored) areas are clickable
- Locked areas are grayed out and not interactive

## 🔧 Technical Details

### Frontend:
- **Pure HTML/CSS/JavaScript** - No external dependencies
- **Responsive design** - Works on mobile and desktop
- **In-memory storage** - Game state stored in JavaScript variables

### Backend:
- **Express.js** - Minimal REST API server
- **In-memory data** - No database required
- **JSON responses** - Standard REST API format

## 🚀 Deployment

### Deploy to Heroku:
1. Create a `Procfile`: `web: node server.js`
2. Push to Heroku: `git push heroku main`

### Deploy Frontend Only:
- Upload `index.html` to any web hosting service
- Works with GitHub Pages, Netlify, Vercel, etc.

## 📝 License

MIT License - Feel free to modify and use for educational purposes!

## 🤝 Contributing

This is designed to be easily extensible! Ideas for improvements:
- Add more counting concepts
- Include simple addition/subtraction
- Add sound effects
- Implement user accounts and progress saving
- Add difficulty levels
- Multi-language support

---

**Happy Counting!** 🎉🗓
