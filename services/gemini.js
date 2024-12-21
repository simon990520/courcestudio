import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const formatResponse = (text) => {
  try {
    // Limpiar el texto antes de parsearlo
    const cleanText = text
      .replace(/\n/g, ' ')  // Reemplazar saltos de línea con espacios
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .replace(/(["\]}]),(?!\s*[{["'])/, '$1,') // Agregar comas faltantes entre elementos JSON
      .replace(/(["\]}])([{["'])/, '$1,$2'); // Agregar comas entre objetos/arrays

    // Intentar parsear como JSON
    if (cleanText.includes('"title":') || cleanText.includes('"explanation":')) {
      return JSON.parse(cleanText);
    }
  } catch (e) {
    console.error('Error al parsear respuesta JSON:', e);
    // Si no es JSON válido, crear una estructura básica
    return {
      title: "Respuesta del Asistente",
      explanation: text,
      steps: []
    };
  }
  return {
    title: "Respuesta del Asistente",
    explanation: text,
    steps: []
  };
};

export async function improveNote(noteContent, subject) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Como experto en educación y en la materia "${subject}", por favor mejora y enriquece el siguiente apunte académico. 
    Añade más detalles relevantes, ejemplos prácticos, y asegúrate de que la información sea precisa y esté bien estructurada.
    Mantén un tono académico pero comprensible.
    
    Apunte original:
    ${noteContent}
    
    Por favor, mejora este apunte manteniendo la siguiente estructura:
    1. Contenido principal (mejorado y expandido)
    2. Ejemplos prácticos
    3. Puntos clave a recordar
    4. Referencias o recursos adicionales (si aplica)`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error al mejorar el apunte con Gemini:", error);
    throw new Error("No se pudo mejorar el apunte. Por favor, inténtalo de nuevo.");
  }
}

export async function generateCourseResponse(question, courseContext, userMetrics = null) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Preparar el contexto del curso de manera segura
    const courseName = courseContext?.courseOutput?.course?.name || 'este curso';
    const courseDescription = courseContext?.courseOutput?.course?.description || '';
    const chapters = courseContext?.chapters || [];
    
    const courseInfo = `
      Curso: ${courseName}
      Descripción: ${courseDescription}
      ${chapters.length > 0 ? `Capítulos: ${chapters.map(chapter => {
        const chapterName = chapter?.name || '';
        const content = chapter?.content?.content || [];
        return `${chapterName}: ${content.map(item => 
          `${item?.title || ''} - ${item?.description || ''}`
        ).join('; ')}`;
      }).join('\n')}` : ''}
    `;

    // Preparar el contexto del usuario si está disponible
    const userProgress = userMetrics ? `
      Progreso del estudiante:
      - Temas dominados: ${userMetrics.progress?.masteredTopics?.join(', ') || 'Ninguno aún'}
      - Áreas de mejora: ${userMetrics.progress?.improvementNeeded?.join(', ') || 'No identificadas aún'}
      - Precisión actual: ${userMetrics.getAccuracyPercentage?.() || 0}%
    ` : '';

    const prompt = `
      Eres un asistente educativo experto para un curso en línea. Tu objetivo es ayudar al estudiante a comprender y dominar el contenido del curso.
      
      Información del curso:
      ${courseInfo}
      
      ${userProgress}
      
      Pregunta del estudiante: ${question}
      
      Por favor, proporciona una respuesta estructurada en formato JSON con los siguientes campos (incluye solo los campos relevantes):
      {
        "title": "Título descriptivo de la respuesta",
        "explanation": "Explicación principal",
        "steps": [
          { "title": "Paso 1", "description": "Descripción del paso" }
        ],
        "example": "Un ejemplo práctico si es relevante",
        "info": "Información adicional importante",
        "warning": "Advertencias o consideraciones importantes",
        "code": "Código de ejemplo si es relevante",
        "language": "Lenguaje del código"
      }
      
      La respuesta debe:
      1. Ser precisa y basada específicamente en el contenido del curso
      2. Usar un tono amigable y motivador
      3. Incluir ejemplos relevantes cuando sea apropiado
      4. Sugerir temas relacionados del curso para explorar
      5. Animar al estudiante a profundizar en el tema
      
      Si la pregunta no está relacionada con el contenido del curso, guía amablemente al estudiante hacia el material del curso.
      Si no tienes suficiente información para responder, indícalo claramente y sugiere preguntas más específicas.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return formatResponse(response.text());
  } catch (error) {
    console.error("Error al generar respuesta con Gemini:", error);
    throw new Error("No se pudo generar una respuesta. Por favor, inténtalo de nuevo.");
  }
}
