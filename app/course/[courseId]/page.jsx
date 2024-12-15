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
  const [expandedChapter, setExpandedChapter] = useState(null);

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

  const calculateChapterTime = (chapter) => {
    if (!chapter?.content?.length) return 0;
    
    // Estimamos 5 minutos por cada tema de contenido
    return chapter.content.length * 5;
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

      {/* Course Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Contenido del Curso</h2>
          
          <div className="space-y-6">
            {course.chapters?.map((chapter, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-lg hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="p-4 cursor-pointer" onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{chapter.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {chapter.content?.length || 0} temas · {calculateChapterTime(chapter)} min estimados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${
                          expandedChapter === index ? 'rotate-180' : ''
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Contenido expandible */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedChapter === index ? 'max-h-[500px] border-t border-gray-100' : 'max-h-0'
                  }`}
                >
                  <div className="p-4 space-y-3">
                    {chapter.content?.map((content, contentIndex) => (
                      <div
                        key={contentIndex}
                        className="flex flex-col gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <h4 className="text-base font-medium text-gray-800">{content.title}</h4>
                        {content.description && (
                          <p className="text-sm text-gray-600">{content.description}</p>
                        )}
                        {content.codeExample && (
                          <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-sm font-mono whitespace-pre-wrap">
                            {content.codeExample}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
