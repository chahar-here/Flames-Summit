"use client";
import React, { useState } from "react";
// 1. Import the server action (NOT client-side db)
import { subscribeEmail } from "@/lib/actions";
// 2. Import icons for loading state
import { IconSend, IconLoader2 } from "@tabler/icons-react";

// 3. Define the message state
interface Message {
  type: "success" | "error";
  text: string;
}

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  // 4. Use the more robust state from our previous component
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // 5. Use the handleSubmit logic that calls the Server Action
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Call the server action
    const result = await subscribeEmail(email);

    if (result.success) {
      setMessage({ type: "success", text: result.message! });
      setEmail(""); // Clear input on success
    } else {
      setMessage({ type: "error", text: result.error! });
    }

    setIsLoading(false);
  };

  // 6. Use your new JSX structure
  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col">
      <label
        htmlFor="email-footer"
        className="block text-md font-bold text-center md:text-right text-white mb-2"
      >
        Get the latest on Flames Summit India
        <br />
      </label>
      <div className="flex flex-row items-center rounded-md bg-[#E5E5E5]">
        <input
          id="email-footer"
          type="email"
          required
          placeholder="your@email.com"
          // Added flex-1 to make the input fill the space
          className="flex-1 rounded-l-md bg-[#E5E5E5] px-2 w-10 py-2 text-sm text-black placeholder-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E62B1E] z-10"
          value={email}
          disabled={isLoading} // 7. Add disabled state
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage(null); // 8. Reset message on change
          }}
        />
        {/* Replaced <hr> with a vertical border for a cleaner look */}
        <div className="h-6 border-l border-neutral-400"></div>
        <button
          type="submit"
          disabled={isLoading} // 9. Add disabled state
          // Added gap-2, items-center, rounded-r-md and loading/disabled styles
          className="inline-flex items-center gap-2 rounded-r-md bg-[#E5E5E5] px-2 py-2 font-semibold text-black transition hover:bg-[#d1d5db] disabled:cursor-not-allowed disabled:opacity-70 lg:text-sm"
        >
          {isLoading ? (
            <IconLoader2 size={18} className="animate-spin" />
          ) : (
            <IconSend size={18} />
          )}
          {/* 10. Change button text while loading */}
          {isLoading ? "Wait..." : "Subscribe"}
        </button>
      </div>

      {/* 11. Use the new message state for feedback */}
      {message && (
        <p
          className={`mt-2 text-sm ${
            message.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}