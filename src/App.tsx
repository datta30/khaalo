import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUserStore } from './store/userStore';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Scanner } from './screens/Scanner';
import { Profile } from './screens/Profile';
import { Streak } from './screens/Streak';
import { Rank } from './screens/Rank';
import { WeekPlanner } from './screens/WeekPlanner';
import './index.css';

type Screen = 'home' | 'scanner' | 'profile' | 'streak' | 'rank' | 'week';

function App() {
  const { user, isOnboarding, startOnboarding } = useUserStore();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // Start onboarding if no user exists
  useEffect(() => {
    if (!user || !user.onboardingComplete) {
      startOnboarding();
    }
  }, []);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  // Show onboarding if needed
  if (isOnboarding || !user?.onboardingComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen"
      >
        <Onboarding />
      </motion.div>
    );
  }

  // Main app screens
  return (
    <div className="h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Home onNavigate={handleNavigate} />
          </motion.div>
        )}

        {currentScreen === 'scanner' && (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Scanner onNavigate={handleNavigate} />
          </motion.div>
        )}

        {currentScreen === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Profile onNavigate={handleNavigate} />
          </motion.div>
        )}

        {currentScreen === 'streak' && (
          <motion.div
            key="streak"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Streak onNavigate={handleNavigate} />
          </motion.div>
        )}

        {currentScreen === 'rank' && (
          <motion.div
            key="rank"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Rank onNavigate={handleNavigate} />
          </motion.div>
        )}

        {currentScreen === 'week' && (
          <motion.div
            key="week"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <WeekPlanner onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
