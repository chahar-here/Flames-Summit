"use client";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/src/app/(site)");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 justify-start hover:cursor-pointer ml-1 mt-3 text-neutral-400"
    >
      <LogOut className="w-4 h-4 text-red-600" />
      Logout
    </button>
  );
};

export default LogoutButton;
