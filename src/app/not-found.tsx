
import EyeFollower from "@/components/ui/EyeFollowerSVG";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "TEDxSVIET",
  description: "Independently organised Talks in Sviet Chandigarh",
};
export default function NotFound() {
  return (
    <div className="w-full h-screen flex flex-col gap-10 justify-center items-center">
                <EyeFollower/>
                <h1 className="text-4xl font-bold text-center">Buddy!!! What are you looking for?</h1>
            </div>
  );
}
