import { useRef, useState } from 'react';

interface Props {
    onSelect: (file: File) => void;
    onClose: () => void;
}

const MAX_BYTES = 5 * 1024 * 1024;

export const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function AttachmentPicker({ onSelect, onClose }: Props) {
    const [tab, setTab] = useState<'device' | 'library'>('device');
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File | undefined | null) => {
        if (!file) return;
        if (file.size > MAX_BYTES) {
            setError('File exceeds the 5 MB limit.');
            return;
        }
        setError(null);
        onSelect(file);
    };

    return (
        <div className="mb-3 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {/* Source tabs */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50">
                <button
                    type="button"
                    onClick={() => setTab('device')}
                    className={`px-4 py-2.5 text-xs font-bold transition-colors ${
                        tab === 'device'
                            ? 'text-[#891920] border-b-2 border-[#891920] bg-white'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Upload from device
                </button>
                <button
                    type="button"
                    onClick={() => setTab('library')}
                    className={`px-4 py-2.5 text-xs font-bold transition-colors ${
                        tab === 'library'
                            ? 'text-[#891920] border-b-2 border-[#891920] bg-white'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    From document library
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="ml-auto mr-2 w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {tab === 'device' ? (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        handleFile(e.dataTransfer.files?.[0]);
                    }}
                    onClick={() => inputRef.current?.click()}
                    className={`m-4 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                        dragging
                            ? 'border-[#891920] bg-[#891920]/5'
                            : 'border-slate-300 hover:border-[#891920]/50 hover:bg-slate-50'
                    }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                    <svg className="w-8 h-8 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                    <p className="text-sm font-semibold text-slate-700">Drag & drop a file here</p>
                    <p className="text-xs text-slate-500 mt-1">or click to browse · max 5 MB</p>
                    {error && <p className="text-xs text-red-600 mt-2 font-semibold">{error}</p>}
                </div>
            ) : (
                <div className="m-4 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                    <svg className="w-8 h-8 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                        />
                    </svg>
                    <p className="text-sm font-semibold text-slate-700">Firm Document Library</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                        Attach documents straight from the firm's library without re-uploading. This source connects in{' '}
                        <span className="font-bold text-[#891920]">Section D — Documents & Automation</span>.
                    </p>
                    <span className="inline-block mt-3 px-2.5 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        Coming in Section D
                    </span>
                </div>
            )}
        </div>
    );
}
