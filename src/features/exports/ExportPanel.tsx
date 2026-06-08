interface ExportPanelProps {
  title: string;
  description?: string;
  onExportCSV: () => void;
  onExportJSON: () => void;
  disabled?: boolean;
}

export default function ExportPanel({ title, description, onExportCSV, onExportJSON, disabled }: ExportPanelProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-heading font-bold">{title}</h3>
          {description && <p className="text-sm text-[var(--color-muted)] mt-1">{description}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onExportCSV}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span role="img" aria-label="CSV">📄</span> CSV
          </button>
          <button
            onClick={onExportJSON}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-opacity-80 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span role="img" aria-label="JSON">{"{}"}</span> JSON
          </button>
        </div>
      </div>
    </div>
  );
}
