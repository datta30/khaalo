import React from 'react';
import { ClerkProvider, SignIn, SignedIn, SignedOut, useUser, useClerk, RedirectToSignIn } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface ClerkWrapperProps {
    children: React.ReactNode;
}

/**
 * Wrapper component that provides Clerk authentication
 */
export const ClerkWrapper: React.FC<ClerkWrapperProps> = ({ children }) => {
    if (!clerkPubKey) {
        console.warn('Clerk publishable key not configured. Auth disabled - using demo mode.');
        return <>{children}</>;
    }

    return (
        <ClerkProvider publishableKey={clerkPubKey}>
            {children}
        </ClerkProvider>
    );
};

/**
 * Sign-in page component with Google OAuth
 */
export const SignInPage: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#58CC02] to-[#89E219] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full relative">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
                    >
                        ✕
                    </button>
                )}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-4">🍛</div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome to Khaalo</h1>
                    <p className="text-gray-500 mt-2">Your AI-powered Indian food companion</p>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'shadow-none p-0',
                            headerTitle: 'hidden',
                            headerSubtitle: 'hidden',
                            socialButtonsBlockButton: 'bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800 py-3',
                            socialButtonsBlockButtonText: 'font-semibold',
                            dividerLine: 'bg-gray-200',
                            dividerText: 'text-gray-400',
                            formButtonPrimary: 'bg-[#58CC02] hover:bg-[#4CAF00]',
                        }
                    }}
                    routing="hash"
                />
            </div>
        </div>
    );
};

/**
 * Hook to get user data from Clerk with additional fields
 */
export const useClerkUser = () => {
    const hasClerk = !!clerkPubKey;

    if (!hasClerk) {
        // Demo mode when Clerk is not configured
        return {
            user: null,
            isLoaded: true,
            isSignedIn: false,
            signOut: async () => { },
            isClerkConfigured: false
        };
    }

    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();

    const userData = user ? {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || null,
        name: user.fullName || user.firstName || null,
        picture: user.imageUrl || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
    } : null;

    return {
        user: userData,
        isLoaded,
        isSignedIn: isSignedIn ?? false,
        signOut,
        isClerkConfigured: true
    };
};

/**
 * Check if Clerk is configured
 */
export const isClerkConfigured = (): boolean => {
    return !!clerkPubKey;
};

// Re-export Clerk components
export { SignedIn, SignedOut, useUser, useClerk, RedirectToSignIn };
