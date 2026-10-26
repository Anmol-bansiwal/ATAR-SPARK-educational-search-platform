'use client';

import React from 'react';
import { useQuestionFilters } from '../../hooks/use-questions';
import { AdminUploadForm } from '../../components/admin/upload-form';

export default function AdminUploadPage() {
  const { data: filters } = useQuestionFilters();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Upload exam paper
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Upload a complete exam paper PDF. Questions are read from the file;
          you only review and approve. Nothing is saved until you approve.
        </p>
        {typeof filters?.total === 'number' && (
          <p className="mt-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            Bank ready now · {filters.total} questions
            {filters.subjects?.length
              ? ` · ${filters.subjects.map((s) => s.value).join(', ')}`
              : ''}
          </p>
        )}
      </div>
      <AdminUploadForm />
    </div>
  );
}
