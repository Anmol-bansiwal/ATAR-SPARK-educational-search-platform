import type { ExamQuestion } from '../types/question';

export interface QuestionPartItem {
  partLabel: string;
  question: ExamQuestion;
}

export interface GroupedQuestion {
  id: string;
  key: string;
  questionNumber: string | null;
  sourceDocument: string | null;
  hasMultipleParts: boolean;
  parts: QuestionPartItem[];
  allPartLabels: string;
  primary: ExamQuestion;
}

/**
 * Extracts normalized questionNumber (e.g. "28") and partLabel (e.g. "(a)")
 * from structured fields, or heuristically from title / questionText.
 */
export function extractQuestionPartsMeta(
  questionNumber?: number | string | null,
  partLabel?: string | null,
  questionText?: string,
  title?: string
): { questionNumber: string | null; partLabel: string | null } {
  let qNum = questionNumber ? String(questionNumber).replace(/^Q/i, '').trim() : null;
  let pLabel = partLabel ? partLabel.trim() : null;

  // 1. Try extracting from title (e.g. "Q28(a)", "Question 28 (a)", "Q14(b)(i)")
  if (title) {
    const titleMatch = title.match(/(?:Question|Q)\s*(\d+)\s*(?:\(?([a-zA-Z0-9ivx]+(?:\([a-zA-Z0-9ivx]+\))*)\)?)?/i);
    if (titleMatch) {
      if (!qNum && titleMatch[1]) qNum = titleMatch[1];
      if (!pLabel && titleMatch[2]) {
        pLabel = titleMatch[2].startsWith('(') ? titleMatch[2] : `(${titleMatch[2]})`;
      }
    }
  }

  // 2. Try extracting from questionText start (e.g. "**(a)**", "(a)", "Question 28 (b)")
  if (questionText) {
    if (!qNum) {
      const textQMatch = questionText.match(/^(?:(?:\*\*|#+)?\s*(?:Question|Q)\s*(\d+))/i);
      if (textQMatch) qNum = textQMatch[1];
    }
    if (!pLabel) {
      const textPartMatch = questionText.match(/^(?:(?:\*\*|#+)?\s*(?:\(([a-zA-Z0-9ivx]+(?:\([a-zA-Z0-9ivx]+\))*)\)|([a-zA-Z])\))\s*(?:\*\*)?)/);
      if (textPartMatch) {
        const raw = textPartMatch[1] || textPartMatch[2];
        if (raw) pLabel = `(${raw})`;
      }
    }
  }

  // Format partLabel with standard parentheses e.g. "a" -> "(a)"
  if (pLabel && !pLabel.startsWith('(')) {
    pLabel = `(${pLabel})`;
  }

  return { questionNumber: qNum, partLabel: pLabel };
}

/**
 * Splits a question text into its shared context stem and its specific sub-part prompt.
 * Used when rendering multi-part questions so the stem and diagram are not repeated.
 */
export function splitStemAndPart(
  text: string,
  partLabel: string
): { stem: string; partBody: string } {
  if (!text || !partLabel) return { stem: '', partBody: text };
  const cleanLabel = partLabel.replace(/[()]/g, '').trim();
  // Match patterns like "\n\n**(b)**", "\n\n(b)", "\n(b) "
  const regex = new RegExp(
    `(?:\\n+|^)(?:\\*\\*)?\\s*\\(?${cleanLabel}\\)?\\s*(?:\\*\\*)?\\s*`,
    'i'
  );
  const match = text.match(regex);
  if (!match || match.index === undefined || match.index === 0) {
    return { stem: '', partBody: text };
  }
  const stem = text.slice(0, match.index).trim();
  const partBody = text.slice(match.index).trim();
  return { stem, partBody };
}

/**
 * Groups a flat array of exam questions into structured groups by
 * matching sibling parts of the same (sourceDocument, questionNumber).
 */
export function groupQuestionsByParts(questions: ExamQuestion[]): GroupedQuestion[] {
  const groups: GroupedQuestion[] = [];
  const groupMap = new Map<string, GroupedQuestion>();

  for (const q of questions) {
    const meta = extractQuestionPartsMeta(q.questionNumber, q.partLabel, q.questionText);
    const docKey = (q.sourceDocument || 'unknown_doc').replace(/#.*$/, '').trim().toLowerCase();

    // Group only if we have a valid questionNumber and a sourceDocument
    if (meta.questionNumber && docKey !== 'unknown_doc') {
      const groupKey = `${docKey}:::q${meta.questionNumber}`;
      let group = groupMap.get(groupKey);

      const partItem: QuestionPartItem = {
        partLabel: meta.partLabel || '(main)',
        question: {
          ...q,
          questionNumber: meta.questionNumber,
          partLabel: meta.partLabel,
        },
      };

      if (group) {
        // Prevent duplicate parts with the same ID
        if (!group.parts.some((p) => p.question.id === q.id)) {
          group.parts.push(partItem);
          // Sort parts alphabetically: (a), (b), (c)...
          group.parts.sort((a, b) => a.partLabel.localeCompare(b.partLabel));
          group.hasMultipleParts = group.parts.length > 1;
          group.allPartLabels = group.parts
            .map((p) => p.partLabel.replace(/[()]/g, ''))
            .filter((l) => l !== 'main')
            .join(', ');
        }
      } else {
        group = {
          id: q.id,
          key: groupKey,
          questionNumber: meta.questionNumber,
          sourceDocument: q.sourceDocument || null,
          hasMultipleParts: false,
          parts: [partItem],
          allPartLabels: meta.partLabel ? meta.partLabel.replace(/[()]/g, '') : '',
          primary: q,
        };
        groupMap.set(groupKey, group);
        groups.push(group);
      }
    } else {
      // Standalone question without questionNumber or sourceDocument
      groups.push({
        id: q.id,
        key: `single:::${q.id}`,
        questionNumber: meta.questionNumber,
        sourceDocument: q.sourceDocument || null,
        hasMultipleParts: false,
        parts: [
          {
            partLabel: meta.partLabel || '(main)',
            question: q,
          },
        ],
        allPartLabels: meta.partLabel ? meta.partLabel.replace(/[()]/g, '') : '',
        primary: q,
      });
    }
  }

  return groups;
}

