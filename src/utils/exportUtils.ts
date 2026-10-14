import { QMJDocument } from '../types';

/**
 * Generates an MS Word-compliant HTML document (.doc) containing the official
 * Order No. 130 lesson plan document format.
 */
export function exportToWord(doc: QMJDocument): void {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Қысқа мерзімді сабақ жоспары - ${escapeHtml(doc.topic)}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 1.5cm 1.5cm 1.5cm 1.5cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.25;
          color: #000;
        }
        h2 {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .subtitle {
          text-align: center;
          font-size: 11pt;
          font-style: italic;
          margin-bottom: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          table-layout: fixed;
        }
        th, td {
          border: 1px solid #000;
          padding: 6px 8px;
          vertical-align: top;
          font-size: 11pt;
          word-wrap: break-word;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: center;
        }
        .meta-table td:first-child {
          font-weight: bold;
          width: 32%;
          background-color: #f9f9f9;
        }
        .footer-note {
          font-size: 9pt;
          font-style: italic;
          color: #444;
          margin-top: 14px;
          border-top: 1px solid #ccc;
          padding-top: 6px;
        }
      </style>
    </head>
    <body>
      ${doc.schoolName ? `<div style="text-align: center; font-weight: bold; margin-bottom: 8px;">${escapeHtml(doc.schoolName)}</div>` : ''}
      <h2>ҚЫСҚА МЕРЗІМДІ САБАҚ ЖОСПАРЫ (ҚМЖ)</h2>
      <div class="subtitle">ҚР Білім және ғылым министрінің 2020 жылғы 6 сәуірдегі №130 бұйрығының талаптарына сәйкес</div>

      <table class="meta-table">
        <tr>
          <td>Бөлім:</td>
          <td>${escapeHtml(doc.section || '-')}</td>
        </tr>
        <tr>
          <td>Педагогтің Т.А.Ә.:</td>
          <td>${escapeHtml(doc.teacherName || '-')}</td>
        </tr>
        <tr>
          <td>Күні:</td>
          <td>${escapeHtml(doc.date || '-')}</td>
        </tr>
        <tr>
          <td>Сынып:</td>
          <td>${escapeHtml(doc.grade || '-')} сынып &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Қатысушылар саны:</b> ${doc.presentStudents ?? '-'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Қатыспағандар саны:</b> ${doc.absentStudents ?? '0'}</td>
        </tr>
        <tr>
          <td>Пән:</td>
          <td>${escapeHtml(doc.subject || '-')}</td>
        </tr>
        <tr>
          <td>Сабақтың тақырыбы:</td>
          <td><b>${escapeHtml(doc.topic || '-')}</b></td>
        </tr>
        <tr>
          <td>Оқу бағдарламасына сәйкес оқыту мақсаттары:</td>
          <td>${formatParagraphs(doc.learningObjectives)}</td>
        </tr>
        <tr>
          <td>Сабақтың мақсаты:</td>
          <td>${formatParagraphs(doc.lessonObjectives)}</td>
        </tr>
      </table>

      <h3 style="font-size: 12pt; font-weight: bold; margin: 12px 0 6px 0;">Сабақтың барысы:</h3>

      <table>
        <thead>
          <tr>
            <th style="width: 16%;">Сабақтың кезеңі/уақыты</th>
            <th style="width: 30%;">Педагогтің әрекеті</th>
            <th style="width: 28%;">Оқушының әрекеті</th>
            <th style="width: 14%;">Бағалау</th>
            <th style="width: 12%;">Ресурстар</th>
          </tr>
        </thead>
        <tbody>
          ${doc.lessonStages.map(stage => `
            <tr>
              <td><b>${escapeHtml(stage.stageName)}</b></td>
              <td>${formatParagraphs(stage.teacherActivity)}</td>
              <td>${formatParagraphs(stage.studentActivity)}</td>
              <td>${formatParagraphs(stage.assessment)}</td>
              <td>${formatParagraphs(stage.resources)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer-note">
        * Ескерту: AI көмегімен жасалған ҚМЖ педагогтің кәсіби тексеруінен және қажет болған жағдайда түзетуінен кейін пайдалануға ұсынылады.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', content], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `QMJ_${(doc.subject || 'Sabak').replace(/\s+/g, '_')}_${(doc.grade || '').replace(/\s+/g, '')}_${(doc.topic || 'Zhospar').replace(/[^\wа-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ]/g, '_').slice(0, 30)}.doc`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyQMJToClipboard(doc: QMJDocument): Promise<boolean> {
  const text = `
ҚЫСҚА МЕРЗІМДІ САБАҚ ЖОСПАРЫ (ҚМЖ)
(№130 бұйрыққа сәйкес)

Бөлім: ${doc.section}
Педагогтің Т.А.Ә.: ${doc.teacherName}
Күні: ${doc.date}
Сынып: ${doc.grade} | Қатысушылар: ${doc.presentStudents} | Қатыспағандар: ${doc.absentStudents}
Пән: ${doc.subject}
Сабақтың тақырыбы: ${doc.topic}

Оқу бағдарламасына сәйкес оқыту мақсаттары:
${doc.learningObjectives}

Сабақтың мақсаты:
${doc.lessonObjectives}

--- САБАҚТЫҢ БАРЫСЫ ---

${doc.lessonStages.map((s, idx) => `
[${idx + 1}] ${s.stageName}
• Педагогтің әрекеті:
${s.teacherActivity}

• Оқушының әрекеті:
${s.studentActivity}

• Бағалау:
${s.assessment}

• Ресурстар:
${s.resources}
`).join('\n----------------------------------------\n')}

Ескерту: AI көмегімен жасалған ҚМЖ педагогтің кәсіби тексеруінен және қажет болған жағдайда түзетуінен кейін пайдалануға ұсынылады.
  `.trim();

  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatParagraphs(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p style="margin: 0 0 4px 0;">${escapeHtml(p)}</p>`)
    .join('');
}
