import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import Image from 'next/image'
import { WidthIcon } from '@radix-ui/react-icons'
  
const Loading = ({loading}) => {
  return (

<AlertDialog open={loading}>
 
  <AlertDialogContent style={{ backgroundColor: '#f6f6f6' }}>
    <AlertDialogHeader>
      <AlertDialogTitle>
        Generando Curso con IA
      </AlertDialogTitle>
      <div className="text-center">
        <Image src={'/LoadingCourse.gif'} width={100} height={100} alt="Animación de carga mientras la IA genera el curso" className="mx-auto mb-4" />
      </div>
      <AlertDialogDescription className="text-lg text-center py-4">
        Por favor espera... La IA está trabajando en tu curso.
      </AlertDialogDescription>
    </AlertDialogHeader>
    
  </AlertDialogContent>
</AlertDialog>

  )
}

export default Loading