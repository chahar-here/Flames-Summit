'use client'; // This directive is necessary for using hooks like useState

import React, { useState } from 'react';
import { db } from '../../lib/firebase'; // Assuming your firebase config is in 'lib/firebase.ts'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// You can use a library like 'lucide-react' for icons, or use SVGs directly like this.
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 text-gray-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
);
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 text-gray-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setStatus('loading');
  //   setMessage('');

  //   try {
  //     // Add a new document to the "subscribers" collection in Firestore
  //     await addDoc(collection(db, "subscribers"), {
  //       email: email,
  //       subscribedAt: serverTimestamp()
  //     });
  //     setStatus('success');
  //     setMessage('Thank you for subscribing! We\'ll be in touch.');
  //     setEmail(''); // Clear the input field on success
  //   } catch (error) {
  //     console.error("Error adding document: ", error);
  //     setStatus('error');
  //     setMessage('Something went wrong. Please try again.');
  //   }
  // };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setStatus('loading');
  setMessage('');

  try {
    console.log('Attempting to add subscriber:', email); // Debug log
    
    const docRef = await addDoc(collection(db, "subscribers"), {
      email: email,
      subscribedAt: serverTimestamp()
    });
    
    console.log('Document written with ID: ', docRef.id); // Debug log
    setStatus('success');
    setMessage('Thank you for subscribing! We\'ll be in touch.');
    setEmail('');
  } catch (error:any) {
    console.error("Full error object: ", error);
    console.error("Error code: ", error.code);
    console.error("Error message: ", error.message);
    
    setStatus('error');
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      setMessage('Access denied. Please check your permissions.');
    } else if (error.code === 'unavailable') {
      setMessage('Service temporarily unavailable. Please try again.');
    } else {
      setMessage('Something went wrong. Please try again.');
    }
  }
};

  return (
    <main className="relative text-white min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Animated Starfield Background */}
      <div className="absolute inset-0 z-0 star-field">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>
      
      <div className="relative z-10 text-center flex flex-col items-center w-full">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
            FLAMES
          </span> SUMMIT 2026
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          From a single spark to a universe of possibilities. India's premier startup and investment summit is coming.
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 mt-10 text-lg">
          <div className="flex items-center">
            <CalendarIcon />
            <span>March 2026</span>
          </div>
          <div className="flex items-center">
            <MapPinIcon />
            <span>Mohali, Punjab</span>
          </div>
        </div>

        <div className="mt-12 w-full max-w-lg">
          <p className="font-semibold text-xl">Be the first to know when we launch.</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={status === 'loading'}
              className="flex-grow w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all placeholder:text-gray-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 sm:w-auto py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Subscribing...' : 'Notify Me'}
            </button>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}