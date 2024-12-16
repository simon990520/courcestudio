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
import { useState } from "react";
import { improveNote } from "@/services/gemini";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede tener más de 100 caracteres"),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres").max(5000, "El contenido no puede tener más de 5000 caracteres"),
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

  const handleImproveContent = async () => {
    const content = form.getValues("content");
    const subjectId = form.getValues("subjectId");
    
    if (!content || !subjectId) {
      toast.error("Por favor, ingresa el contenido y selecciona una materia antes de mejorar");
      return;
    }

    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) {
      toast.error("Materia no encontrada");
      return;
    }

    setIsImproving(true);
    try {
      const improvedText = await improveNote(content, subject.name);
      form.setValue("content", improvedText);
      toast.success("¡Contenido mejorado con éxito!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsImproving(false);
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await onSave(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error("DEBUG - NoteModal save error:", error);
      toast.error("Error al guardar la nota");
    }
  });

  return (
    <Dialog 
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear nuevo apunte" : "Editar apunte"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
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
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una materia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
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
                      placeholder="Escribe tu apunte aquí"
                      className="h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleImproveContent}
                disabled={isImproving}
              >
                {isImproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mejorando...
                  </>
                ) : (
                  "Mejorar con IA"
                )}
              </Button>

              <Button 
                type="submit"
                className="bg-gradient-to-r from-[#FF5F13] to-[#FBB041] hover:from-[#FF5F13] hover:to-[#FBB041] text-white"
              >
                {mode === "create" ? "Crear" : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NoteModal;
