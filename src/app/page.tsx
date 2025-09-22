import ComingSoonPage from "@/components/comingsoon/comingsoon";
import ParticlesComponent from "@/components/ParticlesComponent";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="absolute inset-0">
        <ParticlesComponent id="tsparticles" />
      </div>
      <ComingSoonPage />
    </div>
  );
}
