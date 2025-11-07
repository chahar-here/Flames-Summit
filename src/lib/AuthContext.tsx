// // lib/AuthContext.tsx
// "use client";

// import { onAuthStateChanged, getAuth, User } from "firebase/auth";
// import { useEffect, useState, createContext, useContext } from "react";
// import { auth } from "./firebase"; // make sure this exports getAuth()

// const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//       setUser(firebaseUser);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => useContext(AuthContext);
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase'; // Make sure this path is correct
import { useRouter } from 'next/navigation'; // Use from 'next/navigation' for App Router
import { LoaderOne } from '@/components/ui/loader'; // A loader component

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// --- AuthProvider Component ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // --- NEW: Loading state ---
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChanged is the recommended way to get the current user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        setUser(user);
      } else {
        // User is signed out.
        setUser(null);
        // --- MODIFIED: Redirect to login page if not authenticated ---
        router.push('/admin/login');
      }
      // --- NEW: Set loading to false once the check is complete ---
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]); // Add router to dependency array

  // --- NEW: Conditional Rendering Logic ---
  // 1. While Firebase is checking the auth state, show a loader
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <LoaderOne />
      </div>
    );
  }

  // 2. If the check is complete and there is a user, show the dashboard
  // (We check for user here to avoid a flash of the login page if they are logged in)
  if (user) {
      return (
        <AuthContext.Provider value={{ user }}>
          {children}
        </AuthContext.Provider>
      );
  }

  // 3. If the check is complete and there is no user, the useEffect has already redirected.
  // We can return a loader here as well to prevent any content flash before the redirect happens.
  return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <LoaderOne />
      </div>
    );
};
