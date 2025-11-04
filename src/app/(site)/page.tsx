import ComingSoonPage from "@/components/comingsoon/comingsoon";
import ParticlesComponent from "@/components/ParticlesComponent";
import { InteractiveDotBackground } from "@/components/ui/InteractiveDotBackground";
import { GridSmallBackgroundDemo } from "@/components/ui/InteractiveGridBackgroung";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* HERE IS THE BACKGROUND */}
      <InteractiveDotBackground />
      {/* <GridSmallBackgroundDemo /> */}
      {/* <div className={cn(
              "fixed inset-0",
              "[background-size:20px_20px]",
              "[background-image:radial-gradient(#404040_1px,transparent_1px)]", "-z-50",
            )}/> */}
      {/* <div className="absolute inset-0">
        <ParticlesComponent id="tsparticles" />
      </div> */}
      <ComingSoonPage />
      <ComingSoonPage />
    </div>
  );
}
