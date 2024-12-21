'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { ref, get, set } from 'firebase/database';
import { realtimeDb } from '@/configs/firebaseConfig';
import { LearningMetrics } from './LearningMetrics';
import { generateCourseResponse, evaluateAnswer } from '@/services/gemini';
import { StructuredResponse } from './MessageComponents';

const AIAssistant = ({ course }) => {
  const { userId, user: clerkUser } = useUser();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const [userMetrics, setUserMetrics] = useState(null);

  useEffect(() => {
    if (userId) {
      loadUserMetrics();
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: {
            type: 'welcome',
            title: `¡Bienvenido${clerkUser?.firstName ? `, ${clerkUser.firstName}` : ''}! 👋`,
            explanation: `Soy tu asistente personal para el curso "${course.courseOutput?.course?.name}". 
                         Estoy aquí para ayudarte a entender mejor el contenido, responder tus preguntas 
                         y guiarte en tu aprendizaje. ¿En qué puedo ayudarte hoy?`
          }
        }]);
      }
    }
  }, [userId, course.courseOutput?.course?.name, clerkUser?.firstName]);

  const loadUserMetrics = async () => {
    if (!userId) return;

    try {
      const metricsRef = ref(realtimeDb, `users/${userId}/metrics`);
      const snapshot = await get(metricsRef);
      const data = snapshot.val();
      
      if (data) {
        const metrics = LearningMetrics.fromJSON(data);
        setUserMetrics(metrics);
      } else {
        const newMetrics = new LearningMetrics();
        setUserMetrics(newMetrics);
        await saveMetrics(newMetrics);
      }
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    }
  };

  const saveMetrics = async (metrics) => {
    if (!userId) return;

    try {
      const metricsRef = ref(realtimeDb, `users/${userId}/metrics`);
      await set(metricsRef, metrics.toJSON());
    } catch (error) {
      console.error('Error al guardar métricas:', error);
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const newMessages = [...messages, { role: 'user', content: message }];
      setMessages(newMessages);

      if (currentQuestion) {
        const evaluation = await evaluateAnswer(
          currentQuestion.question,
          message,
          currentQuestion.correctAnswer,
          clerkUser?.firstName
        );

        if (userMetrics) {
          userMetrics.recordAnswer(evaluation.isCorrect);
          if (evaluation.accuracy >= 80) {
            userMetrics.addMasteredTopic(currentQuestion.topic);
          } else {
            userMetrics.addImprovementNeeded(currentQuestion.topic);
          }
          await saveMetrics(userMetrics);
        }

        setMessages([
          ...newMessages,
          { role: 'assistant', content: evaluation }
        ]);
        setCurrentQuestion(null);
      } else {
        const response = await generateCourseResponse(
          message,
          course,
          userMetrics,
          clerkUser?.firstName
        );

        if (response.type === 'exam_request') {
          setCurrentQuestion(response.exam);
        }

        setMessages([...newMessages, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...messages,
        {
          role: 'assistant',
          content: {
            type: 'error',
            title: 'Error',
            explanation: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.'
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-[#FF5F13] to-[#FBB041] text-white rounded-full shadow-lg hover:opacity-90 transition-opacity z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-gray-50 rounded-lg shadow-lg z-50">
      <div className="absolute top-2 right-2">
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 bg-gradient-to-r from-[#FF5F13] to-[#FBB041] text-white rounded-t-lg">
        <h2 className="text-xl font-semibold">Asistente AI</h2>
        <p className="text-sm opacity-90">
          {clerkUser?.firstName ? `Hola, ${clerkUser.firstName}! ` : ''}
          Estoy aquí para ayudarte a aprender
        </p>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-160px)]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-[#FF5F13] to-[#FBB041] text-white'
                  : 'bg-white shadow-md'
              }`}
            >
              {message.role === 'user' ? (
                message.content
              ) : (
                <StructuredResponse content={message.content} />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-md p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[#FF5F13] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#FF5F13] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#FF5F13] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder={currentQuestion ? "Escribe tu respuesta..." : "Hazme una pregunta..."}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5F13]"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#FF5F13] to-[#FBB041] text-white rounded-lg hover:opacity-90 transition-opacity"
            onClick={(e) => {
              const input = e.target.previousElementSibling;
              handleSendMessage(input.value);
              input.value = '';
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
