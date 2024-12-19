"use client";

import Image from "next/image";
import React, { useState } from "react";
import { HiMiniEllipsisVertical, HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineShare, HiOutlineClock } from "react-icons/hi2";
import DropdownOption from "./DropdownOption";
import Link from "next/link";
import { realtimeDb } from "@/configs/firebaseConfig";
import { ref, remove } from "firebase/database";

const CourseCard = ({ course, refreshData, displayUser = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleOnDelete = async () => {
    try {
      if (!course?.courseId) {
        throw new Error("El ID del curso no está definido.");
      }

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
    if (course?.courseOutput?.course?.level) {
      return course.courseOutput.course.level;
    }
    if (course?.level) {
      return course.level;
    }
    return "Principiante";
  };

  const getChapterCount = () => {
    if (course?.courseOutput?.course?.chapters) {
      return course.courseOutput.course.chapters.length;
    }
    if (course?.chapters) {
      return Object.keys(course.chapters).length;
    }
    return 0;
  };

  const getDuration = () => {
    if (course?.courseOutput?.course?.duration) {
      return course.courseOutput.course.duration;
    }
    if (course?.duration) {
      return course.duration;
    }
    return 0;
  };

  const defaultImage = "/course-cover.svg";
  
  return (
    <div 
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/course/${course?.courseId}`} onClick={(e) => e.stopPropagation()}>
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

          {/* Botones de acciones */}
          <div 
            className="absolute bottom-4 right-4 flex items-center gap-2 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {!displayUser && (
              <div className="relative">
                <DropdownOption handleOnDelete={handleOnDelete}>
                  <button 
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 transition-all duration-300 group/delete"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <HiMiniEllipsisVertical className="text-xl text-red-500 group-hover/delete:text-red-600" />
                  </button>
                </DropdownOption>
              </div>
            )}
            {navigator.share && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator
                    .share({
                      title: course?.courseOutput?.course?.name || course?.name,
                      url: `${process.env.NEXT_PUBLIC_HOST_NAME}/course/${course?.courseId}`,
                    })
                    .then(() => console.log("Successfully shared"))
                    .catch((error) => console.log("Error sharing", error));
                }}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-orange-50 transition-all duration-300 group/share"
              >
                <HiOutlineShare className="text-xl text-orange-500 group-hover/share:text-orange-600" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {/* Título */}
          <div className="mb-3">
            <h2 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
              {course?.courseOutput?.course?.name || course?.name}
            </h2>
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
          {displayUser && (
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
                <p className="text-xs text-gray-500">Instructor</p>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
