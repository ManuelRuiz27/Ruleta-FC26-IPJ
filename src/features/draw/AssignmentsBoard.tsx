import { useTournamentStore } from '../../store';

export default function AssignmentsBoard() {
  const participants = useTournamentStore(state => state.participants);
  const assignments = useTournamentStore(state => state.getAssignmentsForCurrentSession());
  const teams = useTournamentStore(state => state.teams);

  if (participants.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-heading font-bold mb-6">Tablero de Asignaciones</h2>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center">
          <p className="text-[var(--color-muted)]">Aún no hay participantes registrados para esta sesión.</p>
        </div>
      </div>
    );
  }

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
            {participants.map((participant, index) => {
              const assignment = assignments.find(a => a.participant_id === participant.id);
              const team = assignment ? teams.find(t => t.id === assignment.team_id) : null;
              
              return (
                <tr key={participant.id} className="border-b border-[var(--color-border)] hover:bg-[#252a33] transition-colors">
                  <td className="p-4">{participant.turn_order || index + 1}</td>
                  <td className="p-4 font-medium">{participant.display_name}</td>
                  <td className="p-4 text-[var(--color-accent)]">{team ? team.name : '—'}</td>
                  <td className="p-4">
                    {team ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-[6px] text-xs font-medium bg-[var(--color-success)] text-white">
                        Asignado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-[6px] text-xs font-medium bg-[#3f4959] text-[var(--color-text)]">
                        Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
