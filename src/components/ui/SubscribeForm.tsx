// components/ui/SubscribeForm.tsx
"use client";

import { useState } from 'react';
import { IconSend, IconLoader2 } from '@tabler/icons-react';
import { subscribeEmail } from '@/lib/actions'; // Import your server action

// For success/error message
interface Message {
  type: 'success' | 'error';
  text: string;
}

export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage(null);

    // Call the server action
    const result = (await subscribeEmail(email)) as {
      success: boolean;
      message?: string;
      error?: string;
    };

    if (result.success) {
      setMessage({ type: 'success', text: result.message ?? 'Subscribed successfully' });
      setEmail(''); // Clear input on success
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Something went wrong' });
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-4 sm:flex-row"
      >
        <label htmlFor="email-subscribe" className="sr-only">
          Email address
        </label>
        <input
          id="email-subscribe"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isLoading}
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-900/50 px-5 py-3 text-base text-white shadow-sm placeholder:text-neutral-400 focus:border-[#E62B1E] focus:outline-none focus:ring-1 focus:ring-[#E62B1E] disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="relative inline-flex h-12 w-fit flex-shrink-0 items-center justify-center gap-2 rounded-md bg-[#d1d5db] px-6 text-sm font-bold text-black transition-colors hover:text-[#E62B1E] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isLoading ? (
            <IconLoader2 size={18} className="animate-spin" />
          ) : (
            <IconSend size={18} />
          )}
          {isLoading ? 'Submitting...' : 'Notify Me'}
        </button>
      </form>

      {/* Display Success or Error Messages */}
      {message && (
        <p
          className={`mt-3 text-sm ${
            message.type === 'success'
              ? 'text-green-400'
              : 'text-red-400'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}