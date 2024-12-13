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
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);
  const { user } = useUser();
  const router = useRouter();
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
    <div>
      {/* steper */}
      <div className="flex flex-col justify-center items-center mt-10">
        <h2 className="text-4xl text-primary font-medium">Crear curso</h2>
        <div className="flex  mt-10">
          {StepperOptions.map((item, index) => (
            <div className="flex items-center">
              <div className="flex flex-col items-center w-[50px] md:w-[100px]">
                <div
                  className={`bg-gray-300 p-3 rounded-full text-white ${
                    activeIndex >= index && "bg-orange-500"
                  }`}
                >
                  {item.icon}
                </div>
                <h2 className="hidden md:block md:text-sm">{item.name}</h2>
              </div>
              {index != StepperOptions.length - 1 && (
                <div
                  className={`h-1 w-[50px] md:w-[100px] rounded-full bg-gray-300 lg:w-[170px] ${
                    activeIndex - 1 >= index && "bg-purple-500"
                  } `}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-10 md:px-20 lg:px-44 mt-10">
        {/* components */}
        {activeIndex == 0 ? (
          <SelectCategory />
        ) : activeIndex == 1 ? (
          <TopicDescription />
        ) : (
          <SelectOption />
        )}

        {/* next previous button  */}
        <div className="flex justify-between mt-10">
          <Button
            disabled={activeIndex == 0}
            onClick={() => setActiveIndex(activeIndex - 1)}
            variant="outline"
          >
            Previous
          </Button>
          {activeIndex < 2 && (
            <Button
              disabled={checkStaus()}
              onClick={() => setActiveIndex(activeIndex + 1)}
            >
              Next
            </Button>
          )}
          {activeIndex == 2 && (
            <Button
              disabled={checkStaus()}
              onClick={() => GenerateCourseLayout()}
            >
              Generar curso
            </Button>
          )}
        </div>
      </div>
      <Loading loading={loading} />
    </div>
  );
};

export default CreateCourse;
