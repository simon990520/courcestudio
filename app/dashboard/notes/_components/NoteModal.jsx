"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { improveNote } from "@/services/gemini";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede tener más de 100 caracteres"),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres"),
  subjectId: z.string().min(1, "Debes seleccionar una materia"),
});

const NoteModal = ({ isOpen, onClose, onSave, note, subjects, mode = "create" }) => {
  const [isImproving, setIsImproving] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
      subjectId: note?.subjectId || "",
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: note?.title || "",
        content: note?.content || "",
        subjectId: note?.subjectId || "",
      });
    }
  }, [isOpen, note, form]);

  const handleImproveContent = async () => {
    const formValues = form.getValues();
    
    if (!formValues.content || !formValues.subjectId) {
      toast.error("Por favor, ingresa el contenido y selecciona una materia antes de mejorar");
      return;
    }

    const subject = subjects.find(s => s.id === formValues.subjectId);
    if (!subject) {
      toast.error("Materia no encontrada");
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
      
      form.setValue("content", formattedText);
      
      // Guardar automáticamente
      onSave({
        title: formValues.title.trim(),
        content: formattedText,
        subjectId: formValues.subjectId
      });
      
      toast.success("¡Contenido mejorado y guardado con éxito!");
    } catch (error) {
      toast.error("Error al mejorar el contenido");
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear nuevo apunte" : "Editar apunte"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit((data) => {
              onSave({
                title: data.title.trim(),
                content: data.content.trim(),
                subjectId: data.subjectId
              });
            })} 
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del apunte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materia</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una materia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Escribe el contenido de tu apunte aquí..." 
                      className="min-h-[200px]" 
                      {...field} 
                    />
                  </FormControl>
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
