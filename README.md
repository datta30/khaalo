# 🍽️ Khaalo - Gamified Indian Meal Planner

A beautiful, gamified Progressive Web App (PWA) that helps you track nutrition like playing a game! Built specifically for Indian cuisine with AI-powered meal scoring and personalized recommendations.

![Khaalo Banner](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## ✨ Features

### 🎮 Gamification
- **Duolingo-style meal path** - Navigate through your daily meals with visual progress nodes
- **Streak tracking** - Maintain daily streaks to build healthy habits
- **Daily cheat rewards** - Earn a special treat after completing all 4 main meals
- **Achievement system** - Track milestones and unlock badges

### 🤖 AI-Powered Intelligence
- **GPT-4o Food Scoring** - Get personalized Goal Fit and Gut Health scores (0-10) for any food
- **Smart meal planning** - AI generates weekly meal plans based on your profile
- **Food image recognition** - Take photos of food for instant AI analysis
- **Suggested serving sizes** - AI recommends optimal portion sizes

### 📊 Nutrition Tracking
- **Daily Impact Dashboard** - See exactly what % of your daily Protein, Carbs, Calories, and Sodium each meal provides
- **Health warnings** - Instant alerts for high-sodium or high-calorie foods
- **Macro breakdown** - Detailed protein, fat, fiber, and carb tracking
- **Water reminders** - Stay hydrated with smart notifications

### 🍛 Indian Cuisine Focus
- **Regional preferences** - Choose from North, South, East, or West Indian cuisine
- **Authentic meals** - 100+ traditional Indian dishes with accurate nutrition data
- **Meal swapping** - Replace meals with healthy alternatives from your region

### 🔍 Smart Food Logging
- **Barcode scanning** - Scan packaged food with OpenFoodFacts integration
- **Text search** - Find any food instantly
- **Replace/Add modal** - Choose to replace a planned meal or add as an extra snack
- **Photo upload** - Use GPT Vision to identify food from images

### 📱 PWA Features
- **Offline support** - Works without internet after initial load
- **Install to home screen** - Full app experience on mobile
- **Push notifications** - Meal and water reminders (browser-based)

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### State Management
- **Zustand** - Lightweight state management
- **Persist middleware** - LocalStorage persistence

### APIs & Services
- **OpenAI API (GPT-4o)** - Meal planning, food scoring, and image recognition
- **OpenFoodFacts API** - Barcode scanning
- **Pexels API** - Food imagery

### Data Storage
- **LocalStorage** - User data and meal plans (via Zustand persist)
- **IndexedDB (Dexie)** - Optional structured data storage

## 📁 Architecture

```
khaalo/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button3D.tsx     # 3D-styled buttons
│   │   ├── MealNode.tsx     # Game path meal nodes
│   │   ├── ProgressBar.tsx  # Progress indicators
│   │   ├── ScoreCard.tsx    # AI food scoring modal
│   │   └── Mascot.tsx       # Friendly guide character
│   ├── screens/             # Main app screens
│   │   ├── Onboarding.tsx   # 6-step user setup
│   │   ├── Home.tsx         # Main meal path view
│   │   ├── Scanner.tsx      # Food search & scan
│   │   ├── Profile.tsx      # User stats & settings
│   │   ├── Streak.tsx       # Achievements & milestones
│   │   └── Rank.tsx         # Leaderboard (placeholder)
│   ├── services/            # External integrations
│   │   ├── ai.ts            # OpenAI GPT API calls
│   │   ├── scanner.ts       # Barcode & image search
│   │   ├── db.ts            # IndexedDB operations
│   │   └── notifications.ts # Browser notifications
│   ├── store/               # State management
│   │   └── userStore.ts     # Zustand store with persist
│   ├── data/                # Static data
│   │   └── fallbackPlan.ts  # Default meal plans
│   └── types/               # TypeScript definitions
│       └── index.ts         # Shared interfaces
├── public/                  # Static assets
└── dist/                    # Production build
```

### State Flow
```
User Input → Component → Zustand Store → LocalStorage
                ↓
         AI Service (OpenAI)
                ↓
         Update Store → Re-render
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd food
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**

Create a `.env` file in the root directory:
```env
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
```

> ⚠️ **Important**: Never commit your `.env` file! It's already in `.gitignore`.

4. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | Your OpenAI API key for GPT-4o | ✅ Yes |

## 📱 Usage

### First Time Setup
1. Enter your name
2. Select gender (used for BMI calculations)
3. Provide age
4. Enter height and weight
5. Choose regional cuisine preference
6. Select your goal (lose/maintain/gain weight)

### Daily Workflow
1. **View your meal path** - See today's 4 planned meals
2. **Complete meals** - Tap meals to view nutrition and mark as eaten
3. **Log water** - Tap the 💧 button in the header
4. **Scan food** - Use the Scanner tab to search or scan barcodes
5. **Get AI scores** - See Goal Fit and Gut Health ratings
6. **Earn rewards** - Complete all meals to unlock your daily cheat treat!

### Notifications
Enable browser notifications in Settings → "Enable Reminders" to receive:
- Water reminders (every 2 hours, 8 AM - 10 PM)
- Meal reminders (at typical Indian meal times)

## 🌐 Deployment

### Netlify (Recommended)

**⚠️ Security Warning**: The current implementation exposes your OpenAI API key in client-side code. Before deploying to production, you should:

1. Move OpenAI API calls to serverless functions (Netlify Functions)
2. Keep API keys server-side only

**Current Quick Deploy** (NOT for production):
```bash
# Build
npm run build

# Deploy (you'll need to configure VITE_OPENAI_API_KEY in Netlify dashboard)
# Note: Netlify will block deployment if it detects the API key in the build
```

### Other Platforms
- **Vercel**: `vercel deploy`
- **GitHub Pages**: Requires hash router setup
- **Docker**: Use the Dockerfile (to be created)

## 🐛 Known Issues

- **API Key Exposure**: OpenAI API key is currently bundled in client code (see Security Notes)
- **Offline AI**: AI features require internet; fallback data is used offline
- **Browser Support**: Push notifications require browser permission

## 🛡️ Security Notes

> **CRITICAL**: This app currently makes OpenAI API calls directly from the browser, which exposes your API key. For production deployments, you MUST:

1. Create serverless functions (Netlify/Vercel Functions)
2. Move all OpenAI API logic server-side
3. Remove `VITE_OPENAI_API_KEY` from environment variables
4. Use server-only API keys

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **OpenAI** - GPT-4o API for intelligent food analysis
- **OpenFoodFacts** - Community-driven food database
- **Pexels** - High-quality food imagery
- UI/UX inspired by Duolingo's gamification approach

---

Made with ❤️ for healthy eating in India 🇮🇳
