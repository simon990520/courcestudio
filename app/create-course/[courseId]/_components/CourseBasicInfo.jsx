import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { HiOutlinePuzzlePiece } from "react-icons/hi2";
import EditCourseBasicInfo from "./EditCourseBasicInfo";
import { Corben } from "next/font/google";
import { getDownloadURL, ref as refFile, uploadBytes } from "firebase/storage";
import { date } from "drizzle-orm/mysql-core";
import { getDatabase, ref, update } from "firebase/database"; // Firebase imports
import { storage, realtimeDb } from "@/configs/firebaseConfig";
import { db } from "@/configs/db";
import { CourseList } from "@/configs/Schema";
import { eq } from "drizzle-orm";
import {toast} from 'react-hot-toast';
import Link from "next/link";

const CourseBasicInfo = ({ course, refreshData,edit=true }) => {
  const [selectedFile, setSelectedFile] = useState();
  useEffect(()=>{
       if(course){
        setSelectedFile(course?.courseBanner)
       }
  },[course])
  const onFileSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }
  
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload an image file (jpg, jpeg, png).");
      return;
    }
  
    // Muestra una vista previa local del archivo seleccionado
    setSelectedFile(URL.createObjectURL(file));
  
    // Genera un nombre único para el archivo
    const fileName = `${Date.now()}.jpg`;
    const storageRef = refFile(storage, `ai-course/${fileName}`);
  
    try {
      // Subir el archivo a Firebase Storage
      await uploadBytes(storageRef, file);
      console.log("File uploaded successfully.");
  
      // Obtener la URL pública del archivo
      const downloadUrl = await getDownloadURL(storageRef);
      console.log("Download URL:", downloadUrl);
  
      // Actualizar la URL en Firebase Realtime Database
      const courseRef = ref(realtimeDb, `courses/${course.courseId}`);
      await update(courseRef, {
        courseBanner: downloadUrl,
      });
      console.log("Database updated successfully with new banner URL.");
    } catch (error) {
      console.error("Error uploading file or updating the database:", error);
      toast.error("An error occurred while updating the course banner.");
    }
  };
  

  return (
    <div className="p-10 border rounded-xl shadow-sm mt-5">
      <div className="grid grid-cols-1 md:grid-cols-2  gap-8">
        <div>
          <h2 className="font-bold text-3xl">
            {course?.courseOutput?.course?.name}{" "}
            <span>
              {" "}
          {edit &&<EditCourseBasicInfo
                course={course}
                refreshData={() => refreshData(true)}
              />}
            </span>{" "}
          </h2>
          <p className="text-sm text-gray-400 mt-3">
            {course?.courseOutput?.course?.description}
          </p>
          <h2 className="font-medium mt-2 flex gap-2 items-center text-primary">
            {" "}
            <HiOutlinePuzzlePiece /> {course?.category}
          </h2>
         {!edit &&<Link href={'/course/'+course?.courseId+'/start'}>
          <Button className="w-full mt-5 cursor-pointer">Start</Button>
          </Link>}
        </div>
        <div>
          <label htmlFor="upload-image">
            <Image
              src={selectedFile ? selectedFile : "/course-cover.svg"}
              width={600}
              height={300}
              className="w-ful rounded-xl h-[250px] object-cover cursor-pointer"
            />
         </label>
         {edit &&
          <input
            hidden
            type="file"
            id="upload-image"
            className="opacity-0"
            onChange={onFileSelected}
          />
          }
        </div>
      </div>
    </div>
  );
};

export default CourseBasicInfo;
