"use client";

import Image from "next/image";
import React, { useState } from "react";
import { HiOutlineBookOpen, HiOutlineShare, HiOutlineClock } from "react-icons/hi2";
import { realtimeDb } from "@/configs/firebaseConfig";
import { ref, remove } from "firebase/database";
import Link from "next/link";

const Card = ({ course, refreshData }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleOnDelete = async () => {
    try {
      const courseRef = ref(realtimeDb, `courses/${course?.courseId}`);
      await remove(courseRef);
      refreshData();
      console.log(`Curso con ID ${course?.courseId} eliminado exitosamente.`);
    } catch (error) {
      console.error("Error al eliminar el curso:", error);
    }
  };

  const getFirstChapterDescription = () => {
    if (course?.chapters && course.chapters.length > 0) {
      const firstChapter = course.chapters[0];
      if (Array.isArray(firstChapter.content) && firstChapter.content.length > 0) {
        return firstChapter.content[0].description;
      }
      if (firstChapter.content?.sections && firstChapter.content.sections.length > 0) {
        return firstChapter.content.sections[0].description;
      }
    }
    return "Aprende las habilidades esenciales y conceptos clave de este curso.";
  };

  const getLevel = () => {
    return course?.level || "Principiante";
  };

  const getChapterCount = () => {
    return course?.courseOutput?.course?.noOfChapters || 0;
  };

  const getDuration = () => {
    return course?.courseOutput?.course?.duration || "2-3 horas";
  };

  const defaultImage = "/course-cover.svg";
  
  return (
    <div 
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/course/${course?.courseId}`}>
        <div className="relative">
          <Image
            src={course?.courseBanner || defaultImage}
            width={300}
            height={200}
            className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
            alt={`Banner del curso ${course?.courseOutput?.course?.name || 'Sin nombre'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Categoría Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-orange-600">
            {course?.category}
          </div>

          {/* Nivel Badge */}
          <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700">
            {getLevel()}
          </div>
        </div>

        <div className="p-4">
          {/* Título y Opciones */}
          <div className="flex items-start justify-between mb-3">
            <h2 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
              {course?.courseOutput?.course?.name}
            </h2>
            <div className="flex items-center gap-2">
              {navigator.share && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator
                      .share({
                        title: course?.courseOutput?.course?.name,
                        url: `${process.env.NEXT_PUBLIC_HOST_NAME}/course/${course?.courseId}`,
                      })
                      .then(() => console.log("Successfully shared"))
                      .catch((error) => console.log("Error sharing", error));
                  }}
                  className="p-2 hover:bg-orange-50 rounded-full transition-colors duration-300"
                >
                  <HiOutlineShare className="text-xl text-gray-500 hover:text-orange-600" />
                </button>
              )}
            </div>
          </div>

          {/* Descripción */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {getFirstChapterDescription()}
          </p>

          {/* Estadísticas */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <HiOutlineBookOpen className="text-lg text-orange-500" />
              <span>{getChapterCount()} capítulos</span>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineClock className="text-lg text-orange-500" />
              <span>{getDuration()}</span>
            </div>
          </div>

          {/* Usuario */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
            <Image
              src={course?.userProfileImage || defaultImage}
              width={32}
              height={32}
              className="rounded-full ring-2 ring-orange-100"
              alt={`Imagen de perfil de ${course?.userName || 'Usuario'}`}
            />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{course?.userName}</h3>
              <p className="text-xs text-gray-500">Generador</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card;
