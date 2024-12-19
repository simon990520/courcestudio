"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { improveNote } from "@/services/gemini";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const noteFormSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(100, "El título no puede tener más de 100 caracteres"),
  content: z
    .string()
    .min(10, "El contenido debe tener al menos 10 caracteres")
    .max(2000, "El contenido no puede tener más de 2000 caracteres"),
});

const NoteModal = ({ isOpen, onClose, onSave, subject, note, mode = "create" }) => {
  const [isImproving, setIsImproving] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
      });
    } else {
      form.reset({
        title: "",
        content: "",
      });
    }
  }, [note, form]);

  const handleImproveContent = async () => {
    const formValues = form.getValues();
    
    if (!formValues.content || !formValues.title) {
      toast.error("Por favor, ingresa el título y contenido antes de generar");
      return;
    }

    setIsImproving(true);
    try {
      const improvedText = await improveNote(formValues.content, subject.name);
      // Mejorar el formato del contenido
      const formattedText = improvedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n\n');
      
      // Guardar automáticamente
      await onSave({
        title: formValues.title.trim(),
        content: formattedText,
      });
      
      toast.success("¡Contenido mejorado y guardado con éxito!");
      form.reset();
      onClose();
    } catch (error) {
      toast.error("Error al mejorar el contenido");
    } finally {
      setIsImproving(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nuevo Apunte" : "Editar Apunte"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? `Crear nuevo apunte para la materia "${subject?.name}"`
              : `Editar apunte de la materia "${subject?.name}"`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Introducción al tema" {...field} />
                  </FormControl>
                  <FormDescription>
                    El título debe ser descriptivo y conciso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe tu apunte aquí..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/2000 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="default"
                disabled={isImproving}
                onClick={handleImproveContent}
              >
                {isImproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  'Generar'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NoteModal;
