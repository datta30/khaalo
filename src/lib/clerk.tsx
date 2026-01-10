import React from 'react';
import { ClerkProvider, SignIn, SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface ClerkWrapperProps {
    children: React.ReactNode;
}

/**
 * Wrapper component that provides Clerk authentication
 */
export const ClerkWrapper: React.FC<ClerkWrapperProps> = ({ children }) => {
    if (!clerkPubKey) {
        console.warn('Clerk publishable key not configured. Auth disabled.');
        return <>{children}</>;
    }

    return (
        <ClerkProvider publishableKey={clerkPubKey}>
            {children}
        </ClerkProvider>
    );
};

/**
 * Sign-in page component
 */
export const SignInPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#89E219] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
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
                />
            </div>
        </div>
    );
};

/**
 * Hook to get user data from Clerk with additional fields
 */
export const useClerkUser = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();

    const userData = user ? {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || null,
        name: user.fullName || user.firstName || null,
        picture: user.imageUrl || null,
        // These can be fetched from Google profile
        firstName: user.firstName || null,
        lastName: user.lastName || null,
    } : null;

    return {
        user: userData,
        isLoaded,
        isSignedIn,
        signOut
    };
};

// Re-export Clerk components
export { SignedIn, SignedOut, useUser, useClerk };
