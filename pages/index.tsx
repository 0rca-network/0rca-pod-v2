import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowRight } from 'lucide-react';
import SphereImageGrid, { ImageData } from '@/components/ui/img-sphere';

interface Agent {
  id: string;
  name: string;
  description: string;
  subdomain: string;
  thumbnail_url?: string;
  category?: string;
}

export default function Home() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/list-agents');
        const data = await response.json();
        setAgents(data.agents || []);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const agentImages: ImageData[] = agents.map((agent) => ({
    id: agent.id,
    src: agent.thumbnail_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${agent.name}`,
    alt: agent.name,
    title: agent.name,
    description: agent.description
  }));

  const handleImageClick = (image: ImageData) => {
    router.push(`/pod/agents/${image.id}`);
  };

  if (loading) {
    return (
      <main className="w-full p-6 flex justify-center items-center min-h-screen">
        <div className="text-white text-xl">Loading agents...</div>
      </main>
    );
  }

  return (
    <main className="relative w-full flex flex-col justify-center items-center min-h-screen gap-0 px-4 bg-gradient-to-b from-black via-neutral-950 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-mint-glow/5 via-transparent to-transparent" />
      <img src="/0rca-cropped.png" alt="0rca" className="h-32 w-auto relative z-10" />
      <div className="-mt-12 relative z-10">
        <SphereImageGrid
          images={agentImages}
          containerSize={600}
          sphereRadius={200}
          dragSensitivity={0.8}
          momentumDecay={0.96}
          maxRotationSpeed={6}
          baseImageScale={0.15}
          hoverScale={1.3}
          perspective={1000}
          autoRotate={true}
          autoRotateSpeed={0.2}
          onImageClick={handleImageClick}
          showWireframe={true}
          wireframeDotCount={300}
        />
      </div>
      <div className="w-full flex justify-center relative z-10">
        <style jsx>{`
          @keyframes pulse-glow {
            0%, 100% {
              opacity: 1;
              text-shadow: 0 0 15px rgba(0, 255, 163, 0.4), 0 0 30px rgba(0, 255, 163, 0.3);
            }
            50% {
              opacity: 0.95;
              text-shadow: 0 0 20px rgba(0, 255, 163, 0.6), 0 0 40px rgba(0, 255, 163, 0.4);
            }
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}</style>
        <div 
          onClick={() => router.push('/pod')} 
          className="-mt-8 flex items-center gap-3 cursor-pointer hover:scale-105 transition-all hover:gap-4 animate-pulse-glow ml-8"
        >
          <p className="text-mint-glow text-3xl font-semibold tracking-tight">Automate Anything. Orchestrate Everything.</p>
          <ArrowRight className="text-mint-glow" size={32} strokeWidth={2.5} />
        </div>
      </div>
    </main>
  );
}
