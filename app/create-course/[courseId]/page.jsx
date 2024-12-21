"use client";
import { ref, get, set, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { GenerateChapterContent_AI } from "@/configs/AiModel";
import service from "@/configs/service";
import Loading from "../_components/Loading";
import { useRouter } from "next/navigation";
import { realtimeDb } from "@/configs/firebaseConfig";
import { storage } from "@/configs/firebaseConfig";
import { HiOutlineClock, HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineSparkles } from "react-icons/hi2";

const CourseLayout = ({ params }) => {
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCourseValid, setIsCourseValid] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [showImageHint, setShowImageHint] = useState(!course?.courseBanner);
  const router = useRouter();

  useEffect(() => {
    if (params?.courseId) {
      getCourseData();
    } else {
      setIsCourseValid(false);
    }
  }, [params, user]);

  useEffect(() => {
    if (!course?.courseBanner) {
      // Mostrar el hint por 5 segundos cada 30 segundos si no hay imagen
      const interval = setInterval(() => {
        setShowImageHint(true);
        setTimeout(() => setShowImageHint(false), 5000);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [course?.courseBanner]);

  const getCourseData = async () => {
    if (!params?.courseId || !user?.primaryEmailAddress?.emailAddress) {
      console.error("Falta el ID del curso o el correo electrónico del usuario.");
      setIsCourseValid(false);
      return;
    }
    if (!realtimeDb) {
      console.error("Firebase Realtime Database no está inicializado correctamente.");
      return;
    }

    try {
      const courseRef = ref(realtimeDb, `courses/${params.courseId}`);
      const snapshot = await get(courseRef);

      if (snapshot.exists()) {
        const courseData = snapshot.val();
        setCourse(courseData);
        setIsCourseValid(true);
      } else {
        console.error("No se encontró el curso en la base de datos.");
        setIsCourseValid(false);
      }
    } catch (error) {
      console.error("Error obteniendo datos del curso:", error);
      setIsCourseValid(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const imageRef = storageRef(storage, `ai-course/${Date.now()}.jpg`);
      await uploadBytes(imageRef, file);
      const downloadUrl = await getDownloadURL(imageRef);
      
      // Actualizar la referencia del curso en la base de datos
      const courseRef = ref(realtimeDb, `courses/${params.courseId}`);
      await update(courseRef, {
        courseBanner: downloadUrl
      });

      // Actualizar el estado local
      setCourse(prev => ({
        ...prev,
        courseBanner: downloadUrl
      }));

      toast.success('¡Imagen actualizada con éxito!');
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      toast.error('Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const generateChapterContent = async () => {
    if (!course?.courseId || !course?.courseOutput?.course?.chapters) {
      toast.error("Faltan datos del curso o capítulos. No se puede generar contenido.");
      return;
    }

    setLoading(true);
    const chapters = course?.courseOutput?.course?.chapters;

    try {
      for (const [index, chapter] of chapters.entries()) {
        const prompt = `
          Explica el concepto en detalle sobre el tema: ${course?.name}, 
          Capítulo: ${chapter?.name}, 
          En formato JSON con una lista de arreglos con los campos como título, descripción en detalle, ejemplo de código (campo de código en formato <precode> si corresponde).
        `;

        // Genera el video URL
        const videoResponse = await service.getVideos(`${course?.name}:${chapter?.name}`);
        const videoId = videoResponse?.length > 0 ? videoResponse[0]?.id?.videoId : "";

        // Genera el contenido del capítulo
        const result = await GenerateChapterContent_AI.sendMessage(prompt);
        const content = JSON.parse(result?.response?.text());

        // Guarda el contenido del capítulo en Firebase
        const chapterRef = ref(realtimeDb, `courses/${course.courseId}/chapters/${index}`);
        await set(chapterRef, {
          chapterId: index,
          name: chapter?.name,
          content: content,
          videoId: videoId,
        });

        toast.success(`Capítulo ${index + 1} generado correctamente`);
      }

      // Actualiza el estado del curso
      const courseRef = ref(realtimeDb, `courses/${course.courseId}`);
      await update(courseRef, { status: "COMPLETED" });
      
      toast.success("¡Curso generado exitosamente!");
      router.push(`/course/${course.courseId}`);
    } catch (error) {
      console.error("Error generando contenido:", error);
      toast.error("Error generando el contenido del curso");
    } finally {
      setLoading(false);
    }
  };

  const handleChapterUpdate = async (chapterId, newName) => {
    try {
      const updatedChapters = course.courseOutput.course.chapters.map((chapter, index) => 
        index === chapterId ? { ...chapter, name: newName } : chapter
      );

      const courseRef = ref(realtimeDb, `courses/${course.courseId}/courseOutput/course`);
      await update(courseRef, {
        chapters: updatedChapters
      });

      toast.success('Capítulo actualizado correctamente');
      getCourseData();
      setEditingChapter(null);
    } catch (error) {
      console.error('Error al actualizar el capítulo:', error);
      toast.error('Error al actualizar el capítulo');
    }
  };

  const calculateTotalTime = () => {
    const chaptersCount = course.courseOutput?.course?.chapters?.length || 0;
    let totalMinutes = 0;

    switch(course.courseOutput?.course?.duration) {
      case '1 Hour':
        totalMinutes = 60;
        break;
      case '2 Hours':
        totalMinutes = 120;
        break;
      case 'More than 3 Hours':
        totalMinutes = 180;
        break;
      default:
        totalMinutes = 60;
    }

    const minutesPerChapter = Math.round(totalMinutes / (chaptersCount || 1));
    return minutesPerChapter;
  };

  if (!isCourseValid || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-lg text-gray-600">Cargando curso...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
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
                <Button
                  onClick={generateChapterContent}
                  disabled={loading}
                  className="bg-white text-[#FF5F13] px-8 py-6 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
                >
                  {loading ? (
                    <>Generando curso...</>
                  ) : (
                    <>
                      <HiOutlineSparkles className="text-xl" />
                      Generar Curso
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 mt-10 md:mt-0">
              {/* Course Image */}
              <div className="relative w-full aspect-video mb-6 animate-slideInRight group">
                <img 
                  src={course?.courseBanner || '/course-cover.svg'} 
                  alt={course.courseOutput?.course?.name || 'Curso'}
                  className="w-full h-full object-cover rounded-lg shadow-xl transform group-hover:scale-105 transition-all duration-300"
                />
                <div 
                  className={`absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-500
                    ${showImageHint ? 'bg-black/50' : 'bg-black/0 group-hover:bg-black/50'}
                    ${showImageHint ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}
                >
                  <div className={`transform transition-all duration-500 flex flex-col items-center justify-center ${showImageHint ? 'scale-100' : 'scale-95 group-hover:scale-100'}`}>
                    <div className="relative flex items-center justify-center">
                      {/* Círculo pulsante */}
                      <div className={`absolute inset-0 w-16 h-16 bg-primary/20 rounded-full 
                        ${showImageHint ? 'animate-ping' : ''}
                      `}></div>
                      {/* Ícono de cámara */}
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`w-8 h-8 text-white relative z-10 ${showImageHint ? 'animate-bounce' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <p className={`text-white text-center mt-4 font-medium
                      ${showImageHint ? 'animate-pulse' : ''}
                    `}>
                      {course?.courseBanner ? 'Cambiar imagen del curso' : '¡Añade una imagen para tu curso!'}
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  id="courseImage"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImageUpload(file);
                      setShowImageHint(false);
                    }
                  }}
                />
                <label 
                  htmlFor="courseImage"
                  className="absolute inset-0 cursor-pointer"
                >
                </label>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4 animate-slideInRight">
                <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-2">
                    <HiOutlineAcademicCap className="text-2xl" />
                    <h3 className="font-medium">Nivel</h3>
                  </div>
                  <p className="text-lg">{course.courseOutput?.course?.level || 'No especificado'}</p>
                </div>
                <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-2">
                    <HiOutlineClock className="text-2xl" />
                    <h3 className="font-medium">Duración</h3>
                  </div>
                  <p className="text-lg">{course.courseOutput?.course?.duration || 'No especificado'}</p>
                </div>
                <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300 transform hover:-translate-y-1 col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <HiOutlineBookOpen className="text-2xl" />
                    <h3 className="font-medium">Capítulos</h3>
                  </div>
                  <p className="text-lg">{course.courseOutput?.course?.chapters?.length || 0} capítulos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 animate-slideInUp">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Contenido del Curso</h2>
          <div className="space-y-4">
            {course.courseOutput?.course?.chapters?.map((chapter, index) => (
              <div
                key={index}
                className="p-4 border border-gray-100 rounded-lg hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                {editingChapter === index ? (
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-primary">#{index + 1}</span>
                    <input
                      type="text"
                      defaultValue={chapter.name}
                      className="flex-1 px-3 py-1 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleChapterUpdate(index, e.target.value);
                        } else if (e.key === 'Escape') {
                          setEditingChapter(null);
                        }
                      }}
                      onBlur={(e) => handleChapterUpdate(index, e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingChapter(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-primary">#{index + 1}</span>
                      <h3 className="text-lg font-medium text-gray-700">{chapter.name}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {calculateTotalTime()} min estimados
                      </span>
                      <button
                        onClick={() => setEditingChapter(index)}
                        className="text-gray-400 hover:text-primary transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Loading loading={loading} />
    </div>
  );
};

export default CourseLayout;
