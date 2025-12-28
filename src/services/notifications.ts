/**
 * Notification Service for Water and Meal Reminders
 */

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
    return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!isNotificationSupported()) {
        console.log('Notifications not supported');
        return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
};

// Get current permission status
export const getNotificationPermission = (): NotificationPermission => {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission;
};

// Show a notification
export const showNotification = (title: string, options?: NotificationOptions): void => {
    if (!isNotificationSupported() || Notification.permission !== 'granted') {
        console.log('Notifications not allowed');
        return;
    }

    const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
};

// Water reminder notification
export const showWaterReminder = (currentGlasses: number, goalGlasses: number): void => {
    const remaining = goalGlasses - currentGlasses;
    if (remaining <= 0) return;

    showNotification('💧 Time to Hydrate!', {
        body: `You've had ${currentGlasses}/${goalGlasses} glasses. Drink up!`,
        tag: 'water-reminder'
    });
};

// Meal reminder notification
export const showMealReminder = (mealType: string, mealName: string): void => {
    const emoji = {
        breakfast: '🌅',
        snack: '🍎',
        lunch: '🍱',
        dinner: '🌙'
    }[mealType] || '🍽️';

    showNotification(`${emoji} Time for ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}!`, {
        body: `Don't forget: ${mealName}`,
        tag: 'meal-reminder'
    });
};

// Schedule water reminders (every 2 hours during day)
let waterIntervalId: number | null = null;

export const startWaterReminders = (currentGlasses: number, goalGlasses: number): void => {
    if (waterIntervalId) return; // Already running

    // Show first reminder after 2 hours
    waterIntervalId = window.setInterval(() => {
        const hour = new Date().getHours();
        // Only remind between 8 AM and 10 PM
        if (hour >= 8 && hour <= 22) {
            showWaterReminder(currentGlasses, goalGlasses);
        }
    }, 2 * 60 * 60 * 1000); // Every 2 hours
};

export const stopWaterReminders = (): void => {
    if (waterIntervalId) {
        clearInterval(waterIntervalId);
        waterIntervalId = null;
    }
};

// Schedule meal reminders based on typical Indian meal times
const MEAL_TIMES: Record<string, number[]> = {
    breakfast: [7, 30],  // 7:30 AM
    snack: [11, 0],      // 11:00 AM
    lunch: [13, 0],      // 1:00 PM
    dinner: [20, 0]      // 8:00 PM
};

let mealCheckIntervalId: number | null = null;
let lastNotifiedMeal: string | null = null;

export const startMealReminders = (
    getMealName: (type: string) => string,
    isMealCompleted: (type: string) => boolean
): void => {
    if (mealCheckIntervalId) return;

    // Check every minute
    mealCheckIntervalId = window.setInterval(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        for (const [mealType, [hour, minute]] of Object.entries(MEAL_TIMES)) {
            // Check if it's within 5 minutes of meal time
            const isNearMealTime =
                currentHour === hour &&
                currentMinute >= minute &&
                currentMinute <= minute + 5;

            if (isNearMealTime && !isMealCompleted(mealType) && lastNotifiedMeal !== mealType) {
                const mealName = getMealName(mealType);
                showMealReminder(mealType, mealName);
                lastNotifiedMeal = mealType;
            }
        }
    }, 60 * 1000); // Check every minute
};

export const stopMealReminders = (): void => {
    if (mealCheckIntervalId) {
        clearInterval(mealCheckIntervalId);
        mealCheckIntervalId = null;
    }
    lastNotifiedMeal = null;
};

// Stop all reminders
export const stopAllReminders = (): void => {
    stopWaterReminders();
    stopMealReminders();
};
