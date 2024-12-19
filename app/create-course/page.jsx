"use client";
import React, { useContext, useEffect, useState } from "react";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import { HiLightBulb } from "react-icons/hi";
import { HiClipboardDocumentCheck } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import SelectCategory from "./_components/SelectCategory";
import TopicDesc from "./_components/TopicDescription";
import TopicDescription from "./_components/TopicDescription";
import SelectOption from "./_components/SelectOption";
import { UserInputContext } from "../_context/UserInputContext";
import { GenerateCourseLayoutAI } from "@/configs/AiModel";
import Loading from "./_components/Loading";
import { db } from "@/configs/db";
import { CourseList } from "@/configs/Schema";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { adminConfig } from "@/configs/AdminConfig";
import { ref, set } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";

const CreateCourse = () => {
  const StepperOptions = [
    {
      id: 1,
      name: "Categoría",
      icon: <HiMiniSquares2X2 />,
    },
    {
      id: 2,
      name: "Temas",
      icon: <HiLightBulb />,
    },
    {
      id: 3,
      name: "Opciones",
      icon: <HiClipboardDocumentCheck />,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    //  console.log(userCourseInput);
  }, [userCourseInput]);

  // Used to check next Button Enable or Disable status
  const checkStaus = () => {
    if (userCourseInput?.length == 0) {
      return true;
    }
    if (
      activeIndex == 0 &&
      (userCourseInput?.category?.length == 0 ||
        userCourseInput?.category == undefined)
    ) {
      return true;
    }
    if (
      activeIndex == 1 &&
      (userCourseInput?.topic?.length == 0 ||
        userCourseInput?.topic == undefined)
    ) {
      return true;
    }
    if (
      activeIndex == 2 &&
      (userCourseInput?.level == undefined ||
        userCourseInput?.duration == undefined ||
        userCourseInput?.displayVideo == undefined ||
        userCourseInput?.noOfChapter == undefined)
    ) {
      return true;
    }
    return false;
  };

  const isAdmin = adminConfig.emails.includes(user?.primaryEmailAddress?.emailAddress);
  const GenerateCourseLayout = async () => {
    if(!isAdmin){
      const numberOfChapter = userCourseInput?.noOfChapter; 
      if(numberOfChapter>25){
        alert("No puedes seleccionar más de 25 capítulos.");
        return;
      }
    }

    setLoading(true);
    const BASIC_PROMPT =
      'Genera un tutorial de curso con los siguientes detalles: Nombre del curso, Descripción, Nombre del capítulo, Acerca de, Duración, y estructúralo en formato JSON como un objeto con un campo "course" que contenga estos atributos: ';
    const USER_INPUT_PROMPT =
      "Categoría: " +
      userCourseInput?.category +
      ", Tema: " +
      userCourseInput?.topic +
      ", Nivel: " +
      userCourseInput?.level +
      ", Duracion: " +
      userCourseInput?.duration +
      ", NoOfChapters: " +
      userCourseInput?.noOfChapter;
    const FINAL_PROMPT =
      BASIC_PROMPT +
      USER_INPUT_PROMPT +
      'El JSON debe incluir "course" con "name", "description" y un arreglo de objetos "chapters". Responde en el idioma del tema.';

    console.log(FINAL_PROMPT);

    // Fetch response
    const result = await GenerateCourseLayoutAI.sendMessage(FINAL_PROMPT);
    console.log(result.response?.text());

    const parsedResult = JSON.parse(result.response?.text());
    console.log(parsedResult);

    setLoading(false);
    saveCourseLayoutDb(JSON.parse(result.response?.text()));
  };

  const saveCourseLayoutDb = async (courseLayout) => {
    const id = uuid4(); // Genera un ID único para el curso.
    setLoading(true);
  
    try {
      // Referencia al nodo en Realtime Database
      const courseRef = ref(realtimeDb, `courses/${id}`);
  
      // Verifica y limpia los datos antes de guardarlos
      const dataToSave = {
        courseId: id,
        name: userCourseInput?.topic || "Sin nombre",
        level: userCourseInput?.level || "Principiante",
        category: userCourseInput?.category || "General",
        includeVideo: userCourseInput?.displayVideo || "No", 
        courseOutput: courseLayout || {},
        createdBy: user?.primaryEmailAddress?.emailAddress || "Usuario desconocido",
        userName: user?.fullName || "Anonimo",
        userProfileImage: user?.imageUrl || "",
      };
  
      // Guardar los datos del curso
      try {
      
        await set(courseRef, dataToSave);
      
        console.log("Datos guardados exitosamente en Firebase.");
      } catch (error) {
        console.error("Error en set(courseRef, dataToSave):", error.message);
        console.error("Detalles del error:", error);
      }
      
  
      console.log("Curso guardado correctamente en Firebase Realtime Database");
      setLoading(false);
  
      // Redirigir al usuario a la página del curso generado
      router.replace(`/create-course/${id}`);
    } catch (error) {
      console.error("Error al guardar el curso en Firebase Realtime Database:", error);
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-6 px-4">
      {/* stepper loader */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="relative flex justify-center items-center py-6">
          {/* Progress bar background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 transform -translate-y-1/2"></div>
          
          {/* Animated progress bar */}
          <div 
            className="absolute top-1/2 left-0 h-1 transform -translate-y-1/2 transition-all duration-500 ease-out bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-300"
            style={{
              width: `${(activeIndex / (StepperOptions.length - 1)) * 100}%`,
              boxShadow: '0 0 10px rgba(255, 126, 50, 0.3)'
            }}
          />

          {/* Steps */}
          <div className="relative flex justify-between w-full">
            {StepperOptions.map((item, index) => (
              <div 
                key={item.id}
                className="flex flex-col items-center"
                style={{
                  transition: 'transform 0.5s ease-out',
                  transform: `translateY(${activeIndex === index ? '-4px' : '0'})`
                }}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg relative z-10
                    transition-all duration-500 ease-out cursor-pointer
                    ${activeIndex === index 
                      ? 'bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-300 text-white shadow-lg scale-110 animate-pulse-shadow' 
                      : activeIndex > index
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-300 text-white'
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}
                  onClick={() => activeIndex > index && setActiveIndex(index)}
                >
                  <span className={`transition-transform duration-300 ${activeIndex >= index ? 'scale-110' : 'scale-100'}`}>
                    {activeIndex > index ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      item.icon
                    )}
                  </span>
                </div>
                <span 
                  className={`mt-2 text-xs font-medium transition-all duration-300
                    ${activeIndex >= index 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400' 
                      : 'text-gray-400'
                    }`}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4 md:p-6 transition-all duration-300 ease-in-out transform hover:shadow-xl">
        <div className="min-h-[300px] flex flex-col justify-between">
          <div className={`animate-fade-in transform transition-all duration-500 ${activeIndex === 1 ? 'translate-x-0' : activeIndex === 2 ? '-translate-x-0' : ''}`}>
            {activeIndex === 0 ? (
              <SelectCategory />
            ) : activeIndex === 1 ? (
              <TopicDescription />
            ) : (
              <SelectOption />
            )}
          </div>

          <div className="flex justify-between mt-4 pt-4 border-t">
            {isClient && (
              <>
                <Button
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex(activeIndex - 1)}
                  variant="outline"
                  className="transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  Previous
                </Button>
                {activeIndex < 2 && (
                  <Button
                    disabled={checkStaus()}
                    onClick={() => setActiveIndex(activeIndex + 1)}
                    className="bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Next
                  </Button>
                )}
                {activeIndex === 2 && (
                  <Button
                    disabled={checkStaus()}
                    onClick={() => GenerateCourseLayout()}
                    className="bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Generar curso
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Loading loading={loading} />
    </div>
  );
};

export default CreateCourse;
