import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, FileSpreadsheet, X, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../lib/utils';

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'] as const;
const MAX_BYTES = 25 * 1024 * 1024;

const FORMAT_DETAILS = [
  {
    label: 'Microsoft Excel',
    extensions: '.xlsx, .xls',
    note: 'Workbook format; first sheet is read when importing.',
  },
  {
    label: 'CSV',
    extensions: '.csv',
    note: 'Comma-separated values, UTF-8 encoding recommended.',
  },
] as const;

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export default function EmployeeDataUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const assignFile = useCallback((f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!isAcceptedFile(f)) {
      setError(`Unsupported format. Use: ${ACCEPTED_EXTENSIONS.join(', ')}`);
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(`File is too large. Maximum size is ${formatBytes(MAX_BYTES)}.`);
      setFile(null);
      return;
    }
    setFile(f);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    assignFile(f);
    e.target.value = '';
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0] ?? null;
      assignFile(f);
    },
    [assignFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col gap-10 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-black/50 dark:text-white/50 uppercase tracking-wider">
          <FileSpreadsheet className="w-4 h-4" />
          Data management
        </div>
        <h1 className="text-3xl font-medium tracking-tight text-page-text">Employee data upload</h1>
        <p className="text-sm text-black/55 dark:text-white/55 max-w-2xl leading-relaxed">
          Replace or extend your workforce roster from a spreadsheet. This screen is UI-only: files are validated in
          the browser and are not uploaded until a backend endpoint is connected.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex flex-col gap-6"
        >
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative rounded-3xl border-2 border-dashed px-8 py-16 text-center cursor-pointer transition-colors',
              'border-black/[0.12] bg-black/[0.02] hover:border-black/25 hover:bg-black/[0.03]',
              'dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-white/25 dark:hover:bg-white/[0.05]',
              isDragging && 'border-emerald-500/60 bg-emerald-500/5 dark:border-emerald-400/50 dark:bg-emerald-500/10'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="sr-only"
              aria-label="Choose employee data file"
              onChange={onInputChange}
            />
            <UploadCloud
              className={cn(
                'w-12 h-12 mx-auto mb-4 text-black/30 dark:text-white/35',
                isDragging && 'text-emerald-600 dark:text-emerald-400'
              )}
            />
            <p className="text-base font-medium text-page-text mb-1">Drop a file here or click to browse</p>
            <p className="text-sm text-black/45 dark:text-white/45">
              Supported: <span className="font-medium text-page-text">{ACCEPTED_EXTENSIONS.join(', ')}</span> · Max{' '}
              {formatBytes(MAX_BYTES)}
            </p>
          </div>

          {error && (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {error}
            </div>
          )}

          {file && (
            <div className="rounded-2xl border border-black/[0.06] bg-white dark:border-white/10 dark:bg-zinc-900/80 px-5 py-4 flex items-start gap-4 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-page-text truncate">{file.name}</p>
                <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">{formatBytes(file.size)}</p>
                <p className="text-xs text-black/40 dark:text-white/45 mt-3">
                  Ready for import once the API is wired. Nothing has been sent to a server.
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setError(null);
                }}
                className="p-2 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/10 text-black/50 dark:text-white/50"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.04] px-4 py-3">
            <Info className="w-5 h-5 text-black/40 dark:text-white/45 shrink-0 mt-0.5" />
            <p className="text-sm text-black/55 dark:text-white/55 leading-relaxed">
              Column names should align with your HR export (e.g. name, department, start date, salary fields). A
              downloadable template can be added when the import API is available.
            </p>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-3xl border border-black/[0.06] bg-white dark:border-white/10 dark:bg-zinc-900/60 p-6 shadow-sm h-fit"
        >
          <h2 className="text-sm font-semibold text-page-text mb-4">Supported formats</h2>
          <ul className="flex flex-col gap-5">
            {FORMAT_DETAILS.map((row) => (
              <li key={row.label} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-page-text">{row.label}</span>
                <span className="text-xs font-mono text-black/55 dark:text-white/55">{row.extensions}</span>
                <span className="text-xs text-black/45 dark:text-white/45 leading-relaxed">{row.note}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-6 border-t border-black/[0.06] dark:border-white/10">
            <p className="text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wider mb-2">
              Not supported yet
            </p>
            <p className="text-xs text-black/45 dark:text-white/45 leading-relaxed">
              PDF, images, JSON, or zipped archives. Export from your HRIS or spreadsheet app to Excel or CSV first.
            </p>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
