"use client"
import { UserCourseListContext } from '@/app/_context/UserCourseListContext';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs'
import Link from 'next/link';
import React, { useContext } from 'react'
import { HiLightBulb, HiSparkles } from "react-icons/hi2";

const Addcourse = () => {
  const {user} = useUser();
    
  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-3 md:p-4 lg:p-6 mb-8 shadow-lg border border-orange-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 lg:gap-6">
        {/* Contenido izquierdo */}
        <div className="space-y-2 md:space-y-3 lg:space-y-4 flex-1 w-full">
          <div className="flex items-center gap-2">
            <HiSparkles className="text-orange-500 text-lg md:text-xl flex-shrink-0" />
            <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-800 truncate">
              ¡Bienvenido de nuevo, <span className="text-orange-600">{user?.fullName}!</span>
            </h2>
          </div>
          
          <div className="flex items-start gap-2 md:gap-3 bg-white/60 p-2 md:p-3 lg:p-4 rounded-xl">
            <HiLightBulb className="text-orange-500 text-lg md:text-xl mt-1 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Crea cursos personalizados con IA y compártelos con tu comunidad. 
                Perfecto para educadores, creadores de contenido y entusiastas del aprendizaje.
              </p>
              <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-3">
                <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  Personalizado
                </span>
                <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  Impulsado por IA
                </span>
                <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  Fácil de compartir
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de crear curso */}
        <div className="w-full md:w-auto">
          <Link href="/create-course" className="block w-full md:w-auto">
            <Button 
              variant="startButton"
              className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <HiSparkles className="text-xl" />
              <span className="whitespace-nowrap">Crear curso con IA</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Addcourse