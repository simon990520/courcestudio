import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import AnimatedHero from "./_components/AnimatedHero";
import AnimatedFeatures from "./_components/AnimatedFeatures";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] relative overflow-hidden">
      {/* Header */}
      <nav className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
        <Image src={"/logo.png"} width={44} height={44} alt="Kunno App Logo" />
        </div>
        <div className="flex items-center gap-8">
          <Link href="/about" className="text-gray-600 hover:text-gray-900">Quiénes Somos</Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contáctanos</Link>
          <Link href="/terms" className="text-gray-600 hover:text-gray-900">Términos y Condiciones</Link>
          <Link href="/dashboard" className="px-8 py-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:opacity-90 transition-colors">
            ¡Empieza ahora!
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
        <AnimatedHero />
        <AnimatedFeatures />
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-50">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-100 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-50 rounded-full filter blur-3xl"></div>
      </div>
    </main>
  );
}
