export interface LessonStageRow {
  id: string;
  stageName: string; // "Сабақтың басы (0–7 мин)", "Сабақтың ортасы (8–35 мин)", "Сабақтың соңы (36–45 мин)" etc.
  durationMinutes: number;
  teacherActivity: string; // Педагогтің әрекеті
  studentActivity: string; // Оқушының әрекеті
  assessment: string; // Бағалау
  resources: string; // Ресурстар
  pedagogicalTags?: string[]; // e.g. ["Психологиялық ахуал", "Миға шабуыл", "Саралау", "ЕББҚ"]
}

export interface QMJDocument {
  id: string;
  // Official Order No. 130 required header fields
  section: string; // Бөлім
  teacherName: string; // Педагогтің Т.А.Ә.
  date: string; // Күні (YYYY-MM-DD)
  grade: string; // Сынып (e.g. "6", "6 'А'")
  presentStudents: number; // Қатысушылар саны
  absentStudents: number; // Қатыспағандар саны
  subject: string; // Пән
  topic: string; // Сабақтың тақырыбы
  learningObjectives: string; // Оқу бағдарламасына сәйкес оқыту мақсаттары
  lessonObjectives: string; // Сабақтың мақсаты

  // Central Lesson Process Table (Order No. 130 structure)
  lessonStages: LessonStageRow[];

  // Meta & configuration
  lessonDuration: number; // e.g. 45 or 40 min
  selectedPedagogicalElements: string[]; // Active checkboxes
  schoolName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  schoolName: string;
  teacherName: string;
  subject: string;
  defaultGrade: string;
  defaultDuration: number;
}

export interface QualityCheckItem {
  id: string;
  label: string;
  passed: boolean;
  message?: string;
}

export interface QualityCheckResult {
  isComplete: boolean;
  scoreRatio: string;
  items: QualityCheckItem[];
  missingElements: string[];
}
