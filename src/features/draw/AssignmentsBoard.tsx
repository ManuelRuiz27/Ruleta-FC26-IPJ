export default function AssignmentsBoard() {
  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Tablero de Asignaciones</h2>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[#252a33]">
              <th className="p-4 text-sm font-mono text-[var(--color-muted)]">Turno</th>
              <th className="p-4 text-sm font-mono text-[var(--color-muted)]">Participante</th>
              <th className="p-4 text-sm font-mono text-[var(--color-muted)]">Selección</th>
              <th className="p-4 text-sm font-mono text-[var(--color-muted)]">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--color-border)] hover:bg-[#252a33] transition-colors">
              <td className="p-4">1</td>
              <td className="p-4">Carlos López</td>
              <td className="p-4">Argentina</td>
              <td className="p-4">
                <span className="inline-flex items-center px-2 py-1 rounded-[6px] text-xs font-medium bg-[var(--color-success)] text-white">
                  Asignado
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
