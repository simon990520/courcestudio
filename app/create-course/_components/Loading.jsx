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
 
  <AlertDialogContent>
    <AlertDialogHeader>
    
      <AlertDialogDescription>
        <div className='flex items-center flex-col py-12'>
            <Image src={'/LoadingCourse.gif'} width={100} height={100} />
            <h2>Por favor espera... La IA está trabajando en tu curso.</h2>
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    
  </AlertDialogContent>
</AlertDialog>

  )
}

export default Loading