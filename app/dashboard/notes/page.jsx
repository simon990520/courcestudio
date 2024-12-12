"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ref, get, remove, update, set, push } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { HiPlus } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { HiPencil, HiTrash } from "react-icons/hi2";
import { 
  HiOutlineBookOpen,
  HiOutlineDocumentText,
  HiOutlinePencil,
  HiOutlineClipboardList,
  HiOutlineChartBar
} from "react-icons/hi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NoteModal from "./_components/NoteModal";
import NoteViewer from "./_components/NoteViewer";

export default function NotesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userNotes, setUserNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState("course");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteNoteId, setDeleteNoteId] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch courses
        const coursesRef = ref(realtimeDb, "courses");
        const coursesSnapshot = await get(coursesRef);
        if (coursesSnapshot.exists()) {
          const coursesData = coursesSnapshot.val();
          const coursesArray = Object.entries(coursesData).map(([id, data]) => ({
            id,
            ...data,
            chapters: Array.isArray(data.chapters) ? data.chapters : Object.values(data.chapters || {}),
          }));
          setCourses(coursesArray);
          if (coursesArray.length > 0) {
            setSelectedCourse(coursesArray[0]);
          }
        }

        // Fetch subjects and notes
        const subjectsRef = ref(realtimeDb, "subjects");
        const snapshot = await get(subjectsRef);

        if (snapshot.exists()) {
          const subjectsData = snapshot.val();
          const userSubjects = [];
          const userNotesList = [];

          // Procesar las materias y sus notas
          Object.entries(subjectsData).forEach(([subjectId, subject]) => {
            if (subject.createdBy === user.id) {  // Only process subjects created by current user
              userSubjects.push({
                id: subjectId,
                name: subject.name
              });

              if (subject.notes) {
                Object.entries(subject.notes).forEach(([noteId, note]) => {
                  if (note.createdBy === user.id) {  // Only include notes created by current user
                    userNotesList.push({
                      id: noteId,
                      ...note,
                      subject: subject.name,
                      subjectId
                    });
                  }
                });
              }
            }
          });

          setSubjects(userSubjects);
          setUserNotes(userNotesList);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("No se pudieron cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSaveNote = async (formData) => {
    console.log('DEBUG - Saving note:', formData);
    console.log('DEBUG - Current editing note before:', editingNote);
    try {
      const now = new Date().toISOString();
      const subject = subjects.find(s => s.id === formData.subjectId);
      
      if (!subject) {
        throw new Error("Materia no encontrada");
      }

      const noteData = {
        title: formData.title,
        content: formData.content,
        subjectId: formData.subjectId,
        subject: subject.name,
        userId: user?.id,
        updatedAt: now,
        createdAt: editingNote ? editingNote.createdAt : now,
        createdBy: user?.id,
      };

      console.log('DEBUG - Prepared note data:', noteData);

      if (editingNote) {
        // Actualizar nota existente
        const noteRef = ref(realtimeDb, `subjects/${formData.subjectId}/notes/${editingNote.id}`);
        console.log('DEBUG - Updating existing note at path:', `subjects/${formData.subjectId}/notes/${editingNote.id}`);
        await update(noteRef, noteData);
        toast.success("Nota actualizada exitosamente");
      } else {
        // Crear nueva nota
        const notesRef = ref(realtimeDb, `subjects/${formData.subjectId}/notes`);
        console.log('DEBUG - Creating new note under subject:', formData.subjectId);
        const newNoteRef = push(notesRef);
        await set(newNoteRef, noteData);
        toast.success("Nota creada exitosamente");
      }

      console.log('DEBUG - Before closing modal after save');
      // Primero limpiamos el estado de edición
      setEditingNote(null);
      // Luego cerramos el modal
      setIsNoteModalOpen(false);
      console.log('DEBUG - After closing modal after save');
      loadSubjectsAndNotes(); // Cargar notas actualizadas
    } catch (error) {
      console.error("NotesPage - Error saving note:", error);
      toast.error("Error al guardar el apunte");
    }
  };

  const loadSubjectsAndNotes = async () => {
    try {
      const subjectsRef = ref(realtimeDb, "subjects");
      const snapshot = await get(subjectsRef);

      if (snapshot.exists()) {
        const subjectsData = snapshot.val();
        const userSubjects = [];
        const userNotesList = [];

        // Procesar las materias y sus notas
        Object.entries(subjectsData).forEach(([subjectId, subject]) => {
          if (subject.createdBy === user?.id) {
            userSubjects.push({
              id: subjectId,
              name: subject.name
            });

            if (subject.notes) {
              Object.entries(subject.notes).forEach(([noteId, note]) => {
                userNotesList.push({
                  id: noteId,
                  ...note,
                  subject: subject.name,
                  subjectId
                });
              });
            }
          }
        });

        setSubjects(userSubjects);
        setUserNotes(userNotesList);
      } else {
        setSubjects([]);
        setUserNotes([]);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("No se pudieron cargar los datos");
    }
  };

  useEffect(() => {
    if (user) {
      loadSubjectsAndNotes();
    }
  }, [user]);

  const handleDeleteNote = async () => {
    if (!deleteNoteId) return;

    try {
      // Primero necesitamos encontrar la materia a la que pertenece la nota
      const note = userNotes.find(n => n.id === deleteNoteId);
      if (!note) {
        throw new Error("Nota no encontrada");
      }

      const noteRef = ref(realtimeDb, `subjects/${note.subjectId}/notes/${deleteNoteId}`);
      await remove(noteRef);
      toast.success('Nota eliminada exitosamente');
      loadSubjectsAndNotes(); // Recargar las notas
    } catch (error) {
      console.error('Error al eliminar la nota:', error);
      toast.error('Error al eliminar la nota');
    }
  };

  const handleOpenNoteModal = (note = null) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleCloseNoteModal = () => {
    setEditingNote(null);
    setIsNoteModalOpen(false);
  };

  const filteredCourseContent = selectedCourse?.chapters?.flatMap((chapter, chapterIndex) => {
    if (!chapter) return [];
    
    const content = Array.isArray(chapter.content) 
      ? chapter.content 
      : Object.values(chapter.content || {});
    
    return content
      .map((item, itemIndex) => ({
        ...item,
        id: `${selectedCourse.id}-${chapterIndex}-${itemIndex}`,
        chapterName: chapter.name || '',
        chapterNumber: chapter.chapterId || chapterIndex,
      }))
      .filter(item => item && item.title);
  }) || [];

  const filteredNotes = userNotes.filter((note) => {
    if (!note || !note.title || !note.content) return false;
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || note.subjectId === selectedSubject.id;
    return matchesSearch && matchesSubject;
  });

  const filteredCourseNotes = filteredCourseContent.filter((note) => {
    if (!note || !note.title) return false;
    return (
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return <div className="p-6 text-center">Cargando apuntes...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 mb-8 shadow-lg border border-orange-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <HiOutlineDocumentText className="text-orange-500 text-2xl" />
              <h2 className="text-2xl font-semibold text-gray-800">
                Tus <span className="text-orange-600">apuntes</span>
              </h2>
            </div>
            
            <div className="flex items-start gap-3 bg-white/60 p-4 rounded-xl">
              <HiOutlineClipboardList className="text-orange-500 text-xl mt-1" />
              <div>
                <p className="text-gray-600 leading-relaxed">
                  Gestiona tus apuntes de manera eficiente. 
                  Crea, edita y organiza tus notas por materias y cursos.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    <HiOutlineDocumentText className="text-orange-500" />
                    <span>{userNotes.length} Apuntes</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    <HiOutlineBookOpen className="text-orange-500" />
                    <span>{subjects.length} Materias con notas</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    <HiOutlineChartBar className="text-orange-500" />
                    <span>{userNotes.filter(note => new Date(note.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} Esta semana</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {activeTab === "personal" && (
            <div className="flex-shrink-0">
              <Button
                onClick={() => {
                  setEditingNote(null);
                  setIsNoteModalOpen(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                disabled={isNoteModalOpen}
              >
                <HiPlus className="w-5 h-5" />
                Crear Apunte
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="course">Apuntes del Curso</TabsTrigger>
            <TabsTrigger value="personal">Mis Apuntes</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <BiSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar apuntes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <TabsContent value="course">
            <div className="flex gap-2 flex-wrap mb-4">
              {courses.map((course) => (
                <Button
                  key={`course-${course.id}`}
                  variant={selectedCourse?.id === course.id ? "default" : "outline"}
                  onClick={() => setSelectedCourse(course)}
                  className={selectedCourse?.id === course.id 
                    ? "bg-gradient-to-r from-[#FF5F13] to-[#FBB041] hover:from-[#FF5F13] hover:to-[#FBB041] text-white border-0" 
                    : "hover:bg-gradient-to-r hover:from-[#FF5F13] hover:to-[#FBB041] hover:text-white hover:border-0"}
                >
                  {course.category}
                </Button>
              ))}
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              {filteredCourseNotes.length === 0 ? (
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                  <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <h3 className="mt-4 text-lg font-semibold">No se encontraron apuntes</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                      {searchTerm
                        ? "No se encontraron apuntes que coincidan con tu búsqueda"
                        : "No hay apuntes disponibles en este curso"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourseNotes.map((note, index) => (
                    <Card 
                      key={`course-note-${note.id || index}`}
                      className="p-4 h-[200px] hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between group hover:border-orange-200"
                      onClick={() => setViewingNote({
                        ...note,
                        id: note.id || `course-note-${index}`,
                        subject: `${selectedCourse?.category} - Capítulo ${note.chapterNumber + 1}`,
                        updatedAt: new Date().toISOString(),
                        content: note.description || note.content || '',
                      })}
                    >
                      <div>
                        <h3 className="font-semibold mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                          {note.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Capítulo {note.chapterNumber + 1}: {note.chapterName}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {note.description || note.content}
                        </p>
                      </div>
                      {note.codeExample && (
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-hidden">
                          <code className="line-clamp-2">{note.codeExample}</code>
                        </pre>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="personal">
            <div className="grid gap-4 mb-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  key="all-subjects"
                  variant={selectedSubject === null ? "default" : "outline"}
                  onClick={() => setSelectedSubject(null)}
                  className={selectedSubject === null 
                    ? "bg-gradient-to-r from-[#FF5F13] to-[#FBB041] hover:from-[#FF5F13] hover:to-[#FBB041] text-white border-0" 
                    : "hover:bg-gradient-to-r hover:from-[#FF5F13] hover:to-[#FBB041] hover:text-white hover:border-0"}
                >
                  Todas las materias
                </Button>
                {subjects.map((subject) => (
                  <Button
                    key={`subject-${subject.id}`}
                    variant={selectedSubject?.id === subject.id ? "default" : "outline"}
                    onClick={() => setSelectedSubject(subject)}
                    className={selectedSubject?.id === subject.id 
                      ? "bg-gradient-to-r from-[#FF5F13] to-[#FBB041] hover:from-[#FF5F13] hover:to-[#FBB041] text-white border-0" 
                      : "hover:bg-gradient-to-r hover:from-[#FF5F13] hover:to-[#FBB041] hover:text-white hover:border-0"}
                  >
                    {subject.name}
                  </Button>
                ))}
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              {filteredNotes.length === 0 ? (
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                  <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <h3 className="mt-4 text-lg font-semibold">No se encontraron apuntes</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                      {searchTerm
                        ? "No se encontraron apuntes que coincidan con tu búsqueda"
                        : selectedSubject
                        ? "No hay apuntes en esta materia"
                        : "No tienes apuntes creados aún"}
                    </p>
                    <Button onClick={() => handleOpenNoteModal()} className="bg-gradient-to-r from-[#FF5F13] to-[#FBB041] hover:from-[#FF5F13] hover:to-[#FBB041] text-white">
                      <HiPlus className="mr-2 h-4 w-4" /> Crear Apunte
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map((note) => (
                    <Card 
                      key={`personal-note-${note.id}`}
                      className="p-4 h-[200px] hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between group hover:border-orange-200"
                      onClick={() => {
                        console.log('NotesPage - Setting viewingNote:', note);
                        setViewingNote(note);
                      }}
                    >
                      <div>
                        <h3 className="font-semibold mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">{note.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Materia: {note.subject}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {note.content}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground mt-2">
                          Actualizado: {new Date(note.updatedAt).toLocaleDateString()}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <HiPencil className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleOpenNoteModal(note);
                            }}>
                              <HiPencil className="mr-2 h-4 w-4" />
                              Editar nota
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteNoteId(note.id);
                              }}
                            >
                              <HiTrash className="mr-2 h-4 w-4" />
                              Eliminar nota
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={handleCloseNoteModal}
        onSave={handleSaveNote}
        note={editingNote}
        subjects={subjects}
        mode={editingNote ? "edit" : "create"}
      />

      {/* Note Viewer */}
      <NoteViewer
        isOpen={!!viewingNote}
        onClose={() => {
          console.log('NotesPage - Closing NoteViewer, current viewingNote:', viewingNote);
          setViewingNote(null);
        }}
        note={viewingNote}
        onEdit={(note) => {
          console.log('NotesPage - Editing note from viewer:', note);
          setViewingNote(null);
          handleOpenNoteModal(note);
        }}
      />

      {/* Delete Note Dialog */}
      <AlertDialog 
        open={!!deleteNoteId} 
        onOpenChange={() => setDeleteNoteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el apunte permanentemente.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="btn-primary"
              onClick={() => {
                handleDeleteNote();
                setDeleteNoteId(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}