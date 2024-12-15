"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { HiOutlineBookOpen, HiOutlineDocumentText, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineLightBulb, HiOutlineTrendingUp } from "react-icons/hi";
import { motion } from "framer-motion";
import Link from 'next/link';
import { Loader2 } from "lucide-react";

const FlashcardSelector = ({ subjects, notes, onStart }) => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [step, setStep] = useState('subjects'); // 'subjects' or 'notes'
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setSelectedSubjects([]);
    setSelectedNotes([]);
    setStep('subjects');
  }, []);

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(current =>
      current.some(s => s.id === subject.id)
        ? current.filter(s => s.id !== subject.id)
        : [...current, subject]
    );
  };

  const handleNoteToggle = (note) => {
    setSelectedNotes(current =>
      current.some(n => n.id === note.id)
        ? current.filter(n => n.id !== note.id)
        : [...current, note]
    );
  };

  const filteredNotes = notes.filter(note =>
    selectedSubjects.some(subject => subject.id === note.subjectId)
  );

  const canProceed = step === 'subjects' ? selectedSubjects.length > 0 : selectedNotes.length > 0;

  const handleStartSession = async () => {
    setIsGenerating(true);
    try {
      await onStart(selectedSubjects, selectedNotes);
    } finally {
      setIsGenerating(false);
      setSelectedSubjects([]);
      setSelectedNotes([]);
      setStep('subjects');
    }
  };

  return (
    <motion.div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <motion.div
            animate={{
              scale: step === 'subjects' ? 1.1 : 1,
              opacity: step === 'subjects' ? 1 : 0.5
            }}
            className="flex flex-col items-center"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'subjects' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="text-sm mt-1">Materias</span>
          </motion.div>
          <div className={`w-20 h-1 mx-2 ${step === 'notes' ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <motion.div
            animate={{
              scale: step === 'notes' ? 1.1 : 1,
              opacity: step === 'notes' ? 1 : 0.5
            }}
            className="flex flex-col items-center"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'notes' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="text-sm mt-1">Apuntes</span>
          </motion.div>
        </div>
      </div>

      {step === 'subjects' ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <motion.div
                key={subject.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    selectedSubjects.some(s => s.id === subject.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleSubjectToggle(subject)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedSubjects.some(s => s.id === subject.id)
                        ? 'bg-blue-200'
                        : 'bg-gray-100'
                    }`}>
                      <HiOutlineBookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{subject.name}</h3>
                      <p className="text-sm text-gray-500">
                        {notes.filter(n => n.subjectId === subject.id).length} apuntes
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    selectedNotes.some(n => n.id === note.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleNoteToggle(note)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedNotes.some(n => n.id === note.id)
                        ? 'bg-blue-200'
                        : 'bg-gray-100'
                    }`}>
                      <HiOutlineDocumentText className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{note.title}</h3>
                      <p className="text-sm text-gray-500">
                        {subjects.find(s => s.id === note.subjectId)?.name}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        {step === 'notes' && (
          <Button
            variant="outline"
            onClick={() => setStep('subjects')}
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            <HiOutlineChevronLeft className="mr-2 h-4 w-4" />
            Volver a Materias
          </Button>
        )}
        <div className={`${step === 'notes' ? '' : 'w-full flex justify-center'}`}>
          {step === 'subjects' ? (
            <Button
              onClick={() => setStep('notes')}
              disabled={!canProceed || isGenerating}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            >
              Seleccionar Apuntes
              <HiOutlineChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleStartSession}
              disabled={!canProceed || isGenerating}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  Comenzar
                  <HiOutlineLightBulb className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FlashcardSelector;
