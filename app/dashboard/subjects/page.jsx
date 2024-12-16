"use client";

import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { get, ref, remove, set, update } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import SubjectCard from "./_components/SubjectCard";
import SubjectModal from "./_components/SubjectModal";
import Wellcome from "./_components/Wellcome"; // Actualizar la importación
import NoteModal from "./_components/NoteModal";
import { Input } from "@/components/ui/input";
import { HiMagnifyingGlass, HiPlus } from "react-icons/hi2";
import { 
  HiOutlineBookOpen,
  HiOutlineDocumentText,
  HiOutlinePencil,
  HiOutlineClipboardList,
  HiOutlineChartBar
} from "react-icons/hi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteSubjectId, setDeleteSubjectId] = useState(null);
  const [deleteNoteId, setDeleteNoteId] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  const loadSubjects = async () => {
    try {
      const subjectsRef = ref(realtimeDb, 'subjects');
      const snapshot = await get(subjectsRef);
      if (snapshot.exists()) {
        const subjectsData = snapshot.val();
        const subjectsList = Object.entries(subjectsData)
          .map(([id, data]) => {
            // Asegurarse de que notes sea un objeto si existe, o un objeto vacío si no existe
            const notes = data.notes && typeof data.notes === 'object' ? data.notes : {};
            return {
              id,
              ...data,
              notes
            };
          })
          // Filtrar solo las materias creadas por el usuario actual
          .filter(subject => subject.createdBy === user?.id)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setSubjects(subjectsList);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('Error al cargar materias:', error);
      toast.error('Error al cargar las materias');
    }
  };

  const handleSaveSubject = async (formData) => {
    try {
      const now = new Date().toISOString();
      let subjectData = {
        ...formData,
        updatedAt: now,
      };

      if (!editingSubject) {
        // Crear nueva materia usando UUID
        subjectData = {
          ...subjectData,
          createdAt: now,
          createdBy: user?.id || 'unknown',
          notes: {}
        };
        const subjectId = uuidv4(); // Generar UUID para la materia
        const newSubjectRef = ref(realtimeDb, `subjects/${subjectId}`);
        await set(newSubjectRef, subjectData);
        toast.success('Materia creada exitosamente');
      } else {
        // Actualizar materia existente
        const subjectRef = ref(realtimeDb, `subjects/${editingSubject.id}`);
        subjectData = {
          ...editingSubject,
          ...subjectData,
          notes: editingSubject.notes || {},
          createdAt: editingSubject.createdAt,
          createdBy: editingSubject.createdBy,
        };
        await set(subjectRef, subjectData);
        toast.success('Materia actualizada exitosamente');
      }

      handleCloseSubjectModal();
      loadSubjects();
    } catch (error) {
      console.error('Error al guardar materia:', error);
      toast.error('Error al guardar la materia');
    }
  };

  const handleSaveNote = async (formData) => {
    if (!currentSubject) return;

    try {
      const now = new Date().toISOString();
      const noteId = editingNote ? editingNote.id : uuidv4(); // Usar UUID para notas
      
      const noteData = {
        ...formData,
        id: noteId,
        updatedAt: now,
        createdAt: editingNote ? editingNote.createdAt : now,
        createdBy: editingNote ? editingNote.createdBy : user?.id || 'unknown',
      };

      // Actualizar la nota específica en la ruta correcta
      const noteRef = ref(realtimeDb, `subjects/${currentSubject.id}/notes/${noteId}`);
      await set(noteRef, noteData);

      // Actualizar la fecha de actualización de la materia
      const subjectRef = ref(realtimeDb, `subjects/${currentSubject.id}`);
      await update(subjectRef, { updatedAt: now });

      toast.success(editingNote ? 'Apunte actualizado exitosamente' : 'Apunte creado exitosamente');
      handleCloseNoteModal();
      loadSubjects();
    } catch (error) {
      console.error('Error al guardar apunte:', error);
      toast.error('Error al guardar el apunte');
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectId) return;

    try {
      const subjectRef = ref(realtimeDb, `subjects/${deleteSubjectId}`);
      await remove(subjectRef);
      toast.success('Materia eliminada exitosamente');
      setDeleteSubjectId(null);
      loadSubjects();
    } catch (error) {
      console.error('Error al eliminar materia:', error);
      toast.error('Error al eliminar la materia');
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteNoteId || !currentSubject) return;

    try {
      // Eliminar la nota específica
      const noteRef = ref(realtimeDb, `subjects/${currentSubject.id}/notes/${deleteNoteId.noteId}`);
      await remove(noteRef);

      // Actualizar la fecha de actualización de la materia
      const subjectRef = ref(realtimeDb, `subjects/${currentSubject.id}`);
      await update(subjectRef, { updatedAt: new Date().toISOString() });

      toast.success('Apunte eliminado exitosamente');
      setDeleteNoteId(null);
      setCurrentSubject(null);
      loadSubjects();
    } catch (error) {
      console.error('Error al eliminar apunte:', error);
      toast.error('Error al eliminar el apunte');
    }
  };

  const handleOpenSubjectModal = (subject = null) => {
    setEditingSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const handleCloseSubjectModal = () => {
    setEditingSubject(null);
    setIsSubjectModalOpen(false);
  };

  const handleOpenNoteModal = (subject, note = null) => {
    setCurrentSubject(subject);
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleCloseNoteModal = () => {
    setCurrentSubject(null);
    setEditingNote(null);
    setIsNoteModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <Wellcome 
        setIsSubjectModalOpen={setIsSubjectModalOpen}
        setEditingSubject={setEditingSubject}
      />
      {/* Search Bar */}
      <div className="relative">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar materias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Subjects Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjects
          .filter((subject) =>
            subject.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={() => {
                setEditingSubject(subject);
                setIsSubjectModalOpen(true);
              }}
              onDelete={() => setDeleteSubjectId(subject.id)}
              onAddNote={() => {
                setCurrentSubject(subject);
                setEditingNote(null);
                setIsNoteModalOpen(true);
              }}
              onEditNote={(note) => {
                setCurrentSubject(subject);
                setEditingNote(note);
                setIsNoteModalOpen(true);
              }}
              onDeleteNote={(noteId) => setDeleteNoteId({ subjectId: subject.id, noteId })}
            />
          ))}
      </div>

      {/* Empty State */}
      {subjects.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/10 rounded-lg">
          <div className="w-16 h-16 mb-4 text-muted-foreground">
            {/* Puedes agregar un icono aquí */}
          </div>
          <h3 className="text-lg font-semibold">No hay materias</h3>
          <p className="text-muted-foreground">
            Comienza creando tu primera materia para organizar tus apuntes
          </p>
          <Button 
            onClick={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
            className="btn-primary mt-4"
            disabled={isSubjectModalOpen}
          >
            <HiPlus className="w-5 h-5 mr-2" />
            Crear Materia
          </Button>
        </div>
      )}

      {/* Modals */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSave={handleSaveSubject}
        subject={editingSubject}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
        subject={currentSubject}
      />

      {/* Delete Subject Dialog */}
      <AlertDialog open={!!deleteSubjectId} onOpenChange={() => setDeleteSubjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la materia y todos sus apuntes asociados.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="btn-primary"
              onClick={() => {
                handleDeleteSubject(deleteSubjectId);
                setDeleteSubjectId(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Note Dialog */}
      <AlertDialog 
        open={!!deleteNoteId} 
        onOpenChange={() => setDeleteNoteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el apunte seleccionado.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="btn-primary"
              onClick={() => {
                if (deleteNoteId) {
                  handleDeleteNote(deleteNoteId.subjectId, deleteNoteId.noteId);
                  setDeleteNoteId(null);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubjectsPage;
