'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Edit3,
  Image as ImageIcon,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import type {
  AdminQuestion,
  Difficulty,
  QuestionPatch,
  QuestionType,
  TaxonomyResponse,
  TaxonomyTopic,
} from '../../types/admin';
import { ApiError, apiClient, resolvePaperAssetUrl } from '../../lib/api-client';
import { MarkdownMathRenderer } from '../math/markdown-math-renderer';
import { StatusBadge, DifficultyBadge } from '../ui/status-badge';
import { AlertBanner } from '../ui/alert-banner';
import { QuestionMathsEditor } from './question-maths-editor';
import { cn } from '../../lib/utils';

export function AdminQuestionList({
  items,
  emptyLabel = 'No questions found.',
  onItemUpdated,
  onItemDeleted,
  taxonomy,
}: {
  items: AdminQuestion[];
  emptyLabel?: string;
  onItemUpdated?: (updated: AdminQuestion) => void;
  onItemDeleted?: (id: string) => void;
  taxonomy?: TaxonomyResponse | null;
}) {
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-xs text-slate-500 shadow-sm">
        {emptyLabel}
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      await apiClient.deleteQuestion(id);
      setConfirmDeleteId(null);
      onItemDeleted?.(id);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to delete question.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <AlertBanner
          type="error"
          title="Operation Failed"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <ul className="space-y-4">
        {items.map((q) => {
          // Both `figures` array and `figureUrls` can be present
          const figureUrls: string[] =
            q.figureUrls && q.figureUrls.length > 0
              ? q.figureUrls
              : (q.figures || []).map((f) => f.url).filter(Boolean);

          const cleanPartLabel = q.partLabel
            ? q.partLabel.startsWith('(')
              ? q.partLabel
              : `(${q.partLabel})`
            : '';
          const titleLabel = q.questionNumber
            ? `Q${q.questionNumber}${cleanPartLabel}`
            : cleanPartLabel;

          return (
            <li
              key={q.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3.5 hover:border-slate-300 transition-colors"
            >
              {/* Top metadata badge bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                  <StatusBadge status={q.embeddingStatus} />
                  {titleLabel && (
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
                      {titleLabel}
                    </span>
                  )}
                  <span className="text-[#305282] font-bold">{q.subject}</span>
                  <span>·</span>
                  <span className="text-slate-800">{q.topic || 'Unclassified'}</span>
                  {q.subtopic && (
                    <>
                      <span>·</span>
                      <span className="text-slate-600">{q.subtopic}</span>
                    </>
                  )}
                  {q.examYear != null && (
                    <>
                      <span>·</span>
                      <span className="text-slate-500">{q.examYear}</span>
                    </>
                  )}
                  {q.difficulty && (
                    <>
                      <span>·</span>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </>
                  )}
                  {q.marks != null && (
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                    </span>
                  )}
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(q)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#305282]" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(q.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                    title="Delete question permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text formatted with Markdown + KaTeX */}
              <div className="text-xs text-slate-800 leading-relaxed overflow-x-auto">
                <MarkdownMathRenderer content={q.questionText} />
              </div>

              {/* Attached Figures / Diagrams */}
              {figureUrls.length > 0 && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <ImageIcon className="w-3.5 h-3.5 text-[#305282]" />
                    <span>Attached Diagrams ({figureUrls.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {figureUrls.map((url, figIdx) => (
                      <figure
                        key={`${url}-${figIdx}`}
                        className="border border-slate-200 rounded-lg bg-white p-1.5 shadow-2xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolvePaperAssetUrl(url)}
                          alt={`Figure ${figIdx + 1} for question`}
                          className="max-h-36 max-w-[280px] rounded object-contain bg-slate-50"
                          loading="lazy"
                        />
                        <figcaption className="text-[10px] text-slate-400 text-center pt-1">
                          Diagram #{figIdx + 1}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Document reference footer */}
              {(q.sourceDocument || q.pageReference) && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                  <span>
                    {q.sourceDocument
                      ? `Source: ${q.sourceDocument.split('#')[0]}`
                      : 'Source document available'}
                  </span>
                  {q.pageReference && <span>Page {q.pageReference}</span>}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Delete Question Permanently</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this question? It will be removed from the question bank,
              its search embeddings will be deleted, and its unshared diagrams will be cleaned up.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleDelete(confirmDeleteId)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal per §3.3 */}
      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          taxonomy={taxonomy}
          onClose={() => setEditingQuestion(null)}
          onSaved={(updated) => {
            setEditingQuestion(null);
            onItemUpdated?.(updated);
          }}
        />
      )}
    </div>
  );
}

function EditQuestionModal({
  question,
  taxonomy,
  onClose,
  onSaved,
}: {
  question: AdminQuestion;
  taxonomy?: TaxonomyResponse | null;
  onClose: () => void;
  onSaved: (updated: AdminQuestion) => void;
}) {
  const [text, setText] = useState(question.questionText);
  const [subject, setSubject] = useState(question.subject);
  const [topicId, setTopicId] = useState<string | null>(question.topicId);
  const [subtopicId, setSubtopicId] = useState<string | null>(question.subtopicId);
  const [difficulty, setDifficulty] = useState<Difficulty>(question.difficulty);
  const [questionType, setQuestionType] = useState<QuestionType>(question.questionType);
  const [marks, setMarks] = useState<number | null>(question.marks);
  const [examYear, setExamYear] = useState<number | null>(question.examYear);
  const [examType, setExamType] = useState<string>(question.examType || '');
  const [pageReference, setPageReference] = useState<string>(question.pageReference || '');
  const [questionNumber, setQuestionNumber] = useState<string>(question.questionNumber || '');
  const [partLabel, setPartLabel] = useState<string>(question.partLabel || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter topics for the active subject
  const currentSubjectObj = taxonomy?.subjects?.find(
    (s) => s.name.toLowerCase() === subject.toLowerCase()
  );
  const availableTopics: TaxonomyTopic[] = currentSubjectObj?.topics || [];
  const currentTopicObj = availableTopics.find((t) => t.id === topicId);
  const availableSubtopics = currentTopicObj?.subtopics || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Build patch with ONLY changed fields per §3.3
    const patch: QuestionPatch = {};
    if (text !== question.questionText) patch.questionText = text;
    if (subject !== question.subject) {
      patch.subject = subject;
      // Changing subject resets topic and subtopic per §3.3
      patch.topicId = topicId;
      patch.subtopicId = subtopicId;
    } else {
      if (topicId !== question.topicId) patch.topicId = topicId;
      if (subtopicId !== question.subtopicId) patch.subtopicId = subtopicId;
    }
    if (difficulty !== question.difficulty) patch.difficulty = difficulty;
    if (questionType !== question.questionType) patch.questionType = questionType;
    if (marks !== question.marks) patch.marks = marks;
    if (examYear !== question.examYear) patch.examYear = examYear;
    if (examType !== (question.examType || '')) patch.examType = examType;
    if (pageReference !== (question.pageReference || '')) patch.pageReference = pageReference;
    if (questionNumber !== (question.questionNumber || '')) patch.questionNumber = questionNumber;
    if (partLabel !== (question.partLabel || '')) patch.partLabel = partLabel;

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    try {
      const updated = await apiClient.patchQuestion(question.id, patch);
      onSaved(updated);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to update question.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#305282]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Edit Question</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <AlertBanner
            type="error"
            title="Update Error"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Subject
              </label>
              <select
                className={inputClass}
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setTopicId(null);
                  setSubtopicId(null);
                }}
              >
                {taxonomy?.subjects?.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Topic</label>
              <select
                className={inputClass}
                value={topicId || ''}
                onChange={(e) => {
                  setTopicId(e.target.value || null);
                  setSubtopicId(null);
                }}
              >
                <option value="">Unclassified</option>
                {availableTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subtopic</label>
              <select
                className={inputClass}
                value={subtopicId || ''}
                disabled={!topicId}
                onChange={(e) => setSubtopicId(e.target.value || null)}
              >
                <option value="">Unclassified</option>
                {availableSubtopics.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Marks</label>
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={marks ?? ''}
                onChange={(e) =>
                  setMarks(e.target.value === '' ? null : Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Difficulty
              </label>
              <select
                className={inputClass}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
              <select
                className={inputClass}
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              >
                <option value="MCQ">MCQ</option>
                <option value="SHORT">SHORT</option>
                <option value="LONG">LONG</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Question Number
              </label>
              <input
                className={inputClass}
                value={questionNumber}
                placeholder="e.g. 21"
                onChange={(e) => setQuestionNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Part Label
              </label>
              <input
                className={inputClass}
                value={partLabel}
                placeholder="e.g. (a)"
                onChange={(e) => setPartLabel(e.target.value)}
              />
            </div>
          </div>

          {/* Question Maths Editor with Format Maths button and live preview */}
          <QuestionMathsEditor
            value={text}
            onChange={setText}
          />

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !text.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-sm"
              style={{
                background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
              }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
