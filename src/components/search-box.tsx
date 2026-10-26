'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, Plus, ChevronDown, Check, Paperclip, X } from 'lucide-react';
import type { SearchFilterState, DifficultyLevel } from '../types/question';
import { Toast, type ToastType } from './toast';

export interface SearchBoxProps {
  filters?: SearchFilterState;
  onFilterChange?: (filters: SearchFilterState) => void;
  onSearchSubmit?: () => void;
  onFileUpload?: (file: File) => void;
  onFilesChange?: (files: File[]) => void;
  className?: string;
  maxFiles?: number;
  variant?: 'default' | 'pill';

  // Optional filter options passed using props (from GET /questions/filters)
  subjectOptions?: string[];
  timePeriodOptions?: string[];
  difficultyOptions?: (DifficultyLevel | 'All')[];
  yearOptions?: (number | 'All')[];

  // Optional visibility controls
  showSubject?: boolean;
  showTimePeriod?: boolean;
  showDifficulty?: boolean;
  showYear?: boolean;
}

const DEFAULT_FILTERS: SearchFilterState = {
  query: '',
  subject: 'All',
  timePeriod: 'All Years',
  difficulty: 'All',
  year: 'All',
};

const DEFAULT_SUBJECT_OPTIONS: string[] = ['All', 'Mathematics', 'Physics', 'Chemistry'];
const DEFAULT_TIME_PERIOD_OPTIONS: string[] = ['All Years', 'Last 3 Years', 'Last 5 Years', 'Last 10 Years'];
const DEFAULT_DIFFICULTY_OPTIONS: (DifficultyLevel | 'All')[] = ['All', 'Easy', 'Medium', 'Hard'];
const DEFAULT_YEAR_OPTIONS: (number | 'All')[] = ['All'];

/**
 * SearchBox Component
 *
 * Reusable Search Card with:
 * - 6px animated linear gradient border (#2665D9 -> #7DA3E8 -> #173D82)
 * - Custom options passed via props for Subject, Time Period, Difficulty, Year
 * - Scrollable dropdowns with elevated z-index (z-[999])
 * - Voice search, file/photo attachments (max 5), and optional filter pills
 * - UI-consistent Toast notifications instead of browser alerts
 */
export const SearchBox: React.FC<SearchBoxProps> = ({
  filters = DEFAULT_FILTERS,
  onFilterChange,
  onSearchSubmit,
  onFileUpload,
  onFilesChange,
  className = '',
  maxFiles = 5,
  subjectOptions,
  timePeriodOptions,
  difficultyOptions,
  yearOptions,
  showSubject,
  showTimePeriod,
  showDifficulty,
  showYear,
  variant,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'subject' | 'timePeriod' | 'difficulty' | 'year' | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<{ message: string; type?: ToastType } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3500);
  };

  const handleDismissToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  };

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Resolve filter options (props take precedence; fall back to standard defaults)
  const resolvedSubjectOptions = subjectOptions ?? DEFAULT_SUBJECT_OPTIONS;
  const resolvedTimePeriodOptions = timePeriodOptions ?? DEFAULT_TIME_PERIOD_OPTIONS;
  const resolvedDifficultyOptions = difficultyOptions ?? DEFAULT_DIFFICULTY_OPTIONS;
  const resolvedYearOptions = yearOptions ?? DEFAULT_YEAR_OPTIONS;

  // Visibility: optional and configurable
  const isSubjectVisible = showSubject !== undefined ? showSubject : (subjectOptions !== undefined ? subjectOptions.length > 0 : true);
  const isTimePeriodVisible = showTimePeriod !== undefined ? showTimePeriod : (timePeriodOptions !== undefined ? timePeriodOptions.length > 0 : true);
  const isDifficultyVisible = showDifficulty !== undefined ? showDifficulty : (difficultyOptions !== undefined ? difficultyOptions.length > 0 : true);
  const isYearVisible = showYear !== undefined ? showYear : (yearOptions !== undefined ? yearOptions.length > 0 : true);

  const hasAnyFilters = isSubjectVisible || isTimePeriodVisible || isDifficultyVisible || isYearVisible;
  const isPill = variant === 'pill' || !hasAnyFilters;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = (updated: SearchFilterState) => {
    if (onFilterChange) {
      onFilterChange(updated);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onSearchSubmit) onSearchSubmit();
      setActiveDropdown(null);
    }
  };

  const handlePlusClick = () => {
    // EduSearch student API does not accept file parts on /api/chat
    showToast('File attachments are not supported yet.', 'info');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const remainingSlots = maxFiles - attachedFiles.length;
    if (remainingSlots <= 0) {
      showToast(`Maximum of ${maxFiles} files reached.`, 'warning');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const updated = [...attachedFiles, ...filesToAdd];
    setAttachedFiles(updated);

    if (selectedFiles.length > remainingSlots) {
      showToast(`Maximum of ${maxFiles} files allowed. Attached the first ${filesToAdd.length} file(s).`, 'info');
    }

    if (onFileUpload) {
      filesToAdd.forEach((f) => onFileUpload(f));
    }
    if (onFilesChange) {
      onFilesChange(updated);
    }

    // Reset input so user can add more files later
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updated = attachedFiles.filter((_, idx) => idx !== indexToRemove);
    setAttachedFiles(updated);
    if (onFilesChange) {
      onFilesChange(updated);
    }
  };

  const recognitionRef = useRef<any>(null);

  const handleSpeechRecognition = () => {
    // If currently listening, clicking again stops it
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (!win) return;

    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      showToast('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.', 'info');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          handleUpdate({ ...filters, query: transcript });
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={handleDismissToast}
        />
      )}

      {/* =========================================================================
         1. SEARCH BOX OUTER CONTAINER
         - In pill mode (chat): compact floating white pill (max-w-[500px], rounded-full, soft shadow)
         - In default mode (landing): large card with gradient border and filters
         ========================================================================= */}
      <div
        ref={dropdownRef}
        className={
          isPill
            ? `relative z-20 mx-auto w-full max-w-[525px] rounded-full p-1.5 pl-3 border-[2.5px] border-transparent box-border shadow-[0_4px_16px_rgba(38,101,217,0.14)] animate-border-flow transition-all focus-within:shadow-[0_8px_24px_rgba(38,101,217,0.22)] ${className}`
            : `relative ${activeDropdown ? 'z-[100]' : 'z-20'} mx-auto w-full max-w-[750px] md:min-h-[130px] p-5 sm:p-6 md:py-4.5 rounded-[29px] flex flex-col justify-between gap-4 sm:gap-5 border-[3.5px] border-transparent box-border shadow-[0_10px_30px_rgba(38,101,217,0.14)] animate-border-flow transition-all focus-within:shadow-[0_14px_36px_rgba(38,101,217,0.24)] ${className}`
        }
        style={{
          background:
            'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #2665D9 0%, #7DA3E8 35%, #173D82 70%, #2665D9 100%) border-box',
        }}
      >
        {/* Hidden File Input for Paper / Photos / PDF Upload (Max 5) */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* =======================================================================
         2. ATTACHED FILE BADGES (Shown when files/photos are selected, max 5)
         ======================================================================= */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full pt-0.5 pb-1">
            {attachedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 max-w-[200px]"
              >
                <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate font-medium text-[11px] sm:text-xs" title={file.name}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="text-blue-500 hover:text-blue-800 ml-0.5 p-0.5 rounded hover:bg-blue-100 cursor-pointer shrink-0"
                  title="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* =======================================================================
         3. TOP INPUT ROW (Plus button + Text Input + Mic + Search Button)
         ======================================================================= */}
        <div className={`flex items-center w-full ${isPill ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-3'}`}>

          {/* --- A. Upload / Plus (+) Button --- */}
          <button
            type="button"
            disabled
            onClick={handlePlusClick}
            title={
              attachedFiles.length >= maxFiles
                ? `Maximum ${maxFiles} files reached`
                : `Attach files or photos (up to ${maxFiles})`
            }
            className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-[42px] sm:h-[42px] rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors shrink-0 ${attachedFiles.length >= maxFiles
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#EBEBEB] hover:bg-[#E0E0E0] text-[#0D0D0D] cursor-pointer'
              }`}
          >
            <Plus className={isPill ? 'w-4 h-4 text-slate-400' : 'w-4 h-4 sm:w-[18px] sm:h-[18px]'} />
          </button>

          {/* --- B. Search Query Input Field --- */}
          <input
            type="text"
            value={filters.query}
            onChange={(e) => handleUpdate({ ...filters, query: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Search question, topics, concepts..."
            className={`min-w-0 flex-1 bg-transparent py-1 text-slate-800 placeholder-[#757575] focus:outline-none font-normal ${isPill ? 'px-2 text-xs sm:text-sm' : 'px-1.5 text-sm sm:text-base'
              }`}
          />

          {/* --- C & D. Right Actions: Microphone & Search Button --- */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* C. Microphone / Voice Search Button */}
            <button
              type="button"
              onClick={handleSpeechRecognition}
              title={isListening ? 'Stop listening' : 'Start voice search'}
              className={`p-1 sm:p-1.5 rounded-full transition-colors cursor-pointer flex items-center justify-center ${isListening
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400 animate-pulse'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                }`}
              aria-label={isListening ? 'Stop recording voice' : 'Search by voice'}
            >
              <Mic className={isPill ? 'w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700' : 'w-[22px] h-[22px] text-slate-900'} strokeWidth={1.8} />
            </button>

            {/* D. Search CTA Button */}
            <button
              type="button"
              onClick={onSearchSubmit}
              style={{
                background: 'linear-gradient(180deg, #51A1E1 0%, #2665D9 100%)',
                ...(isPill
                  ? {}
                  : {
                    width: '108px',
                    height: '44px',
                  }),
              }}
              className={`flex items-center justify-center gap-1.5 rounded-full text-white font-medium shadow-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shrink-0 ${isPill
                  ? 'px-3.5 sm:px-4 h-[34px] sm:h-[36px] text-xs sm:text-[13px]'
                  : 'gap-2 text-sm'
                }`}
            >
              <Search className={isPill ? 'w-3.5 h-3.5 text-white shrink-0' : 'w-[18px] h-[18px] text-white shrink-0'} strokeWidth={2.2} />
              <span className="font-['Instrument_Sans'] select-none">
                Search
              </span>
            </button>
          </div>
        </div>

        {/* =======================================================================
         4. BOTTOM FILTER ROW (Subject, Time Period, Difficulty, Year)
         - Optional pills rendered based on props
         - Scrollable dropdowns with z-[100] appearing on top
         ======================================================================= */}
        {hasAnyFilters && (
          <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 text-xs sm:text-[13px] text-[#0D0D0D] font-medium">
            {/* 1. Subject Filter */}
            {isSubjectVisible && (
              <div className={`relative ${activeDropdown === 'subject' ? 'z-[100]' : 'z-10'}`}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'subject' ? null : 'subject')}
                  className="flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#EBEBEB] hover:bg-[#E0E0E0] transition-colors cursor-pointer text-[#0D0D0D] font-medium text-xs sm:text-[13px]"
                >
                  <span>{filters.subject === 'All' ? 'Subject' : filters.subject}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                </button>

                {activeDropdown === 'subject' && (
                  <div className="absolute left-0 top-full mt-1.5 w-44 max-h-32 overflow-y-auto overscroll-contain bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-slate-200 py-1 z-[999] text-left animate-in fade-in select-none">
                    {resolvedSubjectOptions.map((sub) => (
                      <button
                        key={String(sub)}
                        type="button"
                        onClick={() => {
                          handleUpdate({ ...filters, subject: sub });
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        <span className="truncate">{sub}</span>
                        {filters.subject === sub && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Time Period Filter */}
            {isTimePeriodVisible && (
              <div className={`relative ${activeDropdown === 'timePeriod' ? 'z-[100]' : 'z-10'}`}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'timePeriod' ? null : 'timePeriod')}
                  className="flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#EBEBEB] hover:bg-[#E0E0E0] transition-colors cursor-pointer text-[#0D0D0D] font-medium text-xs sm:text-[13px]"
                >
                  <span>{filters.timePeriod === 'All Years' ? 'Time period' : filters.timePeriod}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                </button>

                {activeDropdown === 'timePeriod' && (
                  <div className="absolute left-0 top-full mt-1.5 w-40 max-h-32 overflow-y-auto overscroll-contain bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-slate-200 py-1 z-[999] text-left animate-in fade-in select-none">
                    {resolvedTimePeriodOptions.map((tp) => (
                      <button
                        key={String(tp)}
                        type="button"
                        onClick={() => {
                          handleUpdate({ ...filters, timePeriod: tp });
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        <span className="truncate">{tp}</span>
                        {filters.timePeriod === tp && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Difficulty Level Filter */}
            {isDifficultyVisible && (
              <div className={`relative ${activeDropdown === 'difficulty' ? 'z-[100]' : 'z-10'}`}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'difficulty' ? null : 'difficulty')}
                  className="flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#EBEBEB] hover:bg-[#E0E0E0] transition-colors cursor-pointer text-[#0D0D0D] font-medium text-xs sm:text-[13px]"
                >
                  <span>{filters.difficulty === 'All' ? 'Difficulty level' : filters.difficulty}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                </button>

                {activeDropdown === 'difficulty' && (
                  <div className="absolute left-0 top-full mt-1.5 w-36 max-h-32 overflow-y-auto overscroll-contain bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-slate-200 py-1 z-[999] text-left animate-in fade-in select-none">
                    {resolvedDifficultyOptions.map((diff) => (
                      <button
                        key={String(diff)}
                        type="button"
                        onClick={() => {
                          handleUpdate({ ...filters, difficulty: diff });
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        <span className="truncate">{diff}</span>
                        {filters.difficulty === diff && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Year Filter */}
            {isYearVisible && (
              <div className={`relative ${activeDropdown === 'year' ? 'z-[100]' : 'z-10'}`}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
                  className="flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#EBEBEB] hover:bg-[#E0E0E0] transition-colors cursor-pointer text-[#0D0D0D] font-medium text-xs sm:text-[13px]"
                >
                  <span>{filters.year === 'All' ? 'Year' : filters.year}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                </button>

                {activeDropdown === 'year' && (
                  <div className="absolute left-0 sm:left-0 top-full mt-1.5 w-32 max-h-32 overflow-y-auto overscroll-contain bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-slate-200 py-1 z-[999] text-left animate-in fade-in select-none">
                    {resolvedYearOptions.map((yr) => (
                      <button
                        key={String(yr)}
                        type="button"
                        onClick={() => {
                          handleUpdate({ ...filters, year: yr });
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        <span>{yr}</span>
                        {filters.year === yr && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBox;
