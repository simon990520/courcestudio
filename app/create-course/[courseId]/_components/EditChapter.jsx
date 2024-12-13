import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { HiPencilSquare } from "react-icons/hi2";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { db } from "@/configs/db";
import { CourseList } from "@/configs/Schema";
import { realtimeDb } from "@/configs/firebaseConfig";
import { ref, get, set, update, push } from "firebase/database";
import { eq } from "drizzle-orm";
const EditChapter = ({course, index, refreshData}) => {

    const[name, setName] = useState();
    const[about,setAbout] = useState();
    const chapters =  course?.courseOutput?.course?.chapters;

    useEffect(()=>{
           setName(chapters[index].name);
           setAbout(chapters[index].about);
    },[course])
    const onUpdateHandler = async () => {
      if (!course || !course.courseId || !course.courseOutput?.course?.chapters?.[index]) {
        console.error("Datos del curso o capítulo inválidos. No se puede actualizar.");
        return;
      }
    
      try {
        // Referencia específica al capítulo en Firebase
        const chapterRef = ref(realtimeDb, `courses/${course.courseId}/courseOutput/course/chapters/${index}`);
    
        // Actualiza los datos del capítulo
        await update(chapterRef, {
          name: name,
          about: about,
        });
    
        console.log("Capítulo actualizado exitosamente en Firebase");
        refreshData(true); // Refresca los datos si es necesario
      } catch (error) {
        console.error("Error al actualizar el capítulo en Firebase:", error);
      }
    };
    
  return (
    <Dialog>
        <DialogTrigger>
            <HiPencilSquare />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar capítulos del curso</DialogTitle>
            <DialogDescription>
             <div className="mt-3">
              <label htmlFor="">Título del curso</label>
              <Input defaultValue={chapters[index].name} onChange={(e)=>setName(e?.target.value)} />
             </div>
             <div  className='mt-3'>
              <label  htmlFor="">Descripción del curso</label>
              <Textarea className="h-40" defaultValue={chapters[index].about} onChange ={(e)=>setAbout(e?.target.value)} />
             </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button onClick={onUpdateHandler}>
                Actualizar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}

export default EditChapter