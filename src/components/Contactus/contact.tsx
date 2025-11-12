"use client";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX, IconLoader2 } from "@tabler/icons-react";

// --- MODIFIED IMPORTS ---
// We import the server action and its data type
import { submitContactForm, ContactFormData } from "@/lib/actions";
// We no longer need client-side 'db', 'addDoc', or 'collection'
// ---

export function Contact() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state

  // --- MODIFIED HANDLESUBMIT ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError([]);
    setIsSubmitting(true);

    const formData: ContactFormData = { fullName, email, message };

    try {
      // Call the server action
      const result = await submitContactForm(formData);

      if (result.success) {
        setSuccess(true);
        setFullName("");
        setEmail("");
        setMessage("");
      } else {
        setError([result.error || "An unknown error occurred."]);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(["Something went wrong. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- END OF MODIFIED HANDLESUBMIT ---

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="shadow-input mx-auto w-full sm:max-w-[90vw] md:max-w-md rounded-none p-4 md:rounded-2xl md:p-8 bg-black">
        <h2 className="text-xl font-bold text-neutral-200 text-center">
          Got a <span className="text-[#E62B1E]">Spark?</span>
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-300 text-center">
          Have a question, idea, or thought that sparks curiosity? Share it great conversations start with a single question.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="firstname">Full name</Label>
              <Input
                id="firstname"
                onChange={(e) => setFullName(e.target.value)}
                value={fullName}
                placeholder="Stanley Ipkiss"
                type="text"
                disabled={isSubmitting} // Disable during submit
              />
            </LabelInputContainer>
          </div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="email@email.com"
              type="email"
              disabled={isSubmitting} // Disable during submit
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="message">Message!</Label>
            <Textarea
              id="message"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              placeholder="Type Here!"
              disabled={isSubmitting} // Disable during submit
            />
          </LabelInputContainer>
          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br font-medium text-white  bg-zinc-800 from-zinc-900 to-zinc-800 shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
            disabled={isSubmitting} // Disable during submit
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <IconLoader2 size={18} className="animate-spin" />
                <span className="ml-2">Sending...</span>
              </div>
            ) : (
              "Contact Us →"
            )}
            <BottomGradient />
          </button>
          
          {success && (
            <p className="text-green-500 text-center mt-4">Message sent successfully!</p>
          )}

          {error.length > 0 && (
            <ul className="text-red-500 text-center mt-4">
              {error.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent dark:via-[#E62B1E]/80" />
        </form>

        <div className="flex items-center justify-center mt-6 space-x-10">
          <a href="https://x.com/flamessummit" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
            <IconBrandX size={30} />
          </a>
          <a href="https://www.linkedin.com/company/flamessummitindia" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
            <IconBrandLinkedin size={30} />
          </a>
          <a href="https://www.instagram.com/flamessummitindia" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
            <IconBrandInstagram size={32} />
          </a>
        </div>
      </div>
    </div>
  );
};

// --- Helper components (unchanged) ---
const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};