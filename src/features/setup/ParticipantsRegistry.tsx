export default function ParticipantsRegistry() {
  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-4">Registro de Participantes</h2>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <p className="text-[var(--color-muted)] text-sm mb-4">Agrega los jugadores de este municipio (mínimo 8, máximo 32).</p>
        <textarea 
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[2px] p-3 text-[var(--color-text)] mb-4" 
          rows={5} 
          placeholder="Pega la lista de nombres aquí..."
        ></textarea>
        <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity">
          Validar Lista
        </button>
      </div>
    </div>
  );
}
