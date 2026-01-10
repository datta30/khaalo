import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUserStore } from './store/userStore';
import { Landing } from './screens/Landing';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Scanner } from './screens/Scanner';
import { Profile } from './screens/Profile';
import { Streak } from './screens/Streak';
import { Rank } from './screens/Rank';
import { WeekPlanner } from './screens/WeekPlanner';
import { SignInPage, useClerkUser, isClerkConfigured } from './lib/clerk';
import './index.css';

type Screen = 'home' | 'scanner' | 'profile' | 'streak' | 'rank' | 'week';

function AppContent() {
  const { user, isOnboarding, startOnboarding } = useUserStore();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showSignIn, setShowSignIn] = useState(false);
  const clerkUser = useClerkUser();

  // Sync Clerk user data to store when signed in
  useEffect(() => {
    if (clerkUser.isClerkConfigured && clerkUser.isLoaded && clerkUser.isSignedIn && clerkUser.user) {
      // If user is signed in but hasn't completed onboarding, prefill data from Google
      if (!user?.onboardingComplete) {
        // Start onboarding with prefilled Google data
        startOnboarding();
      }
    }
  }, [clerkUser.isLoaded, clerkUser.isSignedIn, clerkUser.user?.clerkId]);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleGetStarted = () => {
    if (isClerkConfigured()) {
      // Show Clerk sign-in
      setShowSignIn(true);
    } else {
      // Demo mode - skip to onboarding
      startOnboarding();
    }
  };

  // If Clerk is configured, check auth state
  if (isClerkConfigured()) {
    // Show landing page for signed out users
    if (!clerkUser.isLoaded) {
      // Loading state
      return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="text-5xl"
          >
            🍛
          </motion.div>
        </div>
      );
    }

    if (!clerkUser.isSignedIn) {
      return (
        <>
          <Landing onGetStarted={handleGetStarted} />
          {showSignIn && <SignInPage onClose={() => setShowSignIn(false)} />}
        </>
      );
    }
  } else {
    // No Clerk configured - show landing for new users
    if (!user && !isOnboarding) {
      return <Landing onGetStarted={handleGetStarted} />;
    }
  }

  // Show onboarding if needed
  if (isOnboarding || !user?.onboardingComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen"
      >
        <Onboarding clerkUser={clerkUser.user} />
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

function App() {
  return <AppContent />;
}

export default App;
