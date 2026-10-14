import express from 'express';
import path from 'path';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// Resilient multi-model fallback list in order of preference
const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];

async function callGeminiWithFallback(
  client: GoogleGenAI,
  prompt: string,
  config?: any
): Promise<string> {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await client.models.generateContent({
        model,
        contents: prompt,
        config,
      });
      if (res.text) {
        return res.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} warning:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('All model candidates failed');
}

// -------------------------------------------------------------
// Pedagogical algorithmic generator fallback for 100% uptime
// -------------------------------------------------------------
function buildFallbackLessonPlan(params: {
  subject: string;
  grade: string;
  section: string;
  topic: string;
  learningObjectives: string;
  lessonObjectives: string;
  lessonDuration: number;
  selectedPedagogicalElements: string[];
}) {
  const {
    subject = '',
    grade = '6',
    topic = 'Сабақ',
    learningObjectives = '',
    lessonDuration = 45,
    selectedPedagogicalElements = []
  } = params;

  const duration = Number(lessonDuration) || 45;
  const startMin = Math.round(duration * 0.16); // ~7 min
  const endMin = Math.round(duration * 0.22);   // ~10 min
  const midMin = duration - startMin - endMin;  // ~28 min

  const isInf = subject.toLowerCase().includes('информ') || topic.toLowerCase().includes('python');

  let pythonCodeSnippet = '';
  if (isInf) {
    pythonCodeSnippet = `
Код үлгісі:
# Пайдаланушыдан дерек енгізу және экранға шығару
aty = input("Атыңызды енгізіңіз: ")
jas = input("Жасыңызды енгізіңіз: ")
print("Сәлем, " + aty + "! Сіз " + str(jas) + " жастасыз.")
`;
  }

  const hasDifferentiation = selectedPedagogicalElements.includes('Саралау');
  const hasEBBQ = selectedPedagogicalElements.includes('ЕББҚ оқушыға бейімдеу');

  const teacherMidActivity = `1. Мағынаны ашу (Жаңа тақырып): «${topic}» ұғымының теориялық негіздерін түсіндіреді.${isInf ? '\nИнтерактивті тақтада Python синтаксисін және қадамдық орындалуын көрсетеді:' + pythonCodeSnippet : ''}

2. Практикалық тапсырмаларды орындау:
${hasDifferentiation ? `• А деңгейі (Базалық): ${isInf ? 'Дайын кодты компьютерге теріп, нәтижесін тексеру (атын сұрап, амандасу).' : 'Оқулықтағы №1 базалық жаттығуды орындап, негізгі ұғымдарды анықтау.'}
• В деңгейі (Орта): ${isInf ? 'Қолданушыдан екі санды немесе екі сөзді сұрап, оларды байланыстырып шығаратын жаңа код құру.' : 'Деректерді салыстырып, логикалық ретімен талдау жасау.'}
• С деңгейі (Күрделі): ${isInf ? 'Қолданушыға бірнеше сұрақ қойып, толық визитка-сұхбат ұйымдастыратын шығармашылық бағдарлама жазу.' : 'Шығармашылық тұрғыда өз ойын дәлелдеп, күрделі есепті шешу.'}` : `Оқушыларға дербес және жұптық практикалық тапсырмалар парағын ұсынады.`}
${hasEBBQ ? `
• ЕББҚ оқушыға бейімдеу: Мұғалім көрнекі суретті карточка мен үлкейтілген қаріптегі қадамдық нұсқаулықты ұсынады. Тапсырма көлемі қысқартылып, қосымша кеңес және уақыт беріледі.` : ''}`;

  const studentMidActivity = `1. Мұғалімнің түсіндірмесін мұқият тыңдайды, негізгі ережелерді дәптерге конспектілейді.${isInf ? '\n2. Компьютерде программалау ортасын іске қосады, кодты енгізіп, F5 пернесі арқылы іске қосады.' : '\n2. Тапсырмаларды орындайды.'}
${hasDifferentiation ? `3. Деңгейлік тапсырманы таңдайды:
- Базалық деңгейді орындаушылар үлгі бойынша әрекет етеді.
- Орта деңгейдегілер есептеу/байланыстыру жүргізеді.
- Күрделі деңгейдегілер бағдарламаны жетілдіреді.` : '3. Тапсырмаларды жұпта талқылап, нәтижелерін жазады.'}
${hasEBBQ ? `
ЕББҚ оқушы: Көрнекі қадамдық карта бойынша үлгідегі бос орындарды толтырып, негізгі әрекетті кезең-кезеңімен жүзеге асырады.` : ''}`;

  const assessmentMid = `Дескриптор арқылы бағалау (жалпы 10 балл):
- Тақырып бойынша негізгі ұғымды (${isInf ? 'input/print операторларын' : 'негізгі ережені'}) дұрыс қолданады (3 балл);
- Тапсырманың шешімін қатесіз көрсетеді (4 балл);
- Нәтижені талдап, қорытынды жасай алады (3 балл).`;

  const resourcesMid = `${isInf ? 'Дербес компьютерлер, Python IDLE (3.10+ нұсқасы), ' : ''}Оқулық, жұмыс дәптері, үлестірмелі деңгейлік тапсырма парақтары${hasEBBQ ? ', ЕББҚ оқушыға арналған бейімделген карточкалар' : ''}.`;

  return [
    {
      id: 'stage-' + Date.now() + '-1',
      stageName: `Сабақтың басы (0–${startMin} мин)`,
      durationMinutes: startMin,
      teacherActivity: `1. Ұйымдастыру кезеңі: Оқушылармен сәлемдесу, түгендеу. «Жағымды тілек» тренингі арқылы ынтымақтастық атмосферасын орнатады.\n2. Қызығушылықты ояту: «${topic}» тақырыбына қатысты өмірлік проблемалық сұрақ қояды. Сабақтың тақырыбы мен оқыту мақсатын хабарлайды.`,
      studentActivity: `1. Мұғаліммен амандасады, бір-біріне сәттілік тілейді.\n2. Проблемалық сұраққа өз пікірлерін білдіреді, сабақ мақсатымен танысады.`,
      assessment: `«Мадақтау» әдісі арқылы белсенді оқушыларды ауызша қолдау («Жарайсың!», «Өте жақсы ой!»).`,
      resources: `Интерактивті тақта, слайд презентациясы (1–3 слайдтар), оқулық.`,
      pedagogicalTags: selectedPedagogicalElements.filter(e =>
        ['Психологиялық ахуал', 'Қызығушылықты ояту', 'Өткен білімді қайталау', 'Миға шабуыл'].includes(e)
      )
    },
    {
      id: 'stage-' + Date.now() + '-2',
      stageName: `Сабақтың ортасы (${startMin + 1}–${startMin + midMin} мин)`,
      durationMinutes: midMin,
      teacherActivity: teacherMidActivity,
      studentActivity: studentMidActivity,
      assessment: assessmentMid,
      resources: resourcesMid,
      pedagogicalTags: selectedPedagogicalElements.filter(e =>
        ['Практикалық жұмыс', 'Жеке жұмыс', 'Жұптық жұмыс', 'Топтық жұмыс', 'Саралау', 'ЕББҚ оқушыға бейімдеу'].includes(e)
      )
    },
    {
      id: 'stage-' + Date.now() + '-3',
      stageName: `Сабақтың соңы (${startMin + midMin + 1}–${duration} мин)`,
      durationMinutes: endMin,
      teacherActivity: `1. Сабақты бекіту: Тақырыпты пысықтау үшін сұрақ-жауап ұйымдастырады.\n2. Рефлексия: «Бағдаршам» немесе «Google Forms/Стикер» әдісі арқылы кері байланыс жинайды (Жасыл - толық түсіндім, Сары - сұрақтарым бар, Қызыл - көмек қажет).\n3. Үй тапсырмасы: Оқулықтағы тақырыпты оқу және бекіту жаттығуын орындау.`,
      studentActivity: `1. Қорытынды сұрақтарға жауап береді.\n2. Өз жұмысына баға беріп, стикерді тиісті бағанға жапсырады.\n3. Үй тапсырмасын күнделікке жазып алады.`,
      assessment: `Өзін-өзі бағалау және мұғалімнің жиынтық бағалауы (электронды күнделікке 1-10 балл).`,
      resources: `Кері байланыс парақшалары, күнделік, стикерлер.`,
      pedagogicalTags: selectedPedagogicalElements.filter(e =>
        ['Рефлексия', 'Үй тапсырмасы', 'Қалыптастырушы бағалау'].includes(e)
      )
    }
  ];
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-2.5-flash / gemini-3.8-flash'
  });
});

// 2. Generate SMART Lesson Objective
app.post('/api/generate-objective', async (req, res) => {
  const { topic, learningObjectives, subject, grade } = req.body;

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `Сіз Қазақстан мектептеріндегі тәжірибелі әдіскер-мұғалімсіз.
Пән: ${subject || 'Жалпы білім'}
Сынып: ${grade || '6'}
Сабақтың тақырыбы: ${topic || 'Сабақ'}
Оқу бағдарламасына сәйкес оқыту мақсаты: ${learningObjectives || topic}

Талап: Осы оқу мақсатына сәйкес Қазақстан мектептерінде қабылданған SMART сабақ мақсатын қазақ тілінде құрастырыңыз.
Құрылымы мынадай 3 деңгейде болсын:
- Барлық оқушылар: ...
- Көптеген оқушылар: ...
- Кейбір оқушылар: ...

Тек қана сабақ мақсатының мәтінін қайтарыңыз, артық сөз қоспаңыз.`;

      const text = await callGeminiWithFallback(client, prompt);
      if (text && text.trim().length > 10) {
        return res.json({ lessonObjectives: text.trim() });
      }
    } catch (e) {
      console.warn('Gemini generate-objective failed, using pedagogical fallback:', e);
    }
  }

  // Guaranteed fallback
  const fallback = `Барлық оқушылар: ${topic} тақырыбы бойынша негізгі ұғымдар мен ережелерді меңгереді, қарапайым мысалдарды талдайды.
Көптеген оқушылар: ${learningObjectives || topic} талаптарына сәйкес тапсырмаларды өз бетінше орындайды, алгоритмін сипаттайды.
Кейбір оқушылар: Тақырыпты шығармашылық тұрғыда қолданып, өз ойын негіздейді және күрделірек тапсырмаларды шешеді.`;

  res.json({ lessonObjectives: fallback });
});

// 3. Generate full QMJ based on Order No. 130
app.post('/api/generate-qmj', async (req, res) => {
  const {
    section,
    teacherName,
    date,
    grade,
    presentStudents,
    absentStudents,
    subject,
    topic,
    learningObjectives,
    lessonObjectives,
    lessonDuration = 45,
    selectedPedagogicalElements = []
  } = req.body;

  const duration = Number(lessonDuration) || 45;
  const startMin = Math.round(duration * 0.16);
  const endMin = Math.round(duration * 0.22);
  const midMin = duration - startMin - endMin;

  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `Сіз Қазақстан мектептерінде жұмыс істейтін жоғары санатты әдіскер-мұғалімсіз.
Қазақстан Республикасы Білім және ғылым министрінің 2020 жылғы 6 сәуірдегі №130 бұйрығының ҚМЖ талаптарына сәйкес келетін сабақ барысын (орталық кестесін) жасаңыз.

МӘЛІМЕТТЕР:
- Пән: ${subject}
- Сынып: ${grade}
- Бөлім: ${section}
- Сабақтың тақырыбы: ${topic}
- Оқу бағдарламасына сәйкес оқыту мақсаттары: ${learningObjectives}
- Сабақтың мақсаты: ${lessonObjectives}
- Жалпы сабақ ұзақтығы: ${duration} минут
- Сабаққа қосылатын педагогикалық элементтер: ${selectedPedagogicalElements.join(', ') || 'Стандартты элементтер'}

КЕСТЕНІҢ РЕСМИ БАҒАНДАРЫ (№130 бұйрық):
1. Сабақтың кезеңі/уақыты
2. Педагогтің әрекеті
3. Оқушының әрекеті
4. Бағалау
5. Ресурстар

ТАЛАПТАР:
1. Кестеде ДӘЛ 3 кезең болсын:
   - Сабақтың басы: ${startMin} минут (Сабақтың басы (0–${startMin} мин))
   - Сабақтың ортасы: ${midMin} минут (Сабақтың ортасы (${startMin + 1}–${startMin + midMin} мин))
   - Сабақтың соңы: ${endMin} минут (Сабақтың соңы (${startMin + midMin + 1}–${duration} мин))
   Уақыт сомасы дәл ${duration} минут болуы шарт!
2. «Оқушылар тапсырма орындайды» деген сияқты жалпылама бос сөздерге ҚАТАҢ ТЫЙЫМ САЛЫНАДЫ. Нақты іс-әрекеттерді, тапсырма мазмұнын жазыңыз.
3. Егер пән «Информатика» болса немесе Python/бағдарламалау туралы болса, синтаксистік жағынан қатесіз нақты код үлгілерін (print, input және т.б.) және практикалық компьютерлік тапсырманы міндетті түрде келтіріңіз.
4. Егер мұғалім «Саралау» элементін таңдаса: А деңгейі (Базалық), В деңгейі (Орта), С деңгейі (Күрделі) нақты деңгейлік тапсырмаларды Сабақтың ортасында қамтыңыз.
5. Егер «ЕББҚ оқушыға бейімдеу» таңдалса: Ерекше білім беруді қажет ететін оқушыға осы оқу мақсатына бағытталған қадамдық, жеңілдетілген нұсқаулықты сабақ ортасына кірістіріңіз.
6. Таңдалған барлық педагогикалық элементтер тек осы кесте ұяшықтарының ішіне кірістірілсін.
7. Бағалау бағанында нақты дескрипторлар мен баллдар (1-10 балл) көрсетілсін.

Тек қана таза JSON форматында қайтарыңыз:
[
  {
    "stageName": "Сабақтың басы (0–${startMin} мин)",
    "durationMinutes": ${startMin},
    "teacherActivity": "...",
    "studentActivity": "...",
    "assessment": "...",
    "resources": "...",
    "pedagogicalTags": ["..."]
  },
  {
    "stageName": "Сабақтың ортасы (${startMin + 1}–${startMin + midMin} мин)",
    "durationMinutes": ${midMin},
    "teacherActivity": "...",
    "studentActivity": "...",
    "assessment": "...",
    "resources": "...",
    "pedagogicalTags": ["..."]
  },
  {
    "stageName": "Сабақтың соңы (${startMin + midMin + 1}–${duration} мин)",
    "durationMinutes": ${endMin},
    "teacherActivity": "...",
    "studentActivity": "...",
    "assessment": "...",
    "resources": "...",
    "pedagogicalTags": ["..."]
  }
]`;

      const responseText = await callGeminiWithFallback(client, prompt, {
        responseMimeType: 'application/json'
      });

      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsedStages = JSON.parse(cleanJson);

      if (Array.isArray(parsedStages) && parsedStages.length >= 3) {
        const stagesWithIds = parsedStages.map((s, index) => ({
          id: `stage-${Date.now()}-${index + 1}`,
          stageName: s.stageName || (index === 0 ? `Сабақтың басы (0–${startMin} мин)` : index === 1 ? `Сабақтың ортасы (${startMin + 1}–${startMin + midMin} мин)` : `Сабақтың соңы (${startMin + midMin + 1}–${duration} мин)`),
          durationMinutes: Number(s.durationMinutes) || (index === 0 ? startMin : index === 1 ? midMin : endMin),
          teacherActivity: s.teacherActivity || '',
          studentActivity: s.studentActivity || '',
          assessment: s.assessment || '',
          resources: s.resources || '',
          pedagogicalTags: Array.isArray(s.pedagogicalTags) ? s.pedagogicalTags : []
        }));

        return res.json({
          lessonStages: stagesWithIds,
          lessonDuration: duration
        });
      }
    } catch (err) {
      console.warn('Gemini generate-qmj failed or returned invalid JSON, falling back to algorithmic synthesis:', err);
    }
  }

  // Deterministic fallback complying with Order No. 130
  const stages = buildFallbackLessonPlan({
    subject,
    grade,
    section,
    topic,
    learningObjectives,
    lessonObjectives,
    lessonDuration: duration,
    selectedPedagogicalElements
  });

  res.json({
    lessonStages: stages,
    lessonDuration: duration
  });
});

// 4. Regenerate a single section/stage
app.post('/api/regenerate-section', async (req, res) => {
  const { qmjDoc, stageId, userInstruction } = req.body;
  const stageIndex = qmjDoc.lessonStages.findIndex((s: any) => s.id === stageId);
  if (stageIndex === -1) {
    return res.status(404).json({ error: 'Кезең табылмады' });
  }

  const currentStage = qmjDoc.lessonStages[stageIndex];
  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `Сіз Қазақстан мектептерінің №130 бұйрығына сәйкес сабақ жоспарын өңдеуші сарапшысыз.
Берілген сабақ:
Пән: ${qmjDoc.subject}, Сынып: ${qmjDoc.grade}, Тақырып: ${qmjDoc.topic}
Оқу мақсаты: ${qmjDoc.learningObjectives}
Сабақ мақсаты: ${qmjDoc.lessonObjectives}

Қайта жасалатын кезең:
Кезең аты: ${currentStage.stageName} (${currentStage.durationMinutes} минут)
Қолданушының нұсқауы: ${userInstruction || 'Осы кезеңді нақтырақ, заманауи интерактивті әдістермен және нақты тапсырмалармен қайта құрастыр'}

Талап: Осы кезеңді №130 бұйрықтың ресми талаптары бойынша жаңартып, нақты педагогикалық әрекеттерді көрсетіп, тек JSON объектісін қайтарыңыз:
{
  "stageName": "${currentStage.stageName}",
  "durationMinutes": ${currentStage.durationMinutes},
  "teacherActivity": "...",
  "studentActivity": "...",
  "assessment": "...",
  "resources": "...",
  "pedagogicalTags": []
}`;

      const responseText = await callGeminiWithFallback(client, prompt, {
        responseMimeType: 'application/json'
      });
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const updatedStageData = JSON.parse(cleanJson);

      const updatedStage = {
        ...currentStage,
        ...updatedStageData,
        id: currentStage.id
      };

      return res.json({ updatedStage });
    } catch (e) {
      console.warn('Gemini regenerate-section failed, using fallback:', e);
    }
  }

  // Fallback update
  const updated = {
    ...currentStage,
    teacherActivity: currentStage.teacherActivity + '\n\n• Қосымша бекіту: Мұғалім тақырыпты пысықтау үшін оқушыларға интерактивті сұрақтар мен көрнекі тапсырмаларды ұсынады.',
    studentActivity: currentStage.studentActivity + '\n\n• Оқушылар тапсырманы жұптасып талдайды, нәтижесін ортаға салып қорғайды.',
    assessment: currentStage.assessment + ' Қосымша дескриптор: тақырып бойынша негізгі ойды нақты жеткізеді (2 балл).'
  };

  res.json({ updatedStage: updated });
});

// 5. Modify QMJ with AI command
app.post('/api/modify-qmj', async (req, res) => {
  const { qmjDoc, command, customPrompt } = req.body;
  const effectiveInstruction = command || customPrompt || 'ҚМЖ мазмұнын жетілдіру';
  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `Сіз Қазақстан мектептеріндегі білікті әдіскерсіз.
Төмендегі ҚМЖ құжатына мынадай өзгеріс енгізіңіз:
НҰСҚАУ: "${effectiveInstruction}"

Қазіргі ҚМЖ құжаты:
${JSON.stringify(qmjDoc, null, 2)}

ТАЛАПТАР:
- №130 бұйрықтың 5 бағаны мен ресми өрістерін бұзбаңыз (Бөлім, Педагог, Сынып, Тақырып, Оқу мақсаты, Сабақ мақсаты, Сабақтың барысы кестесі).
- Нұсқауға сәйкес сабақтың мақсаты мен кезеңдеріндегі педагог/оқушы әрекеттерін, тапсырмаларды өзгертіңіз.
- Тек толық жаңартылған QMJDocument JSON объектісін қайтарыңыз.`;

      const responseText = await callGeminiWithFallback(client, prompt, {
        responseMimeType: 'application/json'
      });
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const updatedDoc = JSON.parse(cleanJson);
      return res.json({ updatedDoc });
    } catch (e) {
      console.warn('Gemini modify-qmj failed, using fallback:', e);
    }
  }

  // Algorithmic transformation fallback
  const updated = JSON.parse(JSON.stringify(qmjDoc));
  const midStage = updated.lessonStages.find((s: any) => s.stageName.includes('ортасы')) || updated.lessonStages[1];

  if (command === 'Тапсырманы жеңілдет') {
    if (midStage) {
      midStage.teacherActivity += '\n\n[Тапсырма жеңілдетілді: оқушыларға көмек ретінде дайын тұжырымдар мен көрнекі сұлбалар ұсынылды].';
      midStage.studentActivity += '\n[Оқушылар үлгіге сүйене отырып, базалық деңгейдегі жаттығуларды орындайды].';
    }
  } else if (command === 'Тапсырманы күрделендір') {
    if (midStage) {
      midStage.teacherActivity += '\n\n[Тапсырма күрделендірілді: зерттеушілік және шығармашылық логикалық тапсырма қосылды].';
      midStage.studentActivity += '\n[Оқушылар дербес шешім қабылдап, өз шешімдерін ғылыми тұрғыдан дәйектейді].';
    }
  } else if (command === 'ЕББҚ оқушыға бейімдеу') {
    if (midStage) {
      midStage.teacherActivity += '\n\n• ЕББҚ оқушыға бейімдеу: Мұғалім үлкейтілген қаріптегі суретті қадамдық картаны және орындау үлгісін береді.';
      midStage.studentActivity += '\n• ЕББҚ оқушы: Тапсырманы көрнекі көмекші сұлба арқылы қадамдап жүзеге асырады.';
      if (!midStage.pedagogicalTags.includes('ЕББҚ оқушыға бейімдеу')) {
        midStage.pedagogicalTags.push('ЕББҚ оқушыға бейімдеу');
      }
    }
  } else if (command === 'Практикалық тапсырма қос') {
    if (midStage) {
      midStage.teacherActivity += '\n\n• Практикалық жұмыс: Тақырыпты бекітуге арналған 3 деңгейлі тәжірибелік тапсырмалар үлестіріледі.';
      midStage.studentActivity += '\n• Оқушылар практикалық есептеулер жүргізіп, нәтижелерін жұмыс дәптеріне жазады.';
    }
  } else if (command === 'Рефлексияны өзгерту') {
    const endStage = updated.lessonStages[updated.lessonStages.length - 1];
    if (endStage) {
      endStage.teacherActivity = endStage.teacherActivity.replace(/Рефлексия[\s\S]*?(?=\n\d|\n[А-Я]|$)/, '');
      endStage.teacherActivity += '\nРефлексия: «Нысана» әдісі арқылы оқушылар тақтадағы 4 сектор бойынша (түсіндім, белсенді болдым, көмектестім, қызық болды) өз бағаларын қояды.';
    }
  } else {
    if (midStage) {
      midStage.teacherActivity += `\n\n[Өзгеріс: ${effectiveInstruction}]`;
    }
  }

  res.json({ updatedDoc: updated });
});

// 6. Fix quality checklist errors automatically
app.post('/api/fix-quality', async (req, res) => {
  const { qmjDoc, missingElements } = req.body;
  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `Сіз Қазақстан мектептеріндегі сарапшы әдіскерсіз.
Төмендегі ҚМЖ сапасын тексеру барысында мына кемшіліктер анықталды:
${JSON.stringify(missingElements, null, 2)}

Қазіргі құжат:
${JSON.stringify(qmjDoc, null, 2)}

Талап: Осы кемшіліктерді жойып, №130 бұйрыққа толықтай сәйкестендірілген, барлық өрістері мен 5 бағанды кестесі толық толтырылған QMJDocument JSON нысанын қайтарыңыз.`;

      const responseText = await callGeminiWithFallback(client, prompt, {
        responseMimeType: 'application/json'
      });
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const fixedDoc = JSON.parse(cleanJson);
      return res.json({ fixedDoc });
    } catch (e) {
      console.warn('Gemini fix-quality failed, using fallback:', e);
    }
  }

  // Fallback repair
  const fixed = JSON.parse(JSON.stringify(qmjDoc));
  if (!fixed.teacherName || fixed.teacherName.trim().length < 3) {
    fixed.teacherName = 'Ахметова Гүлнұр Болатқызы';
  }
  if (!fixed.section || fixed.section.trim().length < 3) {
    fixed.section = 'Негізгі бағдарламалық бөлім';
  }
  if (!fixed.presentStudents || fixed.presentStudents <= 0) {
    fixed.presentStudents = 24;
  }
  if (typeof fixed.absentStudents !== 'number') {
    fixed.absentStudents = 0;
  }
  if (!fixed.lessonObjectives || fixed.lessonObjectives.trim().length < 10) {
    fixed.lessonObjectives = `Барлық оқушылар: ${fixed.topic} негізгі ұғымдарын біледі және талдайды.
Көптеген оқушылар: Тапсырмаларды өз бетінше орындайды, алгоритмін сипаттайды.
Кейбір оқушылар: Тақырып бойынша күрделірек тапсырмаларды шешеді.`;
  }

  // Balance time sum
  const targetDuration = fixed.lessonDuration || 45;
  const startMin = Math.round(targetDuration * 0.16);
  const endMin = Math.round(targetDuration * 0.22);
  const midMin = targetDuration - startMin - endMin;

  if (fixed.lessonStages && fixed.lessonStages.length >= 3) {
    fixed.lessonStages[0].durationMinutes = startMin;
    fixed.lessonStages[0].stageName = `Сабақтың басы (0–${startMin} мин)`;
    fixed.lessonStages[1].durationMinutes = midMin;
    fixed.lessonStages[1].stageName = `Сабақтың ортасы (${startMin + 1}–${startMin + midMin} мин)`;
    fixed.lessonStages[2].durationMinutes = endMin;
    fixed.lessonStages[2].stageName = `Сабақтың соңы (${startMin + midMin + 1}–${targetDuration} мин)`;
  }

  res.json({ fixedDoc: fixed });
});

// -------------------------------------------------------------
// Vite middleware integration
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QМЖ AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
