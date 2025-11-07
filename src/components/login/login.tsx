"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/app/components/ui/input";

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await userCredential.user.getIdTokenResult();
      if (tokenResult.claims.admin) {
        router.push("/admin/dashboard");
      } else {
        setError("You are not authorized to access the dashboard.");
      }
    } catch (err) {
      setError("Invalid credentials or network error.");
    }
  };

  return (
    <div className="mx-auto p-6">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 text-center">
            Are you an Admin at <span className="text-[#E62B1E]">TEDxSVIET</span>
</h2>
<p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300 text-center">
  Sign in to access exclusive event insights, manage submissions, and shape the journey behind the ideas worth spreading.
</p>

      <form onSubmit={handleLogin} className="my-8 space-y-4">
        <LabelInputContainer>
            <Input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        </LabelInputContainer>
        <LabelInputContainer>
            <Input
          type="password"
          placeholder="Don't talk about it"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        </LabelInputContainer>
        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit"
        >
          Login &rarr;
          <BottomGradient />
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent dark:via-[#E62B1E]/80" />
      </form>
    </div>
  );
}
const BottomGradient = () => {
  return (
    <>
      {/* Sharp underline */}
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#E62B1E] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      {/* Blurred glowing underline */}
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