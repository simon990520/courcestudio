"use client";
import { realtimeDb } from "@/configs/firebaseConfig";
import React, { useEffect, useState } from "react";
import ChapterListCard from "./_components/ChapterListCard";
import ChapterContent from "./_components/ChapterContent";
import { ref, get } from "firebase/database";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";

const CourseStart = ({ params }) => {
  const [course, setCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterContent, setChapterContent] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        setCourse(courseData);

        // Seleccionar el primer capítulo por defecto
        if (courseData.chapters && courseData.chapters.length > 0) {
          const firstChapter = courseData.chapters[0];
          setSelectedChapter({ ...firstChapter, index: 0 });
          setChapterContent(firstChapter);
        }
      }
    } catch (error) {
      console.error("Error al obtener el curso:", error);
    }
  };

  const handleChapterSelect = async (chapter, index) => {
    setSelectedChapter({ ...chapter, index });
    setChapterContent(chapter);
    // Cerrar sidebar en móvil al seleccionar capítulo
    setIsSidebarOpen(false);
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando curso...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Botón de menú móvil */}
      <div className="md:hidden fixed top-0 left-0 p-4 z-30">
        <button
          className="bg-white p-2 rounded-md shadow-md hover:bg-gray-50"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <Cross1Icon className="w-6 h-6" />
          ) : (
            <HamburgerMenuIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Overlay para cerrar sidebar en móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative w-64 h-screen flex-shrink-0 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col">
          <h2 className="font-medium text-lg bg-gradient-to-r from-[#FF5F13] to-[#FBB041] p-4 text-white">
            {course.courseOutput?.course?.name || "Contenido del curso"}
          </h2>
          <div className="flex-1 overflow-y-auto">
            {course.chapters?.map((chapter, index) => (
              <ChapterListCard
                key={chapter.chapterId}
                chapter={chapter}
                isSelected={selectedChapter?.index === index}
                onClick={() => handleChapterSelect(chapter, index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto bg-white">
        {selectedChapter && chapterContent ? (
          <ChapterContent
            chapter={selectedChapter}
            content={chapterContent}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-gray-500">
              Selecciona un capítulo para comenzar
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseStart;
