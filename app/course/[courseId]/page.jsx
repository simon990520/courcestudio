"use client";

import React, { useEffect, useState } from "react";
import Header from "@/app/_components/Header";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";
import { HiOutlineClipboardDocumentCheck, HiOutlineShare } from "react-icons/hi2";
import { HiOutlineClock, HiOutlineAcademicCap, HiOutlineBookOpen } from "react-icons/hi";
import Link from "next/link";

const Course = ({ params }) => {
  const [course, setCourse] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    params && GetCourse();
  }, [params]);

  const GetCourse = async () => {
    if (!params?.courseId) {
      console.error("Falta el ID del curso.");
      return;
    }

    try {
      const courseRef = ref(realtimeDb, `courses/${params.courseId}`);
      const snapshot = await get(courseRef);

      if (snapshot.exists()) {
        const courseData = snapshot.val();
        console.log("Datos del curso:", courseData);
        console.log("Imagen del curso:", courseData.courseOutput?.course?.imageUrl);
        setCourse(courseData);
      }
    } catch (error) {
      console.error("Error al obtener el curso:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_HOST_NAME}course/${course?.courseId}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-lg text-gray-600">Cargando curso...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#FF5F13] to-[#FBB041] text-white py-20 animate-fadeIn overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex items-center justify-between">
            <div className="md:w-1/2 animate-slideInLeft">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {course.courseOutput?.course?.name || 'Cargando...'}
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                {course.courseOutput?.course?.description || 'Cargando descripción...'}
              </p>
              <div className="flex gap-4 animate-slideInUp">
                <Link 
                  href={`/course/${params.courseId}/start`}
                  className="bg-white text-[#FF5F13] px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Comenzar Curso
                </Link>
                <button 
                  onClick={copyToClipboard}
                  className="border border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-[#FF5F13] transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1"
                >
                  {copied ? "¡Copiado!" : "Compartir"}
                  {!copied && <HiOutlineShare className="text-xl" />}
                </button>
              </div>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              {/* Course Image for Medium and Up Screens */}
              <div className="hidden md:block relative w-full aspect-video mb-6 animate-slideInRight">
                <img 
                  src={course?.courseBanner || '/course-cover.svg'} 
                  alt={course.courseOutput?.course?.name || 'Curso'}
                  className="w-full h-full object-cover rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 animate-slideInRight">
                <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-1">
                  <HiOutlineClock className="text-3xl mb-2" />
                  <h3 className="font-medium">Duración</h3>
                  <p className="opacity-80">{course.courseOutput?.course?.duration || "Por definir"}</p>
                </div>
                <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-1">
                  <HiOutlineAcademicCap className="text-3xl mb-2" />
                  <h3 className="font-medium">Nivel</h3>
                  <p className="opacity-80">{course.courseOutput?.course?.level || "Todos los niveles"}</p>
                </div>
                <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm col-span-2 hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-1">
                  <HiOutlineBookOpen className="text-3xl mb-2" />
                  <h3 className="font-medium">Capítulos</h3>
                  <p className="opacity-80">{course.chapters?.length || 0} capítulos disponibles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn">
        {/* Chapters Preview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Contenido del Curso</h2>
          <div className="space-y-4">
            {course.chapters?.map((chapter, index) => (
              <div
                key={chapter.chapterId}
                className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-slideInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <HiOutlineBookOpen className="text-2xl text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{chapter.name}</h3>
                    {chapter.about && (
                      <p className="text-gray-600 text-sm mt-1">{chapter.about}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Details */}
        {course.courseOutput?.course?.requirements && (
          <div className="bg-white rounded-xl shadow-lg p-8 animate-slideInUp">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Requisitos</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {course.courseOutput?.course?.requirements.split('\n').map((req, index) => (
                <li key={index} className="animate-slideInLeft" style={{ animationDelay: `${index * 100}ms` }}>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Course;
