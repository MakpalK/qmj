import { QMJDocument, QualityCheckItem, QualityCheckResult } from '../types';

export function checkQMJQuality(doc: QMJDocument): QualityCheckResult {
  const items: QualityCheckItem[] = [];
  const missingElements: string[] = [];

  // 1. Бөлім бар
  const hasSection = Boolean(doc.section && doc.section.trim().length > 2);
  items.push({
    id: 'section',
    label: 'Бөлім бар',
    passed: hasSection,
    message: hasSection ? undefined : 'Бөлім атауы толтырылмаған'
  });
  if (!hasSection) missingElements.push('Бөлім атауы');

  // 2. Педагогтің Т.А.Ә. бар
  const hasTeacher = Boolean(doc.teacherName && doc.teacherName.trim().length > 2);
  items.push({
    id: 'teacherName',
    label: 'Педагогтің Т.А.Ә. бар',
    passed: hasTeacher,
    message: hasTeacher ? undefined : 'Педагогтің аты-жөні жазылмаған'
  });
  if (!hasTeacher) missingElements.push('Педагогтің Т.А.Ә.');

  // 3. Күні бар
  const hasDate = Boolean(doc.date && doc.date.trim().length > 0);
  items.push({
    id: 'date',
    label: 'Күні бар',
    passed: hasDate,
    message: hasDate ? undefined : 'Сабақ күні көрсетілмеген'
  });
  if (!hasDate) missingElements.push('Күні');

  // 4. Сынып бар
  const hasGrade = Boolean(doc.grade && doc.grade.trim().length > 0);
  items.push({
    id: 'grade',
    label: 'Сынып бар',
    passed: hasGrade,
    message: hasGrade ? undefined : 'Сынып көрсетілмеген'
  });
  if (!hasGrade) missingElements.push('Сынып');

  // 5. Қатысушылар саны бар
  const hasPresent = typeof doc.presentStudents === 'number' && doc.presentStudents > 0;
  items.push({
    id: 'presentStudents',
    label: 'Қатысушылар саны бар',
    passed: hasPresent,
    message: hasPresent ? undefined : 'Қатысушылар саны 0-ден көп болуы керек'
  });
  if (!hasPresent) missingElements.push('Қатысушылар саны');

  // 6. Қатыспағандар саны бар
  const hasAbsent = typeof doc.absentStudents === 'number' && doc.absentStudents >= 0;
  items.push({
    id: 'absentStudents',
    label: 'Қатыспағандар саны бар',
    passed: hasAbsent,
    message: hasAbsent ? undefined : 'Қатыспағандар саны көрсетілмеген'
  });
  if (!hasAbsent) missingElements.push('Қатыспағандар саны');

  // 7. Сабақтың тақырыбы бар
  const hasTopic = Boolean(doc.topic && doc.topic.trim().length > 2);
  items.push({
    id: 'topic',
    label: 'Сабақтың тақырыбы бар',
    passed: hasTopic,
    message: hasTopic ? undefined : 'Сабақтың тақырыбы бос'
  });
  if (!hasTopic) missingElements.push('Сабақтың тақырыбы');

  // 8. Оқу мақсаттары бар
  const hasLO = Boolean(doc.learningObjectives && doc.learningObjectives.trim().length > 4);
  items.push({
    id: 'learningObjectives',
    label: 'Оқу мақсаттары бар',
    passed: hasLO,
    message: hasLO ? undefined : 'Оқу бағдарламасына сәйкес оқыту мақсаты жазылмаған'
  });
  if (!hasLO) missingElements.push('Оқу бағдарламасына сәйкес оқыту мақсаттары');

  // 9. Сабақтың мақсаты бар
  const hasLessonObj = Boolean(doc.lessonObjectives && doc.lessonObjectives.trim().length > 6);
  items.push({
    id: 'lessonObjectives',
    label: 'Сабақтың мақсаты бар',
    passed: hasLessonObj,
    message: hasLessonObj ? undefined : 'Сабақтың нақты мақсаты толтырылмаған'
  });
  if (!hasLessonObj) missingElements.push('Сабақтың мақсаты');

  // 10. Сабақ барысы бар (кестеде жолдар бар ма)
  const hasStages = Boolean(doc.lessonStages && doc.lessonStages.length >= 2);
  items.push({
    id: 'lessonStages',
    label: 'Сабақ барысы бар',
    passed: hasStages,
    message: hasStages ? undefined : 'Сабақ барысы кестесінде кезеңдер жеткіліксіз'
  });
  if (!hasStages) missingElements.push('Сабақ барысы');

  // 11. Уақыттың жалпы сомасы дұрыс
  const totalMinutes = doc.lessonStages ? doc.lessonStages.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) : 0;
  const targetDuration = doc.lessonDuration || 45;
  const isTimeCorrect = totalMinutes === targetDuration;
  items.push({
    id: 'timeSum',
    label: `Уақыттың жалпы сомасы дұрыс (${totalMinutes}/${targetDuration} мин)`,
    passed: isTimeCorrect,
    message: isTimeCorrect ? undefined : `Кезеңдердің уақыт сомасы ${totalMinutes} мин. Ол жалпы сабақ ұзақтығына (${targetDuration} мин) тең болуы шарт.`
  });
  if (!isTimeCorrect) missingElements.push(`Уақыт сомасын сәйкестендіру (${totalMinutes} орнына ${targetDuration} мин)`);

  // 12. Педагог әрекеті нақты (жалпылама сөздер емес)
  const genericTeacherPhrases = ['сабақ өткізеді', 'тапсырма береді'];
  const teacherSpecific = Boolean(
    doc.lessonStages &&
    doc.lessonStages.length > 0 &&
    doc.lessonStages.every(s => s.teacherActivity && s.teacherActivity.trim().length >= 15) &&
    !doc.lessonStages.some(s => genericTeacherPhrases.includes(s.teacherActivity.trim().toLowerCase()))
  );
  items.push({
    id: 'teacherActivity',
    label: 'Педагог әрекеті нақты',
    passed: teacherSpecific,
    message: teacherSpecific ? undefined : 'Педагог әрекеті тым қысқа немесе нақты емес'
  });
  if (!teacherSpecific) missingElements.push('Педагогтің нақты әрекеттері');

  // 13. Оқушы әрекеті нақты («Оқушылар тапсырма орындайды» сияқты жалпылама емес)
  const genericStudentPhrases = ['оқушылар тапсырма орындайды', 'тапсырма орындайды', 'орындайды'];
  const studentSpecific = Boolean(
    doc.lessonStages &&
    doc.lessonStages.length > 0 &&
    doc.lessonStages.every(s => s.studentActivity && s.studentActivity.trim().length >= 15) &&
    !doc.lessonStages.some(s => genericStudentPhrases.includes(s.studentActivity.trim().toLowerCase()))
  );
  items.push({
    id: 'studentActivity',
    label: 'Оқушы әрекеті нақты',
    passed: studentSpecific,
    message: studentSpecific ? undefined : 'Оқушы әрекетінде нақты іс-қимыл мен әдіс-тәсіл көрсетілуі керек'
  });
  if (!studentSpecific) missingElements.push('Оқушының нақты әрекеттері');

  // 14. Бағалау көрсетілген
  const hasAssessment = Boolean(
    doc.lessonStages &&
    doc.lessonStages.every(s => s.assessment && s.assessment.trim().length >= 5)
  );
  items.push({
    id: 'assessment',
    label: 'Бағалау көрсетілген',
    passed: hasAssessment,
    message: hasAssessment ? undefined : 'Әр кезеңде қалыптастырушы бағалау/дескриптор көрсетілуі керек'
  });
  if (!hasAssessment) missingElements.push('Бағалау дескрипторлары');

  // 15. Ресурстар көрсетілген
  const hasResources = Boolean(
    doc.lessonStages &&
    doc.lessonStages.every(s => s.resources && s.resources.trim().length >= 3)
  );
  items.push({
    id: 'resources',
    label: 'Ресурстар көрсетілген',
    passed: hasResources,
    message: hasResources ? undefined : 'Оқулық, тақта немесе дидактикалық ресурстар көрсетілмеген'
  });
  if (!hasResources) missingElements.push('Ресурстар тізімі');

  // 16. Тапсырмалар оқу мақсатына сәйкес
  const tasksMatchLO = Boolean(
    hasLO &&
    doc.lessonStages &&
    doc.lessonStages.some(s => s.teacherActivity.length > 20 && s.studentActivity.length > 20)
  );
  items.push({
    id: 'tasksMatch',
    label: 'Тапсырмалар оқу мақсатына сәйкес',
    passed: tasksMatchLO,
    message: tasksMatchLO ? undefined : 'Сабақтағы тапсырмалар оқу мақсатына тікелей бағытталуы керек'
  });
  if (!tasksMatchLO) missingElements.push('Оқу мақсатына сәйкес тапсырмалар');

  const passedCount = items.filter(i => i.passed).length;
  const isComplete = passedCount === items.length;

  return {
    isComplete,
    scoreRatio: `${passedCount}/${items.length}`,
    items,
    missingElements
  };
}
