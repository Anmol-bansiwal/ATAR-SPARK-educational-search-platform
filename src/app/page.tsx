'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/layout/header';
import { LandingPageBackground } from '../components/layout/landing-page-background';
import { SearchBox } from '../components/search-box';
import { useQuestionFilters } from '../hooks/use-questions';
import type { SearchFilterState, DifficultyLevel } from '../types/question';
import { SUBJECTS } from '../types/question';

/**
 * Landing Page (/)
 */
export default function LandingPage() {
  const router = useRouter();

  const [filters, setFilters] = useState<SearchFilterState>({
    query: '',
    subject: 'All',
    timePeriod: 'All Years',
    difficulty: 'All',
    year: 'All',
  });


  // Dynamic filter options from GET /questions/filters via TanStack Query
  const { data: filtersData } = useQuestionFilters();

  // Prefer live GET /questions/filters; only fall back when the request has not returned yet.
  const subjectOptions: string[] = [
    'All',
    ...((filtersData?.subjects?.map((s) => s.value).filter(Boolean) as string[]) ?? [
      ...SUBJECTS,
    ]),
  ];
  const timePeriodOptions: string[] = [
    'All Years',
    ...((filtersData?.timePeriods?.map((t) => t.label).filter(Boolean) as string[]) ?? [
      'Last 3 Years',
      'Last 5 Years',
      'Last 10 Years',
    ]),
  ];
  const difficultyFromApi: DifficultyLevel[] =
    filtersData?.difficulties
      ?.map((d) => {
        const label = `${d.value.charAt(0)}${d.value.slice(1).toLowerCase()}`;
        if (label === 'Easy' || label === 'Medium' || label === 'Hard') return label;
        return null;
      })
      .filter((d): d is DifficultyLevel => d !== null) ?? [];
  const difficultyOptions: (DifficultyLevel | 'All')[] = [
    'All',
    ...(difficultyFromApi.length > 0
      ? difficultyFromApi
      : (['Easy', 'Medium', 'Hard'] as DifficultyLevel[])),
  ];
  const yearOptions: (number | 'All')[] = [
    'All',
    ...(filtersData?.years?.map((y) => y.value) ?? []),
  ];

  const handleSearchSubmit = () => {
    const trimmed = filters.query.trim();
    if (!trimmed) return;

    const paper =
      filters.subject !== 'All' ? `${filters.subject} exam paper` : 'Exam paper';

    const params = new URLSearchParams();
    params.set('q', trimmed);
    params.set('paper', paper);
    if (filters.subject !== 'All') params.set('subject', filters.subject);
    if (filters.timePeriod !== 'All Years') params.set('timePeriod', filters.timePeriod);
    if (filters.difficulty !== 'All') params.set('difficulty', filters.difficulty);
    if (filters.year !== 'All') params.set('year', String(filters.year));

    router.push(`/chat?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* Fluid Ambient Animated Background */}
      <LandingPageBackground />

      {/* Top Header */}
      <header className="relative z-20 w-full pt-4 px-6 md:px-12">
        <Header />
      </header>

      {/* =======================================================================
         MAIN HERO & SEARCH CONTENT
         - Spacing: space-y-4 sm:space-y-6 (vertical gap between text & search box)
         - Max width: max-w-[800px] (container boundary for hero section)
         ======================================================================= */}
      <main className="relative z-30 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-[800px] mx-auto text-center space-y-4 sm:space-y-6">

          {/* --- HERO TEXT BLOCK --- */}
          <div className="space-y-2 px-4 text-center">

            {/* 1. Main Heading ("Find the Right Exam Question with AI")
                - Font size: text-xl sm:text-2xl md:text-3xl lg:text-[36px]
                - Line height: leading-snug lg:leading-[42px]
                - Text color: text-[#0D0D0D]
                - Font weight: font-semibold (600) */}
            <h1
              className="text-center font-semibold text-[#0D0D0D] tracking-normal text-xl sm:text-2xl md:text-3xl lg:text-[43px] leading-snug lg:leading-[42px]"
              style={{
                fontFamily: "var(--font-instrument, 'Instrument Sans', sans-serif)",
                fontWeight: 600,
                letterSpacing: '0%',
              }}
            >
              Find the Right Exam <br className="hidden sm:inline" />
              Question with{' '}
              {/* "AI" Gradient text accent */}
              <span
                className="font-semibold text-transparent bg-clip-text select-none"
                style={{
                  background: 'linear-gradient(119.29deg, #A8C2F0 0.37%, #2665D9 99.63%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AI
              </span>
            </h1>

            {/* 2. Subtitle Description ("Search a curated, well-indexed archive...")
                - Font size: text-xs sm:text-[13px] md:text-[14px]
                - Max width: max-w-2xl
                - Text color: text-[#0D0D0D] */}
            <p
              className="text-center font-medium text-[#0D0D0D] max-w-2xl mx-auto text-xs sm:text-[13px] md:text-[12px] leading-snug sm:leading-relaxed"
              style={{
                fontFamily: "var(--font-instrument, 'Instrument Sans', sans-serif)",
                fontWeight: 500,
                letterSpacing: '0.01em',
              }}
            >
              Search a curated, well-indexed archive of examination questions across Mathematics,{' '}
              <br className="hidden md:inline" />
              Physics and Chemistry, by topic, year, difficulty or pattern of repetition.
            </p>
          </div>

          {/* 3. Search Box Component */}
          <SearchBox
            filters={filters}
            onFilterChange={setFilters}
            onSearchSubmit={handleSearchSubmit}
            subjectOptions={subjectOptions}
            timePeriodOptions={timePeriodOptions}
            difficultyOptions={difficultyOptions}
            yearOptions={yearOptions}
          />
        </div>
      </main>

      {/* Footer Disclaimer & Terms directly in landing page */}
      <footer className="relative z-10 w-full py-5 text-center text-xs text-[#333333]">
        <p>
          <span className="italic cursor-pointer hover:text-black">Our Terms</span> and{' '}
          <span className="italic cursor-pointer hover:text-black">Privacy Policy</span> in a new window apply. We are an AI and can make mistakes.
        </p>
      </footer>
    </div>
  );
}
