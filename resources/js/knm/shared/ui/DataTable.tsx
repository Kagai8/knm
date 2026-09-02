/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/consistent-type-specifier-style */
/* eslint-disable import/order */
/* eslint-disable @stylistic/brace-style */
/* eslint-disable curly */
/* eslint-disable @stylistic/padding-line-between-statements */
import { useState, type ReactNode, type FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { Badge, Button, Card, FormField } from '@/knm/shared/ui';

interface Column<T = any> {
    key: string;
    label: string;
    sortable?: boolean;
    className?: string;
    headerClassName?: string;
    render?: (value: any, row: T) => ReactNode;
}

interface FilterOption {
    value: string;
    label: string;
}

interface Filter {
    key: string;
    label?: string;
    options: FilterOption[];
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface DataTableProps<T = any> {
    data: T[];
    columns: Column<T>[];

    // Header
    title?: string;
    subtitle?: string;

    // Search
    searchValue?: string;
    searchPlaceholder?: string;

    // Filters
    filters?: Filter[];
    activeFilters?: Record<string, string | null>;

    // Sort
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';

    // Pagination
    currentPage?: number;
    lastPage?: number;
    total?: number;
    perPage?: number;
    perPageOptions?: number[];
    paginationLinks?: PaginatorLink[];

    // Callbacks
    onSearch?: (value: string) => void;
    onFilterChange?: (key: string, value: string | null) => void;
    onSort?: (key: string) => void;
    onPageChange?: (url: string | null) => void;
    onPerPageChange?: (perPage: number) => void;
    onRowClick?: (row: T) => void;

    // States
    isLoading?: boolean;

    // Empty state
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: ReactNode;

    // Row key
    rowKey?: string | ((row: T) => string | number);
}

const pillClasses = (active: boolean) =>
    `px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 ${
        active
            ? 'bg-[#891920] text-white border-[#891920] shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:border-[#D4AF37]/60 hover:text-slate-900'
    }`;

export function DataTable<T>({
    data,
    columns,
    title,
    subtitle,
    searchValue = '',
    searchPlaceholder = 'Search…',
    filters = [],
    activeFilters = {},
    sortKey,
    sortDirection = 'asc',
    currentPage = 1,
    lastPage = 1,
    total = 0,
    perPage = 25,
    perPageOptions = [10, 25, 50, 100],
    paginationLinks = [],
    onSearch,
    onFilterChange,
    onSort,
    onPageChange,
    onPerPageChange,
    onRowClick,
    isLoading = false,
    emptyTitle = 'No records found',
    emptyDescription = 'Try adjusting your search or filters.',
    emptyIcon,
    rowKey = 'id',
}: DataTableProps<T>) {
    const [searchInput, setSearchInput] = useState(searchValue);

    const getRowKey = (row: T, index: number): string | number => {
        if (typeof rowKey === 'function') return rowKey(row);
        return (row as any)[rowKey] ?? index;
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        onSearch?.(searchInput);
    };

    const clearSearch = () => {
        setSearchInput('');
        onSearch?.('');
    };

    const prevLink = paginationLinks.find((l) => l.label.includes('Previous'));
    const nextLink = paginationLinks.find((l) => l.label.includes('Next'));

    const pageNumbers = (() => {
        if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
        const pages: number[] = [];
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(lastPage, currentPage + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        if (pages[0] !== 1) { pages.unshift(1); if (pages[1] !== 2) pages.splice(1, 0, -1); }
        if (pages[pages.length - 1] !== lastPage) { if (pages[pages.length - 1] !== lastPage - 1) pages.push(-1); pages.push(lastPage); }
        return pages;
    })();

    const SortIcon = ({ column }: { column: string }) => {
        if (sortKey !== column) {
            return (
                <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
            );
        }
        return sortDirection === 'asc' ? (
            <svg className="w-3 h-3 text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-3 h-3 text-[#891920]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    return (
        <Card>
            {/* Header */}
            {(title || subtitle) && (
                <div className="px-6 py-4 border-b border-slate-100">
                    {title && <h2 className="text-lg font-serif font-bold text-slate-900">{title}</h2>}
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
            )}

            {/* Toolbar */}
            {(searchPlaceholder || filters.length > 0) && (
                <div className="px-6 py-4 space-y-4 border-b border-slate-100">
                    {/* Search */}
                    {searchPlaceholder && (
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-grow">
                                <FormField
                                    placeholder={searchPlaceholder}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    leftIcon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    }
                                />
                            </div>
                            <Button type="submit" variant="primary" size="sm">
                                Search
                            </Button>
                            {searchValue && (
                                <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
                                    Clear
                                </Button>
                            )}
                        </form>
                    )}

                    {/* Filter pills */}
                    {filters.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {filters.map((filter) => (
                                <div key={filter.key} className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => onFilterChange?.(filter.key, null)}
                                        className={pillClasses(!activeFilters[filter.key])}
                                    >
                                        {filter.label || 'All'}
                                    </button>
                                    {filter.options.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => onFilterChange?.(filter.key, opt.value)}
                                            className={pillClasses(activeFilters[filter.key] === opt.value)}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            {data.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-[0.15em] text-slate-400">
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className={`px-6 py-4 font-bold ${col.sortable ? 'cursor-pointer select-none' : ''} ${col.headerClassName || ''}`}
                                            onClick={() => col.sortable && onSort?.(col.key)}
                                        >
                                            <div className="flex items-center gap-1">
                                                {col.label}
                                                {col.sortable && <SortIcon column={col.key} />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.map((row, index) => (
                                    <tr
                                        key={getRowKey(row, index)}
                                        className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/50'}`}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {columns.map((col) => (
                                            <td key={col.key} className={`px-6 py-4 ${col.className || ''}`}>
                                                {col.render ? col.render((row as any)[col.key], row) : (row as any)[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-500">
                                Page {currentPage} of {lastPage} · {total} total
                            </span>
                            {onPerPageChange && (
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-500">Show:</label>
                                    <select
                                        value={perPage}
                                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white hover:border-slate-300 focus:outline-none focus:border-[#891920]"
                                    >
                                        {perPageOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                        <option value={999999}>All</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={!prevLink?.url}
                                onClick={() => onPageChange?.(prevLink?.url || null)}
                            >
                                Previous
                            </Button>
                            {pageNumbers.map((page, idx) => {
                                if (page === -1) {
                                    return (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                                            …
                                        </span>
                                    );
                                }
                                const isActive = page === currentPage;
                                const pageLink = paginationLinks.find((l) => l.label === String(page));
                                return (
                                    <Button
                                        key={page}
                                        variant={isActive ? 'primary' : 'secondary'}
                                        size="sm"
                                        onClick={() => onPageChange?.(pageLink?.url || null)}
                                        disabled={!pageLink?.url}
                                    >
                                        {page}
                                    </Button>
                                );
                            })}
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={!nextLink?.url}
                                onClick={() => onPageChange?.(nextLink?.url || null)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#891920]/5 text-[#891920] ring-1 ring-[#891920]/10">
                        {emptyIcon || (
                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
                            </svg>
                        )}
                    </div>
                    <h3 className="font-serif font-bold text-slate-900">{emptyTitle}</h3>
                    <p className="mt-1 max-w-xs text-sm text-slate-500">{emptyDescription}</p>
                </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <svg className="animate-spin h-8 w-8 text-[#891920]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
        </Card>
    );
}
