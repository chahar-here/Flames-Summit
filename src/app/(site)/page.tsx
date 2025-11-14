import ComingSoonPage from "@/components/comingsoon/comingsoon";
import { InteractiveDotBackground } from "@/components/ui/InteractiveDotBackground";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <InteractiveDotBackground />
      <ComingSoonPage />
    </div>
  );
}
