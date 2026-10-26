(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
(()=>{"use strict";return[
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LandingPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/header.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$landing$2d$page$2d$background$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/landing-page-background.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$search$2d$box$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/search-box.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$questions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-questions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$question$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/question.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function LandingPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [filters, setFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        query: '',
        subject: 'All',
        timePeriod: 'All Years',
        difficulty: 'All',
        year: 'All'
    });
    // Dynamic filter options from GET /questions/filters via TanStack Query
    const { data: filtersData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$questions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuestionFilters"])();
    // Prefer live GET /questions/filters; only fall back when the request has not returned yet.
    const subjectOptions = [
        'All',
        ...filtersData?.subjects?.map((s)=>s.value).filter(Boolean) ?? [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$question$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SUBJECTS"]
        ]
    ];
    const timePeriodOptions = [
        'All Years',
        ...filtersData?.timePeriods?.map((t)=>t.label).filter(Boolean) ?? [
            'Last 3 Years',
            'Last 5 Years',
            'Last 10 Years'
        ]
    ];
    const difficultyFromApi = filtersData?.difficulties?.map((d)=>{
        const label = `${d.value.charAt(0)}${d.value.slice(1).toLowerCase()}`;
        if (label === 'Easy' || label === 'Medium' || label === 'Hard') return label;
        return null;
    }).filter((d)=>d !== null) ?? [];
    const difficultyOptions = [
        'All',
        ...difficultyFromApi.length > 0 ? difficultyFromApi : [
            'Easy',
            'Medium',
            'Hard'
        ]
    ];
    const yearOptions = [
        'All',
        ...filtersData?.years?.map((y)=>y.value) ?? []
    ];
    const handleSearchSubmit = ()=>{
        const trimmed = filters.query.trim();
        if (!trimmed) return;
        const paper = filters.subject !== 'All' ? `${filters.subject} exam paper` : 'Exam paper';
        const params = new URLSearchParams();
        params.set('q', trimmed);
        params.set('paper', paper);
        if (filters.subject !== 'All') params.set('subject', filters.subject);
        if (filters.timePeriod !== 'All Years') params.set('timePeriod', filters.timePeriod);
        if (filters.difficulty !== 'All') params.set('difficulty', filters.difficulty);
        if (filters.year !== 'All') params.set('year', String(filters.year));
        router.push(`/chat?${params.toString()}`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative min-h-screen w-full bg-white overflow-hidden font-sans select-none flex flex-col justify-between",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$landing$2d$page$2d$background$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LandingPageBackground"], {}, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "relative z-20 w-full pt-4 px-6 md:px-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Header"], {}, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "relative z-30 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-[800px] mx-auto text-center space-y-4 sm:space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2 px-4 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-center font-semibold text-[#0D0D0D] tracking-normal text-xl sm:text-2xl md:text-3xl lg:text-[43px] leading-snug lg:leading-[42px]",
                                    style: {
                                        fontFamily: "var(--font-instrument, 'Instrument Sans', sans-serif)",
                                        fontWeight: 600,
                                        letterSpacing: '0%'
                                    },
                                    children: [
                                        "Find the Right Exam ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                            className: "hidden sm:inline"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 115,
                                            columnNumber: 35
                                        }, this),
                                        "Question with",
                                        ' ',
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold text-transparent bg-clip-text select-none",
                                            style: {
                                                background: 'linear-gradient(119.29deg, #A8C2F0 0.37%, #2665D9 99.63%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            },
                                            children: "AI"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 118,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-center font-medium text-[#0D0D0D] max-w-2xl mx-auto text-xs sm:text-[13px] md:text-[12px] leading-snug sm:leading-relaxed",
                                    style: {
                                        fontFamily: "var(--font-instrument, 'Instrument Sans', sans-serif)",
                                        fontWeight: 500,
                                        letterSpacing: '0.01em'
                                    },
                                    children: [
                                        "Search a curated, well-indexed archive of examination questions across Mathematics,",
                                        ' ',
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                            className: "hidden md:inline"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 143,
                                            columnNumber: 15
                                        }, this),
                                        "Physics and Chemistry, by topic, year, difficulty or pattern of repetition."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 100,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$search$2d$box$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SearchBox"], {
                            filters: filters,
                            onFilterChange: setFilters,
                            onSearchSubmit: handleSearchSubmit,
                            subjectOptions: subjectOptions,
                            timePeriodOptions: timePeriodOptions,
                            difficultyOptions: difficultyOptions,
                            yearOptions: yearOptions
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 149,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 97,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "relative z-10 w-full py-5 text-center text-xs text-[#333333]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "italic cursor-pointer hover:text-black",
                            children: "Our Terms"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 164,
                            columnNumber: 11
                        }, this),
                        " and",
                        ' ',
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "italic cursor-pointer hover:text-black",
                            children: "Privacy Policy"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 165,
                            columnNumber: 11
                        }, this),
                        " in a new window apply. We are an AI and can make mistakes."
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 163,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
_s(LandingPage, "SpwqAOszsmGp1RTsVhb595l3RuQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$questions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuestionFilters"]
    ];
});
_c = LandingPage;
var _c;
__turbopack_context__.k.register(_c, "LandingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/assets/blue_blur_background 3.gif.mjs { IMAGE => \"[project]/src/assets/blue_blur_background 3.gif (static in ecmascript, tag client)\" } [app-client] (structured image object with data url, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$blue_blur_background__3$2e$gif__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/src/assets/blue_blur_background 3.gif (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$blue_blur_background__3$2e$gif__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 1920,
    height: 1032,
    blurWidth: 0,
    blurHeight: 0
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/assets/image 10.svg.mjs { IMAGE => \"[project]/src/assets/image 10.svg (static in ecmascript, tag client)\" } [app-client] (structured image object with data url, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$image__10$2e$svg__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/src/assets/image 10.svg (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$image__10$2e$svg__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 146,
    height: 103,
    blurWidth: 0,
    blurHeight: 0
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/backend-status-badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BackendStatusBadge",
    ()=>BackendStatusBadge,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$questions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-questions.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function BackendStatusBadge({ className = '' }) {
    _s();
    const { data, isError, refetch, isFetching } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$questions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useHealthCheck"])();
    const isOnline = !isError && data?.status === 'ok';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: ()=>refetch(),
        title: isFetching ? 'Checking backend status...' : isOnline ? `Backend is online (${data?.database === 'up' ? 'Database connected' : 'Database issue'}). Click to recheck.` : 'Backend is offline or unreachable. Click to retry.',
        className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border select-none ${isFetching ? 'bg-slate-50 border-slate-200 text-slate-600' : isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'} ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "relative flex h-2 w-2",
                children: [
                    isOnline && !isFetching && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/backend-status-badge.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `relative inline-flex rounded-full h-2 w-2 ${isFetching ? 'bg-slate-400 animate-pulse' : isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/backend-status-badge.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/backend-status-badge.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: isFetching ? 'Checking...' : isOnline ? 'API Online' : 'API Offline'
            }, void 0, false, {
                fileName: "[project]/src/components/layout/backend-status-badge.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/backend-status-badge.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_s(BackendStatusBadge, "5aqJ89q1X1+ygBbrxKe6nepeCp4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$questions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useHealthCheck"]
    ];
});
_c = BackendStatusBadge;
const __TURBOPACK__default__export__ = BackendStatusBadge;
var _c;
__turbopack_context__.k.register(_c, "BackendStatusBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Header",
    ()=>Header,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.mjs [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$image__10$2e$svg$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$image__10$2e$svg__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/image 10.svg.mjs { IMAGE => "[project]/src/assets/image 10.svg (static in ecmascript, tag client)" } [app-client] (structured image object with data url, ecmascript)');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$backend$2d$status$2d$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/backend-status-badge.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
;
const Header = ({ onAboutClick, onPricingClick, onLoginClick, onSignUpClick })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "w-full flex items-center justify-between py-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/",
                className: "flex items-center shrink-0 cursor-pointer",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: typeof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$image__10$2e$svg$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$image__10$2e$svg__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"] === 'string' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$image__10$2e$svg$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$image__10$2e$svg__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$image__10$2e$svg$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$image__10$2e$svg__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"].src,
                    alt: "ATAR SPARK Logo",
                    className: "h-7 w-auto sm:h-8 md:h-10 lg:h-12 object-contain scale-110 origin-left transition-transform",
                    style: {
                        transform: 'scale(1.10)',
                        transformOrigin: 'left center'
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/header.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/header.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2.5 sm:gap-4 lg:gap-5 shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$backend$2d$status$2d$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BackendStatusBadge"], {}, void 0, false, {
                        fileName: "[project]/src/components/layout/header.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onAboutClick,
                        className: "hidden sm:inline-block text-xs font-medium text-[#0D0D0D] hover:text-black transition-colors cursor-pointer",
                        children: "About Us"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/header.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onPricingClick,
                        className: "hidden sm:inline-block text-xs font-medium text-[#0D0D0D] hover:text-black transition-colors cursor-pointer",
                        children: "Pricing"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/header.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onLoginClick,
                        className: "text-xs font-medium text-[#0D0D0D] hover:text-black transition-colors cursor-pointer px-1 py-1",
                        children: "Login"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/header.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onSignUpClick,
                        className: "group flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-4 rounded-full bg-[#E6E6E6] hover:bg-[#DCDCDC] border-2 border-[#2665D9] text-[#0D0D0D] text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Sign in for free"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/header.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                size: 13,
                                className: "hidden sm:block transition-transform group-hover:translate-x-0.5 shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/header.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/header.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/header.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/header.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = Header;
const __TURBOPACK__default__export__ = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/landing-page-background.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LandingPageBackground",
    ()=>LandingPageBackground
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$blue_blur_background__3$2e$gif$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$blue_blur_background__3$2e$gif__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__ = __turbopack_context__.i('[project]/src/assets/blue_blur_background 3.gif.mjs { IMAGE => "[project]/src/assets/blue_blur_background 3.gif (static in ecmascript, tag client)" } [app-client] (structured image object with data url, ecmascript)');
;
;
function LandingPageBackground() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 w-full h-full overflow-hidden pointer-events-none bg-white select-none z-0",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 w-full h-full overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: typeof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$blue_blur_background__3$2e$gif$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$blue_blur_background__3$2e$gif__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"] === 'string' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$blue_blur_background__3$2e$gif$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$blue_blur_background__3$2e$gif__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$blue_blur_background__3$2e$gif$2e$mjs__$7b$__IMAGE__$3d3e$__$225b$project$5d2f$src$2f$assets$2f$blue_blur_background__3$2e$gif__$28$static__in__ecmascript$2c$__tag__client$2922$__$7d$__$5b$app$2d$client$5d$__$28$structured__image__object__with__data__url$2c$__ecmascript$29$__["default"].src,
                    alt: "",
                    className: "absolute inset-0 w-full h-full object-cover object-center select-none animate-smooth-ambient",
                    style: {
                        filter: 'blur(55px) saturate(1.15)',
                        transform: 'scale(1.08) translateZ(0)',
                        opacity: 0.96
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/landing-page-background.tsx",
                    lineNumber: 12,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/layout/landing-page-background.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 w-full h-full pointer-events-none",
                style: {
                    background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.15) 50%, transparent 75%)'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/layout/landing-page-background.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 w-full h-full pointer-events-none",
                style: {
                    backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.65) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.65) 1px, transparent 1px),
            linear-gradient(to right, rgba(48, 82, 130, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(48, 82, 130, 0.08) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                    backgroundPosition: 'center center',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 1%, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 88%, transparent 99%)',
                    maskImage: 'linear-gradient(to bottom, transparent 1%, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 88%, transparent 99%)'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/layout/landing-page-background.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/70 to-transparent pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/landing-page-background.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/70 to-transparent pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/landing-page-background.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/landing-page-background.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
_c = LandingPageBackground;
var _c;
__turbopack_context__.k.register(_c, "LandingPageBackground");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/search-box.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SearchBox",
    ()=>SearchBox,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic.mjs [app-client] (ecmascript) <export default as Mic>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.mjs [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paperclip$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Paperclip$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/paperclip.mjs [app-client] (ecmascript) <export default as Paperclip>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/toast.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const DEFAULT_FILTERS = {
    query: '',
    subject: 'All',
    timePeriod: 'All Years',
    difficulty: 'All',
    year: 'All'
};
const DEFAULT_SUBJECT_OPTIONS = [
    'All',
    'Mathematics',
    'Physics',
    'Chemistry'
];
const DEFAULT_TIME_PERIOD_OPTIONS = [
    'All Years',
    'Last 3 Years',
    'Last 5 Years',
    'Last 10 Years'
];
const DEFAULT_DIFFICULTY_OPTIONS = [
    'All',
    'Easy',
    'Medium',
    'Hard'
];
const DEFAULT_YEAR_OPTIONS = [
    'All'
];
const SearchBox = ({ filters = DEFAULT_FILTERS, onFilterChange, onSearchSubmit, onFileUpload, onFilesChange, className = '', maxFiles = 5, subjectOptions, timePeriodOptions, difficultyOptions, yearOptions, showSubject, showTimePeriod, showDifficulty, showYear, variant })=>{
    _s();
    const [activeDropdown, setActiveDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [attachedFiles, setAttachedFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const toastTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const showToast = (message, type = 'info')=>{
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        setToast({
            message,
            type
        });
        toastTimerRef.current = setTimeout(()=>{
            setToast(null);
            toastTimerRef.current = null;
        }, 3500);
    };
    const handleDismissToast = ()=>{
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
            toastTimerRef.current = null;
        }
        setToast(null);
    };
    // Cleanup toast timer on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SearchBox.useEffect": ()=>{
            return ({
                "SearchBox.useEffect": ()=>{
                    if (toastTimerRef.current) {
                        clearTimeout(toastTimerRef.current);
                    }
                }
            })["SearchBox.useEffect"];
        }
    }["SearchBox.useEffect"], []);
    // Resolve filter options (props take precedence; fall back to standard defaults)
    const resolvedSubjectOptions = subjectOptions ?? DEFAULT_SUBJECT_OPTIONS;
    const resolvedTimePeriodOptions = timePeriodOptions ?? DEFAULT_TIME_PERIOD_OPTIONS;
    const resolvedDifficultyOptions = difficultyOptions ?? DEFAULT_DIFFICULTY_OPTIONS;
    const resolvedYearOptions = yearOptions ?? DEFAULT_YEAR_OPTIONS;
    // Visibility: optional and configurable
    const isSubjectVisible = showSubject !== undefined ? showSubject : subjectOptions !== undefined ? subjectOptions.length > 0 : true;
    const isTimePeriodVisible = showTimePeriod !== undefined ? showTimePeriod : timePeriodOptions !== undefined ? timePeriodOptions.length > 0 : true;
    const isDifficultyVisible = showDifficulty !== undefined ? showDifficulty : difficultyOptions !== undefined ? difficultyOptions.length > 0 : true;
    const isYearVisible = showYear !== undefined ? showYear : yearOptions !== undefined ? yearOptions.length > 0 : true;
    const hasAnyFilters = isSubjectVisible || isTimePeriodVisible || isDifficultyVisible || isYearVisible;
    const isPill = variant === 'pill' || !hasAnyFilters;
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close dropdown on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SearchBox.useEffect": ()=>{
            const handleClickOutside = {
                "SearchBox.useEffect.handleClickOutside": (event)=>{
                    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                        setActiveDropdown(null);
                    }
                }
            }["SearchBox.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "SearchBox.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
            })["SearchBox.useEffect"];
        }
    }["SearchBox.useEffect"], []);
    const handleUpdate = (updated)=>{
        if (onFilterChange) {
            onFilterChange(updated);
        }
    };
    const handleKeyDown = (e)=>{
        if (e.key === 'Enter') {
            if (onSearchSubmit) onSearchSubmit();
            setActiveDropdown(null);
        }
    };
    const handlePlusClick = ()=>{
        // EduSearch student API does not accept file parts on /api/chat
        showToast('File attachments are not supported yet.', 'info');
    };
    const handleFileChange = (e)=>{
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;
        const remainingSlots = maxFiles - attachedFiles.length;
        if (remainingSlots <= 0) {
            showToast(`Maximum of ${maxFiles} files reached.`, 'warning');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        const filesToAdd = selectedFiles.slice(0, remainingSlots);
        const updated = [
            ...attachedFiles,
            ...filesToAdd
        ];
        setAttachedFiles(updated);
        if (selectedFiles.length > remainingSlots) {
            showToast(`Maximum of ${maxFiles} files allowed. Attached the first ${filesToAdd.length} file(s).`, 'info');
        }
        if (onFileUpload) {
            filesToAdd.forEach((f)=>onFileUpload(f));
        }
        if (onFilesChange) {
            onFilesChange(updated);
        }
        // Reset input so user can add more files later
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const handleRemoveFile = (indexToRemove)=>{
        const updated = attachedFiles.filter((_, idx)=>idx !== indexToRemove);
        setAttachedFiles(updated);
        if (onFilesChange) {
            onFilesChange(updated);
        }
    };
    const recognitionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleSpeechRecognition = ()=>{
        // If currently listening, clicking again stops it
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }
        const win = ("TURBOPACK compile-time truthy", 1) ? window : "TURBOPACK unreachable";
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
            recognition.onstart = ()=>{
                setIsListening(true);
            };
            recognition.onend = ()=>{
                setIsListening(false);
                recognitionRef.current = null;
            };
            recognition.onerror = (event)=>{
                console.warn('Speech recognition error:', event.error);
                setIsListening(false);
                recognitionRef.current = null;
            };
            recognition.onresult = (event)=>{
                let transcript = '';
                for(let i = 0; i < event.results.length; i++){
                    transcript += event.results[i][0].transcript;
                }
                if (transcript.trim()) {
                    handleUpdate({
                        ...filters,
                        query: transcript
                    });
                }
            };
            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setIsListening(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toast"], {
                message: toast.message,
                type: toast.type,
                onDismiss: handleDismissToast
            }, void 0, false, {
                fileName: "[project]/src/components/search-box.tsx",
                lineNumber: 255,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: dropdownRef,
                className: isPill ? `relative z-20 mx-auto w-full max-w-[525px] rounded-full p-1.5 pl-3 border-[2.5px] border-transparent box-border shadow-[0_4px_16px_rgba(38,101,217,0.14)] animate-border-flow transition-all focus-within:shadow-[0_8px_24px_rgba(38,101,217,0.22)] ${className}` : `relative ${activeDropdown ? 'z-[100]' : 'z-20'} mx-auto w-full max-w-[750px] md:min-h-[130px] p-5 sm:p-6 md:py-4.5 rounded-[29px] flex flex-col justify-between gap-4 sm:gap-5 border-[3.5px] border-transparent box-border shadow-[0_10px_30px_rgba(38,101,217,0.14)] animate-border-flow transition-all focus-within:shadow-[0_14px_36px_rgba(38,101,217,0.24)] ${className}`,
                style: {
                    background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #2665D9 0%, #7DA3E8 35%, #173D82 70%, #2665D9 100%) border-box'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: fileInputRef,
                        type: "file",
                        multiple: true,
                        accept: "*/*",
                        onChange: handleFileChange,
                        className: "hidden"
                    }, void 0, false, {
                        fileName: "[project]/src/components/search-box.tsx",
                        lineNumber: 280,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    attachedFiles.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center gap-1.5 sm:gap-2 w-full pt-0.5 pb-1",
                        children: attachedFiles.map((file, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 max-w-[200px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paperclip$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Paperclip$3e$__["Paperclip"], {
                                        className: "w-3.5 h-3.5 text-blue-600 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 299,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate font-medium text-[11px] sm:text-xs",
                                        title: file.name,
                                        children: file.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 300,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>handleRemoveFile(idx),
                                        className: "text-blue-500 hover:text-blue-800 ml-0.5 p-0.5 rounded hover:bg-blue-100 cursor-pointer shrink-0",
                                        title: "Remove file",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "w-3 h-3"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/search-box.tsx",
                                            lineNumber: 309,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 303,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, `${file.name}-${idx}`, true, {
                                fileName: "[project]/src/components/search-box.tsx",
                                lineNumber: 295,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/src/components/search-box.tsx",
                        lineNumber: 293,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center w-full ${isPill ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-3'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: true,
                                onClick: handlePlusClick,
                                title: attachedFiles.length >= maxFiles ? `Maximum ${maxFiles} files reached` : `Attach files or photos (up to ${maxFiles})`,
                                className: `w-8 h-8 xs:w-9 xs:h-9 sm:w-[42px] sm:h-[42px] rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors shrink-0 ${attachedFiles.length >= maxFiles ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#EBEBEB] hover:bg-[#E0E0E0] text-[#0D0D0D] cursor-pointer'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: isPill ? 'w-4 h-4 text-slate-400' : 'w-4 h-4 sm:w-[18px] sm:h-[18px]'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/search-box.tsx",
                                    lineNumber: 336,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/components/search-box.tsx",
                                lineNumber: 322,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: filters.query,
                                onChange: (e)=>handleUpdate({
                                        ...filters,
                                        query: e.target.value
                                    }),
                                onKeyDown: handleKeyDown,
                                placeholder: "Search question, topics, concepts...",
                                className: `min-w-0 flex-1 bg-transparent py-1 text-slate-800 placeholder-[#757575] focus:outline-none font-normal ${isPill ? 'px-2 text-xs sm:text-sm' : 'px-1.5 text-sm sm:text-base'}`
                            }, void 0, false, {
                                fileName: "[project]/src/components/search-box.tsx",
                                lineNumber: 340,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 sm:gap-2 shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleSpeechRecognition,
                                        title: isListening ? 'Stop listening' : 'Start voice search',
                                        className: `p-1 sm:p-1.5 rounded-full transition-colors cursor-pointer flex items-center justify-center ${isListening ? 'bg-red-500 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400 animate-pulse' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'}`,
                                        "aria-label": isListening ? 'Stop recording voice' : 'Search by voice',
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                            className: isPill ? 'w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700' : 'w-[22px] h-[22px] text-slate-900',
                                            strokeWidth: 1.8
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/search-box.tsx",
                                            lineNumber: 363,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 353,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: onSearchSubmit,
                                        style: {
                                            background: 'linear-gradient(180deg, #51A1E1 0%, #2665D9 100%)',
                                            ...isPill ? {} : {
                                                width: '108px',
                                                height: '44px'
                                            }
                                        },
                                        className: `flex items-center justify-center gap-1.5 rounded-full text-white font-medium shadow-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shrink-0 ${isPill ? 'px-3.5 sm:px-4 h-[34px] sm:h-[36px] text-xs sm:text-[13px]' : 'gap-2 text-sm'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                className: isPill ? 'w-3.5 h-3.5 text-white shrink-0' : 'w-[18px] h-[18px] text-white shrink-0',
                                                strokeWidth: 2.2
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 384,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-['Instrument_Sans'] select-none",
                                                children: "Search"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 385,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 367,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/search-box.tsx",
                                lineNumber: 351,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/search-box.tsx",
                        lineNumber: 319,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    hasAnyFilters && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 text-xs sm:text-[13px] text-[#0D0D0D] font-medium",
                        children: [
                            isSubjectVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `relative ${activeDropdown === 'subject' ? 'z-[100]' : 'z-10'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setActiveDropdown(activeDropdown === 'subject' ? null : 'subject'),
                                        className: "flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#EBEBEB] hover:bg-[#E0E0E0] transition-colors cursor-pointer text-[#0D0D0D] font-medium text-xs sm:text-[13px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: filters.subject === 'All' ? 'Subject' : filters.subject
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 407,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                className: "w-3.5 h-3.5 text-slate-600"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 408,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 402,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    activeDropdown === 'subject' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute left-0 top-full mt-1.5 w-44 max-h-32 overflow-y-auto overscroll-contain bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-slate-200 py-1 z-[999] text-left animate-in fade-in select-none",
                                        children: resolvedSubjectOptions.map((sub)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>{
                                                    handleUpdate({
                                                        ...filters,
                                                        subject: sub
                                                    });
                                                    setActiveDropdown(null);
                                                },
                                                className: "w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate",
                                                        children: sub
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/search-box.tsx",
                                                        lineNumber: 423,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    filters.subject === sub && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        className: "w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/search-box.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 53
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, String(sub), true, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 414,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 412,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/search-box.tsx",
                                lineNumber: 401,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            isTimePeriodVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `relative ${activeDropdown === 'timePeriod' ? 'z-[100]' : 'z-10'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setActiveDropdown(activeDropdown === 'timePeriod' ? null : 'timePeriod'),
                                        className: "flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#EBEBEB] hover:bg-[#E0E0E0] transition-colors cursor-pointer text-[#0D0D0D] font-medium text-xs sm:text-[13px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: filters.timePeriod === 'All Years' ? 'Time period' : filters.timePeriod
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 440,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                className: "w-3.5 h-3.5 text-slate-600"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 441,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 435,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    activeDropdown === 'timePeriod' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute left-0 top-full mt-1.5 w-40 max-h-32 overflow-y-auto overscroll-contain bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-slate-200 py-1 z-[999] text-left animate-in fade-in select-none",
                                        children: resolvedTimePeriodOptions.map((tp)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>{
                                                    handleUpdate({
                                                        ...filters,
                                                        timePeriod: tp
                                                    });
                                                    setActiveDropdown(null);
                                                },
                                                className: "w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate",
                                                        children: tp
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/search-box.tsx",
                                                        lineNumber: 456,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    filters.timePeriod === tp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        className: "w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/search-box.tsx",
                                                        lineNumber: 457,
                                                        columnNumber: 55
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, String(tp), true, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 447,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 445,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/search-box.tsx",
                                lineNumber: 434,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            isDifficultyVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `relative ${activeDropdown === 'difficulty' ? 'z-[100]' : 'z-10'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setActiveDropdown(activeDropdown === 'difficulty' ? null : 'difficulty'),
                                        className: "flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#EBEBEB] hover:bg-[#E0E0E0] transition-colors cursor-pointer text-[#0D0D0D] font-medium text-xs sm:text-[13px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: filters.difficulty === 'All' ? 'Difficulty level' : filters.difficulty
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 473,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                className: "w-3.5 h-3.5 text-slate-600"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 474,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 468,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    activeDropdown === 'difficulty' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute left-0 top-full mt-1.5 w-36 max-h-32 overflow-y-auto overscroll-contain bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-slate-200 py-1 z-[999] text-left animate-in fade-in select-none",
                                        children: resolvedDifficultyOptions.map((diff)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>{
                                                    handleUpdate({
                                                        ...filters,
                                                        difficulty: diff
                                                    });
                                                    setActiveDropdown(null);
                                                },
                                                className: "w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate",
                                                        children: diff
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/search-box.tsx",
                                                        lineNumber: 489,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    filters.difficulty === diff && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        className: "w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/search-box.tsx",
                                                        lineNumber: 490,
                                                        columnNumber: 57
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, String(diff), true, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 480,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 478,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/search-box.tsx",
                                lineNumber: 467,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            isYearVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `relative ${activeDropdown === 'year' ? 'z-[100]' : 'z-10'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setActiveDropdown(activeDropdown === 'year' ? null : 'year'),
                                        className: "flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl sm:rounded-2xl bg-[#EBEBEB] hover:bg-[#E0E0E0] transition-colors cursor-pointer text-[#0D0D0D] font-medium text-xs sm:text-[13px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: filters.year === 'All' ? 'Year' : filters.year
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 506,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                className: "w-3.5 h-3.5 text-slate-600"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 507,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 501,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    activeDropdown === 'year' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute left-0 sm:left-0 top-full mt-1.5 w-32 max-h-32 overflow-y-auto overscroll-contain bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-slate-200 py-1 z-[999] text-left animate-in fade-in select-none",
                                        children: resolvedYearOptions.map((yr)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>{
                                                    handleUpdate({
                                                        ...filters,
                                                        year: yr
                                                    });
                                                    setActiveDropdown(null);
                                                },
                                                className: "w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: yr
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/search-box.tsx",
                                                        lineNumber: 522,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    filters.year === yr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        className: "w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/search-box.tsx",
                                                        lineNumber: 523,
                                                        columnNumber: 49
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, String(yr), true, {
                                                fileName: "[project]/src/components/search-box.tsx",
                                                lineNumber: 513,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/search-box.tsx",
                                        lineNumber: 511,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/search-box.tsx",
                                lineNumber: 500,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/search-box.tsx",
                        lineNumber: 398,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/search-box.tsx",
                lineNumber: 267,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/search-box.tsx",
        lineNumber: 253,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(SearchBox, "BkSpgPd4ihfYelFtVMPOQn+Lbpk=");
_c = SearchBox;
const __TURBOPACK__default__export__ = SearchBox;
var _c;
__turbopack_context__.k.register(_c, "SearchBox");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/toast.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toast",
    ()=>Toast,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.mjs [app-client] (ecmascript) <export default as Info>");
'use client';
;
;
const Toast = ({ message, type = 'info', onDismiss, className = '' })=>{
    const isWarning = type === 'warning';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "status",
        "aria-live": "polite",
        className: `fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-[92vw] sm:max-w-md flex items-center gap-2.5 pl-3.5 pr-2 py-2 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_12px_36px_rgba(38,101,217,0.18),0_2px_8px_rgba(0,0,0,0.06)] animate-toast select-none transition-all ${className}`,
        style: {
            fontFamily: "var(--font-instrument, 'Instrument Sans', sans-serif)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isWarning ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-[#2665D9]'}`,
                children: isWarning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                    className: "w-3.5 h-3.5",
                    strokeWidth: 2.2
                }, void 0, false, {
                    fileName: "[project]/src/components/toast.tsx",
                    lineNumber: 49,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                    className: "w-3.5 h-3.5",
                    strokeWidth: 2.2
                }, void 0, false, {
                    fileName: "[project]/src/components/toast.tsx",
                    lineNumber: 51,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/toast.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs sm:text-[13px] font-medium text-[#0D0D0D] leading-tight tracking-normal",
                children: message
            }, void 0, false, {
                fileName: "[project]/src/components/toast.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onDismiss,
                className: "p-1 rounded-full text-slate-400 hover:text-[#0D0D0D] hover:bg-slate-100 cursor-pointer transition-colors shrink-0 ml-1",
                "aria-label": "Dismiss notification",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    className: "w-3.5 h-3.5"
                }, void 0, false, {
                    fileName: "[project]/src/components/toast.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/toast.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/toast.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = Toast;
const __TURBOPACK__default__export__ = Toast;
var _c;
__turbopack_context__.k.register(_c, "Toast");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-debounce.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDebounce",
    ()=>useDebounce
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useDebounce(value, delay = 300) {
    _s();
    const [debouncedValue, setDebouncedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDebounce.useEffect": ()=>{
            const handler = setTimeout({
                "useDebounce.useEffect.handler": ()=>{
                    setDebouncedValue(value);
                }
            }["useDebounce.useEffect.handler"], delay);
            return ({
                "useDebounce.useEffect": ()=>{
                    clearTimeout(handler);
                }
            })["useDebounce.useEffect"];
        }
    }["useDebounce.useEffect"], [
        value,
        delay
    ]);
    return debouncedValue;
}
_s(useDebounce, "KDuPAtDOgxm8PU6legVJOb3oOmA=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-questions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MIN_SCORE",
    ()=>MIN_SCORE,
    "getDefaultFilterOptions",
    ()=>getDefaultFilterOptions,
    "useHealthCheck",
    ()=>useHealthCheck,
    "useHybridSearch",
    ()=>useHybridSearch,
    "useQuestionAnswer",
    ()=>useQuestionAnswer,
    "useQuestionFilters",
    ()=>useQuestionFilters,
    "useQuestionSearch",
    ()=>useQuestionSearch
]);
// src/hooks/use-questions.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$debounce$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-debounce.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
;
;
;
const MIN_SCORE = 0.3;
function getDefaultFilterOptions() {
    const currentYear = new Date().getFullYear();
    return {
        subjects: [
            {
                value: 'Mathematics',
                count: 0
            },
            {
                value: 'Physics',
                count: 0
            },
            {
                value: 'Chemistry',
                count: 0
            }
        ],
        years: Array.from({
            length: 4
        }, (_, i)=>({
                value: currentYear - 1 - i,
                count: 0
            })),
        difficulties: [
            {
                value: 'EASY',
                count: 0
            },
            {
                value: 'MEDIUM',
                count: 0
            },
            {
                value: 'HARD',
                count: 0
            }
        ],
        timePeriods: [
            {
                label: 'Last 3 Years',
                yearFrom: currentYear - 2,
                yearTo: currentYear,
                count: 0
            },
            {
                label: 'Last 5 Years',
                yearFrom: currentYear - 4,
                yearTo: currentYear,
                count: 0
            },
            {
                label: 'Last 10 Years',
                yearFrom: currentYear - 9,
                yearTo: currentYear,
                count: 0
            }
        ],
        total: 0
    };
}
function useHealthCheck(enabled = true) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'health'
        ],
        queryFn: {
            "useHealthCheck.useQuery": ({ signal })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getHealth(signal)
        }["useHealthCheck.useQuery"],
        enabled,
        staleTime: 1000 * 15,
        retry: false,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true
    });
}
_s(useHealthCheck, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useQuestionFilters() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'question-filters'
        ],
        queryFn: {
            "useQuestionFilters.useQuery": ({ signal })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getFilters(signal)
        }["useQuestionFilters.useQuery"],
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        // So time-period labels can resolve to yearFrom/yearTo before first fetch settles
        placeholderData: getDefaultFilterOptions()
    });
}
_s1(useQuestionFilters, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useQuestionSearch(filters, timePeriodOptions, options) {
    _s2();
    const debouncedQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$debounce$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDebounce"])(filters.query.trim(), options?.debounceMs ?? 300);
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toQuestionSearchParams"])({
        ...filters,
        query: debouncedQuery
    }, timePeriodOptions, options?.limit ?? 10);
    const query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'questions-search',
            searchParams
        ],
        queryFn: {
            "useQuestionSearch.useQuery[query]": ({ signal })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].searchQuestions(searchParams, signal)
        }["useQuestionSearch.useQuery[query]"],
        enabled: (options?.enabled ?? true) && debouncedQuery.length > 0,
        staleTime: 1000 * 60 * 3,
        placeholderData: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keepPreviousData"]
    });
    // Memoized transformation — cache stores the RAW response
    const filteredResults = query.data?.results?.filter((q)=>q.score >= MIN_SCORE) ?? [];
    return {
        ...query,
        filteredResults
    };
}
_s2(useQuestionSearch, "TeM/F4wsTjJleHS0G89mv9tFonc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$debounce$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDebounce"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useHybridSearch(filters, timePeriodOptions, options) {
    _s3();
    const debouncedQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$debounce$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDebounce"])(filters.query.trim(), options?.debounceMs ?? 300);
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toQuestionSearchParams"])({
        ...filters,
        query: debouncedQuery
    }, timePeriodOptions, options?.limit ?? 10);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'questions-hybrid-search',
            searchParams
        ],
        queryFn: {
            "useHybridSearch.useQuery": ({ signal })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].searchHybrid(searchParams, signal)
        }["useHybridSearch.useQuery"],
        enabled: (options?.enabled ?? true) && debouncedQuery.length > 0,
        staleTime: 1000 * 60 * 3,
        placeholderData: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["keepPreviousData"]
    });
}
_s3(useHybridSearch, "UEmgc9KtHhSJ5niANYg/pAAWcg0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$debounce$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDebounce"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useQuestionAnswer(filters, timePeriodOptions, options) {
    _s4();
    const answerParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toQuestionAnswerParams"])(filters, timePeriodOptions);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'question-answer',
            answerParams
        ],
        queryFn: {
            "useQuestionAnswer.useQuery": ({ signal })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getAnswer(answerParams, signal)
        }["useQuestionAnswer.useQuery"],
        enabled: (options?.enabled ?? true) && answerParams.query.length > 0,
        staleTime: 1000 * 60 * 5
    });
}
_s4(useQuestionAnswer, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/api-client.ts
__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "apiClient",
    ()=>apiClient,
    "getApiBaseUrl",
    ()=>getApiBaseUrl,
    "resolvePaperAssetUrl",
    ()=>resolvePaperAssetUrl,
    "toChatFilters",
    ()=>toChatFilters,
    "toQuestionAnswerParams",
    ()=>toQuestionAnswerParams,
    "toQuestionSearchParams",
    ()=>toQuestionSearchParams,
    "toRestDifficulty",
    ()=>toRestDifficulty
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
class ApiError extends Error {
    statusCode;
    constructor(message, statusCode = 500){
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }
}
function getApiBaseUrl() {
    const url = ("TURBOPACK compile-time value", "https://disown-antihero-secluded.ngrok-free.dev") || 'http://localhost:3000';
    return url.replace(/\/+$/, '');
}
/** Timeout budgets per endpoint type (ms). */ const TIMEOUTS = {
    health: 10_000,
    filters: 15_000,
    search: 60_000,
    answer: 90_000,
    papers: 120_000
};
/**
 * Multipart fetch for /papers/* — do not set Content-Type (browser sets boundary).
 */ async function requestFormData(endpoint, form, timeoutMs = TIMEOUTS.papers) {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: form,
            signal: controller.signal,
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            let errorMessage = `Request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                const msg = errorData.message;
                errorMessage = Array.isArray(msg) ? msg.join(', ') : msg || errorData.error || errorMessage;
            } catch  {
                errorMessage = response.statusText || errorMessage;
            }
            throw new ApiError(errorMessage, response.status);
        }
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds. Please try again.`, 408);
        }
        if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
            throw new ApiError('Unable to connect to backend server. Please check your network or server status.', 503);
        }
        const message = error instanceof Error ? error.message : 'An unexpected network error occurred.';
        throw new ApiError(message, 500);
    }
}
function resolvePaperAssetUrl(pathOrUrl) {
    if (!pathOrUrl) return pathOrUrl;
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const base = getApiBaseUrl();
    return `${base}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}
/**
 * Generic fetch wrapper with timeout and structured error extraction.
 *
 * - Aborts after `timeoutMs`
 * - Propagates an external AbortSignal (e.g. from TanStack Query when the
 *   component unmounts or the query becomes inactive)
 * - Distinguishes "caller cancelled" from "timed out"
 * - Extracts `message` / `error` from non-OK JSON responses
 */ async function request(endpoint, options = {}, timeoutMs = TIMEOUTS.answer) {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), timeoutMs);
    // Allow an external signal to also abort — including one that was
    // already aborted before we got here.
    if (options.signal) {
        if (options.signal.aborted) {
            controller.abort();
        } else {
            options.signal.addEventListener('abort', ()=>controller.abort());
        }
    }
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                // Required when NEXT_PUBLIC_API_URL is an ngrok tunnel
                'ngrok-skip-browser-warning': 'true',
                ...options.headers || {}
            }
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            let errorMessage = `Request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch  {
                // Body wasn't JSON — fall back to status text
                errorMessage = response.statusText || errorMessage;
            }
            throw new ApiError(errorMessage, response.status);
        }
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof Error && error.name === 'AbortError') {
            if (options.signal?.aborted) {
                throw new ApiError('Request was cancelled.', 0);
            }
            throw new ApiError(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds. Please try again.`, 408);
        }
        if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
            throw new ApiError('Unable to connect to backend server. Please check your network or server status.', 503);
        }
        const message = error instanceof Error ? error.message : 'An unexpected network error occurred.';
        throw new ApiError(message, 500);
    }
}
const apiClient = {
    /**
   * GET /health - Check backend and PostgreSQL database status
   */ async getHealth (signal) {
        return request('/health', {
            method: 'GET',
            signal
        }, TIMEOUTS.health);
    },
    /**
   * GET /questions/filters - Fetch dynamic dropdown options for questions
   */ async getFilters (signal) {
        return request('/questions/filters', {
            method: 'GET',
            signal
        }, TIMEOUTS.filters);
    },
    /**
   * POST /questions/search - Semantic vector search for exam questions.
   * Results include a `score` (0–1); hide anything below 0.3 in the UI.
   */ async searchQuestions (params, signal) {
        return request('/questions/search', {
            method: 'POST',
            body: JSON.stringify(params),
            signal
        }, TIMEOUTS.search);
    },
    /**
   * POST /questions/search/hybrid - Combined semantic + lexical full-text search
   */ async searchHybrid (params, signal) {
        return request('/questions/search/hybrid', {
            method: 'POST',
            body: JSON.stringify(params),
            signal
        }, TIMEOUTS.search);
    },
    /**
   * POST /questions/answer - Verified source-grounded answer generation.
   * Status can be: 'answered' | 'insufficient' | 'out_of_scope'.
   */ async getAnswer (params, signal) {
        return request('/questions/answer', {
            method: 'POST',
            body: JSON.stringify(params),
            signal
        }, TIMEOUTS.answer);
    },
    /**
   * POST /papers/extract — draft questions only (nothing saved).
   */ async extractPaper (file) {
        const form = new FormData();
        form.append('file', file);
        return requestFormData('/papers/extract', form);
    },
    /**
   * POST /papers/approve — persist + embed (+ Cloudinary when configured).
   */ async approvePaper (file, draft) {
        const form = new FormData();
        form.append('file', file);
        form.append('draft', JSON.stringify(draft));
        return requestFormData('/papers/approve', form);
    },
    /**
   * GET /questions/list — admin browse of DB rows (any embedding status).
   */ async listQuestions (params) {
        const q = new URLSearchParams();
        if (params?.subject) q.set('subject', params.subject);
        if (params?.embeddingStatus) q.set('embeddingStatus', params.embeddingStatus);
        if (params?.limit != null) q.set('limit', String(params.limit));
        if (params?.offset != null) q.set('offset', String(params.offset));
        const qs = q.toString();
        return request(`/questions/list${qs ? `?${qs}` : ''}`, {
            method: 'GET',
            signal: params?.signal
        }, TIMEOUTS.filters);
    }
};
function toRestDifficulty(difficulty) {
    if (!difficulty || difficulty === 'All') return null;
    const upper = difficulty.toUpperCase();
    if (upper === 'EASY' || upper === 'MEDIUM' || upper === 'HARD') {
        return upper;
    }
    console.warn(`[api-client] Unknown difficulty "${difficulty}" — filter dropped.`);
    return null;
}
function toQuestionSearchParams(filters, timePeriodOptions, limit = 10) {
    let yearFrom = null;
    let yearTo = null;
    if (filters.timePeriod && filters.timePeriod !== 'All Years' && timePeriodOptions) {
        const matched = timePeriodOptions.find((t)=>t.label === filters.timePeriod);
        if (matched) {
            yearFrom = matched.yearFrom;
            yearTo = matched.yearTo;
        }
    }
    let examYear = null;
    if (filters.year && filters.year !== 'All') {
        const parsed = typeof filters.year === 'number' ? filters.year : parseInt(filters.year, 10);
        if (!Number.isNaN(parsed)) {
            examYear = parsed;
        }
    }
    return {
        query: filters.query.trim(),
        subject: filters.subject !== 'All' ? filters.subject : null,
        examYear,
        yearFrom,
        yearTo,
        difficulty: toRestDifficulty(filters.difficulty),
        limit
    };
}
function toQuestionAnswerParams(filters, timePeriodOptions) {
    const searchParams = toQuestionSearchParams(filters, timePeriodOptions);
    return {
        query: searchParams.query,
        subject: searchParams.subject,
        examYear: searchParams.examYear,
        yearFrom: searchParams.yearFrom,
        yearTo: searchParams.yearTo,
        difficulty: searchParams.difficulty
    };
}
function toChatFilters(filters) {
    let year;
    if (filters.year && filters.year !== 'All') {
        const parsed = typeof filters.year === 'number' ? filters.year : parseInt(filters.year, 10);
        if (!Number.isNaN(parsed)) {
            year = parsed;
        }
    }
    return {
        subject: filters.subject !== 'All' ? filters.subject : undefined,
        timePeriod: filters.timePeriod !== 'All Years' ? filters.timePeriod : undefined,
        difficulty: filters.difficulty !== 'All' ? filters.difficulty : undefined,
        year
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/types/question.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================================
// Domain types (UI-facing)
// =============================================================
__turbopack_context__.s([
    "API_DIFFICULTIES",
    ()=>API_DIFFICULTIES,
    "DIFFICULTIES",
    ()=>DIFFICULTIES,
    "SUBJECTS",
    ()=>SUBJECTS,
    "TIME_PERIODS",
    ()=>TIME_PERIODS
]);
const SUBJECTS = [
    'Mathematics',
    'Physics',
    'Chemistry'
];
const DIFFICULTIES = [
    'Easy',
    'Medium',
    'Hard'
];
const API_DIFFICULTIES = [
    'EASY',
    'MEDIUM',
    'HARD'
];
const TIME_PERIODS = [
    'Last 3 Years',
    'Last 5 Years',
    'Last 10 Years',
    'All Years'
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
 // Chat response is a text/event-stream — typed by the AI SDK, no interface needed.
}),
]})(),
"[project]/src/assets/blue_blur_background 3.gif (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.q("/_next/static/media/blue_blur_background 3.1n0t8_sqycnqn.gif");}),
"[project]/src/assets/image 10.svg (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.q("/_next/static/media/image 10.452l39c74_qk2.svg");}),
]);

//# sourceMappingURL=src_09_g58rbzldoe._.js.map