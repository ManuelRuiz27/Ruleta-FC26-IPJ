export default function MunicipalSetup() {
  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-4">Configuración Municipal</h2>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <p className="text-[var(--color-muted)] text-sm mb-4">Selecciona el municipio y prepara el torneo.</p>
        <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity">
          Validar Participantes
        </button>
      </div>
    </div>
  );
}
