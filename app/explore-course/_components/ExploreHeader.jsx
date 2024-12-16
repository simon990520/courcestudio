'use client'

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  HiSparkles, 
  HiOutlineChartBar, 
  HiOutlineBookOpen, 
  HiOutlineLightBulb, 
  HiOutlineTrendingUp,
  HiOutlinePlusCircle,
  HiOutlineAcademicCap
} from "react-icons/hi2";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";

const ExploreHeader = () => {
  const { user } = useUser();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl">
      {/* Fondo decorativo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 px-6 pt-8 pb-14 sm:px-8 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              ¡Bienvenido{user?.firstName ? `, ${user.firstName}` : ''}! 👋
            </h1>
            <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-2xl">
              Explora nuestra colección de cursos creados por la comunidad.
              Encuentra el conocimiento que buscas y aprende a tu propio ritmo.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Link href="/create-course">
                <Button 
                  className="bg-white text-orange-600 hover:bg-orange-50 transition-colors duration-300 text-sm sm:text-base px-6 py-2 sm:px-8 sm:py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                >
                  <HiOutlinePlusCircle className="text-xl" />
                  <span>Crear Nuevo Curso</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreHeader;
