"use client";
import { ref, get, set, update, push } from "firebase/database"; // Importa las funciones necesarias
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import CourseBasicInfo from "./_components/CourseBasicInfo";
import CourseDetail from "./_components/CourseDetail";
import ChapterList from "./_components/ChapterList";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { GenerateChapterContent_AI } from "@/configs/AiModel";
import service from "@/configs/service";
import Loading from "../_components/Loading";
import { useRouter } from "next/navigation";
import { realtimeDb } from "@/configs/firebaseConfig";

const courseLayout = ({ params }) => {
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCourseValid, setIsCourseValid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (params?.courseId) {
      getCourseData();
    } else {
      setIsCourseValid(false);
    }
  }, [params, user]);

  // Función para obtener datos del curso desde Firebase
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

  // Función para generar contenido de capítulos y guardarlo en Firebase
  const generateChapterContent = async () => {
    if (!course?.courseId || !course?.courseOutput?.course?.chapters) {
      toast.error("Faltan datos del curso o capítulos. No se puede generar contenido.");
      return;
    }

    setLoading(true);

    const chapters = course?.courseOutput?.course?.chapters;

    for (const [index, chapter] of chapters.entries()) {
      const prompt = `
        Explica el concepto en detalle sobre el tema: ${course?.name}, 
        Capítulo: ${chapter?.name}, 
        En formato JSON con una lista de arreglos con los campos como título, descripción en detalle, ejemplo de código (campo de código en formato <precode> si corresponde).
      `;

      try {
        let videoId = "";
        // Genera el video URL
        const videoResponse = await service.getVideos(`${course?.name}:${chapter?.name}`);
        if (videoResponse?.length > 0) {
          videoId = videoResponse[0]?.id?.videoId || "";
        }

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
      } catch (error) {
        console.error("Error generando contenido del capítulo:", error);
      }
    }

    // Actualiza el estado del curso como "publicado"
    const courseRef = ref(realtimeDb, `courses/${course.courseId}`);
    await update(courseRef, { publish: true });

    setLoading(false);
    router.replace(`/create-course/${course?.courseId}/finish`);
  };

  return (
    <div className="h-screen w-full mt-10 px-7 md:px-20 lg:px-44">
      <h2 className="font-bold text-center text-2xl">Diseño del curso</h2>

      <Loading loading={loading} />

      {/* Información básica del curso */}
      <CourseBasicInfo course={course} refreshData={getCourseData} />

      {/* Detalles del curso */}
      <CourseDetail course={course} />

      {/* Lista de capítulos */}
      <ChapterList course={course} refreshData={getCourseData} />

      <Button disabled={!isCourseValid} onClick={generateChapterContent} className="my-10">
        Generar contenido del curso
      </Button>
      <Toaster />
    </div>
  );
};

export default courseLayout;
