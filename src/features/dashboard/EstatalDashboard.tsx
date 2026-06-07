export default function EstatalDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Dashboard Estatal</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
            <div className="text-sm text-[var(--color-muted)] font-mono mb-1">KPI {i}</div>
            <div className="text-3xl font-bold">0</div>
          </div>
        ))}
      </div>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h3 className="text-lg font-heading mb-4">Estado de Municipios</h3>
        <p className="text-[var(--color-muted)] text-sm">Contenido pendiente...</p>
      </div>
    </div>
  );
}
