'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Edit2,
  FolderPlus,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { ApiError, apiClient } from '../../../lib/api-client';
import { AlertBanner } from '../../../components/ui/alert-banner';
import { cn } from '../../../lib/utils';
import type {
  TaxonomyResponse,
  TaxonomySubject,
  TaxonomyTopic,
  TaxonomySubtopic,
} from '../../../types/admin';

type DeletePrompt = {
  type: 'subjects' | 'topics' | 'subtopics';
  id: string;
  name: string;
  questionCount?: number;
};

export default function AdminTaxonomyPage() {
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded nodes state: { [id: string]: boolean }
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Creation modal state
  const [createModal, setCreateModal] = useState<{
    type: 'subject' | 'topic' | 'subtopic';
    parentId?: string;
    parentName?: string;
  } | null>(null);
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit/Rename modal state
  const [editModal, setEditModal] = useState<{
    type: 'subjects' | 'topics' | 'subtopics';
    id: string;
    currentName: string;
  } | null>(null);
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);

  // Delete confirmation modal state (including 409 ?force=true handling per §3.7)
  const [deletePrompt, setDeletePrompt] = useState<DeletePrompt | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTaxonomy = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getTaxonomy();
      setTaxonomy(data);
      // Auto-expand all subjects by default
      const exp: Record<string, boolean> = {};
      data.subjects?.forEach((s) => {
        exp[s.id] = true;
      });
      setExpanded(exp);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Could not load taxonomy.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTaxonomy();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Create Subject, Topic, or Subtopic
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createModal || !createName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      if (createModal.type === 'subject') {
        await apiClient.createSubject({ name: createName.trim() });
      } else if (createModal.type === 'topic' && createModal.parentId) {
        await apiClient.createTopic({
          subjectId: createModal.parentId,
          name: createName.trim(),
        });
      } else if (createModal.type === 'subtopic' && createModal.parentId) {
        await apiClient.createSubtopic({
          topicId: createModal.parentId,
          name: createName.trim(),
        });
      }
      setCreateModal(null);
      setCreateName('');
      await fetchTaxonomy();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to create taxonomy item.';
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  // Edit / Rename Item
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal || !editName.trim()) return;
    setEditing(true);
    setError(null);
    try {
      await apiClient.patchTaxonomy(editModal.type, editModal.id, {
        name: editName.trim(),
      });
      setEditModal(null);
      setEditName('');
      await fetchTaxonomy();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to update taxonomy item.';
      setError(msg);
    } finally {
      setEditing(false);
    }
  };

  // Attempt delete — handles 409 by prompting with question count
  const attemptDelete = async (
    type: 'subjects' | 'topics' | 'subtopics',
    id: string,
    name: string,
    force: boolean = false
  ) => {
    setDeleting(true);
    setError(null);
    try {
      await apiClient.deleteTaxonomy(type, id, force);
      setDeletePrompt(null);
      await fetchTaxonomy();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        // Backend returns 409 with questionCount per §3.7
        const count =
          typeof (err.data as { questionCount?: number })?.questionCount === 'number'
            ? (err.data as { questionCount?: number }).questionCount
            : undefined;
        setDeletePrompt({ type, id, name, questionCount: count });
      } else {
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to delete taxonomy item.';
        setError(msg);
        setDeletePrompt(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          type="error"
          title="Taxonomy Error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Taxonomy Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize subjects, topics, and subtopics for automated question classification and search.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchTaxonomy()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateModal({ type: 'subject' });
              setCreateName('');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-sm cursor-pointer"
            style={{
              background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Taxonomy Tree Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {loading && !taxonomy ? (
          <div className="flex flex-col items-center justify-center p-12 text-xs text-slate-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#305282]" />
            <span>Loading taxonomy hierarchy...</span>
          </div>
        ) : taxonomy?.subjects?.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            No subjects configured yet. Click &quot;Add Subject&quot; above to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {taxonomy?.subjects?.map((subj) => {
              const isSubjExpanded = expanded[subj.id] ?? true;

              return (
                <div
                  key={subj.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden"
                >
                  {/* Subject Row */}
                  <div className="flex items-center justify-between p-3.5 bg-white border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(subj.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {isSubjExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <span className="text-sm font-bold text-slate-900">{subj.name}</span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {subj.questionCount} {subj.questionCount === 1 ? 'question' : 'questions'}
                      </span>
                      {subj.unclassifiedCount > 0 && (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                          {subj.unclassifiedCount} unclassified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCreateModal({
                            type: 'topic',
                            parentId: subj.id,
                            parentName: subj.name,
                          });
                          setCreateName('');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-[#305282] hover:bg-blue-50 cursor-pointer"
                        title="Add Topic"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Topic</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditModal({
                            type: 'subjects',
                            id: subj.id,
                            currentName: subj.name,
                          });
                          setEditName(subj.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Rename Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => attemptDelete('subjects', subj.id, subj.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Topics List */}
                  {isSubjExpanded && (
                    <div className="p-3 pl-8 space-y-2">
                      {subj.topics.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-1">
                          No topics under this subject yet.
                        </p>
                      ) : (
                        subj.topics.map((top) => {
                          const isTopicExpanded = expanded[top.id] ?? false;

                          return (
                            <div
                              key={top.id}
                              className="rounded-lg border border-slate-200/80 bg-white overflow-hidden shadow-2xs"
                            >
                              {/* Topic Row */}
                              <div className="flex items-center justify-between px-3 py-2 bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleExpand(top.id)}
                                    className="p-0.5 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                                  >
                                    {isTopicExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <span className="text-xs font-bold text-slate-800">
                                    {top.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                                    {top.questionCount}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCreateModal({
                                        type: 'subtopic',
                                        parentId: top.id,
                                        parentName: top.name,
                                      });
                                      setCreateName('');
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-[#305282] hover:bg-blue-50 rounded cursor-pointer"
                                    title="Add Subtopic"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Subtopic</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditModal({
                                        type: 'topics',
                                        id: top.id,
                                        currentName: top.name,
                                      });
                                      setEditName(top.name);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => attemptDelete('topics', top.id, top.name)}
                                    className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Subtopics List */}
                              {isTopicExpanded && (
                                <div className="p-2.5 pl-6 space-y-1 bg-white">
                                  {top.subtopics.length === 0 ? (
                                    <p className="text-[11px] text-slate-400 italic py-0.5">
                                      No subtopics under this topic.
                                    </p>
                                  ) : (
                                    top.subtopics.map((subt) => (
                                      <div
                                        key={subt.id}
                                        className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-slate-50 text-xs"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                          <span className="font-medium text-slate-700">
                                            {subt.name}
                                          </span>
                                          <span className="text-[10px] text-slate-400">
                                            ({subt.questionCount})
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditModal({
                                                type: 'subtopics',
                                                id: subt.id,
                                                currentName: subt.name,
                                              });
                                              setEditName(subt.name);
                                            }}
                                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              attemptDelete('subtopics', subt.id, subt.name)
                                            }
                                            className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 cursor-pointer"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Other Subjects in Question Bank but not in Taxonomy per §3.6 */}
            {(taxonomy?.otherSubjects?.length ?? 0) > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2 mt-4">
                <h3 className="text-xs font-bold text-slate-700">Other Subjects in Bank</h3>
                <p className="text-[11px] text-slate-500">
                  These subjects contain approved questions but have no configured taxonomy topics yet.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {taxonomy?.otherSubjects?.map((os) => (
                    <span
                      key={os.name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs"
                    >
                      <span>{os.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        ({os.questionCount})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 capitalize">
                Add {createModal.type}
                {createModal.parentName ? ` to "${createModal.parentName}"` : ''}
              </h3>
              <button
                type="button"
                onClick={() => setCreateModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#305282]"
                  value={createName}
                  placeholder={`e.g. ${
                    createModal.type === 'subject'
                      ? 'Biology'
                      : createModal.type === 'topic'
                      ? 'Cell Structure'
                      : 'Mitochondria'
                  }`}
                  autoFocus
                  required
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setCreateModal(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !createName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl text-white shadow-sm"
                  style={{
                    background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
                  }}
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Rename Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Rename Item</h3>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  New Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#305282]"
                  value={editName}
                  autoFocus
                  required
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={editing}
                  onClick={() => setEditModal(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing || !editName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl text-white shadow-sm"
                  style={{
                    background: 'linear-gradient(45deg, #305282 0%, #98AFC7 50%, #E9ECEF 100%)',
                  }}
                >
                  {editing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (handles 409 Conflict with ?force=true per §3.7) */}
      {deletePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">
                Confirm Deletion of &quot;{deletePrompt.name}&quot;
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {deletePrompt.questionCount !== undefined
                ? `This entry has ${deletePrompt.questionCount} classified ${
                    deletePrompt.questionCount === 1 ? 'question' : 'questions'
                  }. Deleting it will leave those questions unclassified in the database. Are you sure you want to proceed?`
                : `Are you sure you want to delete "${deletePrompt.name}"? If questions are classified under this entry, they will be left unclassified.`}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletePrompt(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  attemptDelete(deletePrompt.type, deletePrompt.id, deletePrompt.name, true)
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Force Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

