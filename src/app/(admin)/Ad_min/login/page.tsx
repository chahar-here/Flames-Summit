"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react"; 
import { cn } from "@/lib/utils"; 
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Import your 


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // For redirecting after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Sign in the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Get their ID token and check the custom claims
      const idTokenResult = await user.getIdTokenResult(true); // Force refresh

      // 3. THIS IS THE ADMIN CHECK
      if (!!idTokenResult.claims.admin) {
        // SUCCESS: They are an admin!
        router.push("/Ad_min/signin/dashboard/"); // Redirect to your admin dashboard
      } else {
        // They are a valid user, but NOT an admin
        await auth.signOut(); // Log them out immediately
        setError("Access Denied: You are not an authorized admin.");
      }
    } catch (authError: any) {
      // Handle Firebase errors (wrong password, user not found)
      if (authError.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    // Main container for the entire login page
    <div
      className={cn(
        "flex min-h-screen items-center justify-center",
        "relative z-10 bg-black" // Ensure this is above the InteractiveGridBackground
      )}
    >
        <div className={cn(
              "fixed inset-0",
              "[background-size:20px_20px]",
              "[background-image:radial-gradient(#404040_1px,transparent_1px)]", "-z-50",
            )}/>
        
      {/* The main card/container, styled like the reference image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-6xl overflow-hidden rounded-xl bg-neutral-900 shadow-2xl"
      >
        {/* Left Column: Login Form */}
        <div className=" relative flex w-full flex-col justify-center p-6 sm:p-10 md:w-1/2 lg:p-16">
          <div className="z-10">
            <div className="mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/flames_white.png" // Your logo
                alt="Flames Summit Logo"
                width={150}
                height={150}
                className="object-contain"
              />
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Bonjour, Welcome Back
          </h1>
          <p className="mt-2 text-neutral-400">
            Hey, welcome back to your special place
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="stanley@gmail.com" // Placeholder like the example
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-[#E62B1E] focus:outline-none focus:ring-1 focus:ring-[#E62B1E] disabled:opacity-70"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••••••" // Placeholder like the example
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-[#E62B1E] focus:outline-none focus:ring-1 focus:ring-[#E62B1E] disabled:opacity-70"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-neutral-600 bg-neutral-700 text-[#E62B1E] focus:ring-[#E62B1E]"
                />
                <label htmlFor="remember-me" className="ml-2 text-neutral-400">
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password" // Link to your forgot password page
                className="font-medium text-[#E62B1E] hover:text-[#ff4d4d]"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-md bg-[#E62B1E] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-[#E62B1E] focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 1116 0A8 8 0 014 12z"
                    ></path>
                  </svg>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          {/* Don't have an account link */}
          <div className="mt-8 text-center text-sm text-neutral-400">
            Don't have an account?{" "}
            <Link
              href="/signup" // Link to your sign up page
              className="font-medium text-[#E62B1E] hover:text-[#ff4d4d]"
            >
              Sign Up
            </Link>
          </div>
          </div>
        </div>

        {/* Right Column: Illustration/Visual */}
        <div 
          className={cn(
            "relative hidden w-1/2 flex-col items-center justify-center p-8 md:flex",
            // Here is your brand gradient, from red to the dark neutral bg
            "bg-gradient-to-br from-[#ca180c] to-neutral-900" 
          )}
        >
          {/* A more abstract, dynamic visual for Flames Summit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-center z-10"
          >
            <h2 className="text-4xl font-bold leading-tight text-white lg:text-5xl ">
              Ignite Your Potential. <br />
              Explore the COSMOS.
            </h2>
            <p className="mt-4 text-lg text-white opacity-80">
              Join India's leading minds in entrepreneurship & finance.
            </p>
          </motion.div>

          {/* Optional: Add a subtle grid or abstract shapes to the background of this column */}
          <div className={cn(
                    " absolute inset-0 opacity-7 z-0", // Base layer, at the very back
                    "[background-size:20px_20px]",
                    "[background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]",
                  )}
                />
          
        </div>
      </motion.div>
    </div>
  );
}