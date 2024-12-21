// Modelo de datos para métricas de aprendizaje
export class LearningMetrics {
  constructor(userId) {
    this.userId = userId;
    this.lastUpdated = new Date().toISOString();
    this.performance = {
      correctAnswers: 0,
      totalAnswers: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      difficultyLevels: {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 }
      }
    };
    this.progress = {
      masteredTopics: [],
      improvementNeeded: [],
      timeline: [] // [{date, score, topic}]
    };
    this.usage = {
      totalSessions: 0,
      totalTimeSpent: 0, // en minutos
      lastSession: null,
      timeOfDay: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      },
      daysOfWeek: {
        monday: 0, tuesday: 0, wednesday: 0,
        thursday: 0, friday: 0, saturday: 0, sunday: 0
      }
    };
    this.preferences = {
      learningStyle: {
        visual: 0,
        textual: 0,
        practical: 0
      },
      explanationLength: {
        short: 0,
        medium: 0,
        long: 0
      }
    };
    this.feedback = {
      confidenceScores: [], // [1-5]
      averageConfidence: 0,
      userRatings: [] // [{topic, rating, comment}]
    };
    this.errorAnalysis = {
      commonErrors: {}, // {errorType: frequency}
      topicErrors: {} // {topic: frequency}
    };
    this.adaptability = {
      recommendationSuccess: 0,
      totalRecommendations: 0,
      improvementRate: [] // [{topic, beforeScore, afterScore}]
    };
    this.sessionData = {
      device: null,
      browser: null,
      averageSessionDuration: 0,
      totalSessions: 0
    };
    this.emotionalState = {
      frustrationLevel: 0, // 0-100
      motivationLevel: 0, // 0-100
      engagementTrend: [] // [{date, level}]
    };
  }

  // Método estático para crear una instancia desde datos JSON
  static fromJSON(data) {
    if (!data || !data.userId) {
      throw new Error('Datos inválidos para crear LearningMetrics');
    }
    const metrics = new LearningMetrics(data.userId);
    Object.assign(metrics, data);
    return metrics;
  }

  // Calcular porcentaje de aciertos
  getAccuracyPercentage() {
    if (!this.performance || this.performance.totalAnswers === 0) return 0;
    return (this.performance.correctAnswers / this.performance.totalAnswers) * 100;
  }

  // Obtener temas dominados
  getMasteredTopics() {
    return this.progress?.masteredTopics || [];
  }

  // Obtener áreas de mejora
  getImprovementAreas() {
    return this.progress?.improvementNeeded || [];
  }

  // Actualizar tiempo de respuesta
  updateResponseTime(time) {
    if (!this.performance) return;
    this.performance.totalResponseTime += time;
    this.performance.totalAnswers++;
    this.performance.averageResponseTime = 
      this.performance.totalResponseTime / this.performance.totalAnswers;
  }

  // Registrar una respuesta
  recordAnswer(isCorrect, topic, difficulty, responseTime, confidenceLevel) {
    if (!this.performance || !this.progress) return;

    // Actualizar estadísticas básicas
    this.performance.totalAnswers++;
    if (isCorrect) this.performance.correctAnswers++;

    // Actualizar dificultad
    if (this.performance.difficultyLevels[difficulty]) {
      this.performance.difficultyLevels[difficulty].total++;
      if (isCorrect) this.performance.difficultyLevels[difficulty].correct++;
    }

    // Actualizar tiempo de respuesta
    this.updateResponseTime(responseTime);

    // Actualizar confianza
    if (this.feedback) {
      this.feedback.confidenceScores.push(confidenceLevel);
      this.feedback.averageConfidence = 
        this.feedback.confidenceScores.reduce((a, b) => a + b, 0) / 
        this.feedback.confidenceScores.length;
    }

    // Actualizar progreso del tema
    this.updateTopicProgress(topic, isCorrect);

    // Actualizar timeline
    if (this.progress.timeline) {
      this.progress.timeline.push({
        date: new Date().toISOString(),
        topic,
        score: isCorrect ? 1 : 0
      });
    }

    this.lastUpdated = new Date().toISOString();
  }

  // Actualizar progreso del tema
  updateTopicProgress(topic, isCorrect) {
    if (!this.errorAnalysis || !this.progress) return;

    if (!this.errorAnalysis.topicErrors[topic]) {
      this.errorAnalysis.topicErrors[topic] = { correct: 0, total: 0 };
    }

    const topicStats = this.errorAnalysis.topicErrors[topic];
    topicStats.total++;
    if (isCorrect) topicStats.correct++;

    // Actualizar temas dominados/por mejorar
    const masteryThreshold = 0.8; // 80% de aciertos
    const accuracy = topicStats.correct / topicStats.total;

    if (accuracy >= masteryThreshold) {
      if (!this.progress.masteredTopics.includes(topic)) {
        this.progress.masteredTopics.push(topic);
        this.progress.improvementNeeded = this.progress.improvementNeeded.filter(t => t !== topic);
      }
    } else {
      if (!this.progress.improvementNeeded.includes(topic)) {
        this.progress.improvementNeeded.push(topic);
        this.progress.masteredTopics = this.progress.masteredTopics.filter(t => t !== topic);
      }
    }
  }

  // Iniciar nueva sesión
  startSession(deviceInfo) {
    if (!this.usage || !this.sessionData) return;

    this.usage.totalSessions++;
    this.usage.lastSession = new Date().toISOString();
    
    if (deviceInfo) {
      this.sessionData.device = deviceInfo.device;
      this.sessionData.browser = deviceInfo.browser;
    }

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) this.usage.timeOfDay.morning++;
    else if (hour >= 12 && hour < 17) this.usage.timeOfDay.afternoon++;
    else if (hour >= 17 && hour < 21) this.usage.timeOfDay.evening++;
    else this.usage.timeOfDay.night++;

    const day = new Date().getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    if (this.usage.daysOfWeek[days[day]] !== undefined) {
      this.usage.daysOfWeek[days[day]]++;
    }

    this.lastUpdated = new Date().toISOString();
  }

  // Generar resumen de progreso
  generateProgressSummary() {
    if (!this.performance || !this.usage || !this.feedback) {
      return {
        accuracy: '0%',
        masteredTopics: [],
        improvementAreas: [],
        averageResponseTime: '0s',
        totalSessions: 0,
        confidenceLevel: '0/5',
        lastActive: null,
        preferredLearningTime: 'no data'
      };
    }

    return {
      accuracy: this.getAccuracyPercentage().toFixed(1) + '%',
      masteredTopics: this.getMasteredTopics(),
      improvementAreas: this.getImprovementAreas(),
      averageResponseTime: this.performance.averageResponseTime.toFixed(1) + 's',
      totalSessions: this.usage.totalSessions,
      confidenceLevel: this.feedback.averageConfidence.toFixed(1) + '/5',
      lastActive: this.usage.lastSession,
      preferredLearningTime: Object.entries(this.usage.timeOfDay)
        .sort((a, b) => b[1] - a[1])[0][0]
    };
  }

  // Convertir a objeto plano para Firebase
  toJSON() {
    return {
      userId: this.userId,
      lastUpdated: this.lastUpdated,
      performance: this.performance,
      progress: this.progress,
      usage: this.usage,
      preferences: this.preferences,
      feedback: this.feedback,
      errorAnalysis: this.errorAnalysis,
      adaptability: this.adaptability,
      sessionData: this.sessionData,
      emotionalState: this.emotionalState
    };
  }
}
