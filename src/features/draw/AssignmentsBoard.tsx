import { useNavigate, useParams } from 'react-router-dom';
import { useTournamentStore } from '../../store';

export default function AssignmentsBoard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const currentSession = useTournamentStore(state => state.currentSession);
  const allParticipants = useTournamentStore(state => state.participants);
  const allAssignments = useTournamentStore(state => state.assignments);
  const teams = useTournamentStore(state => state.teams);

  const participants = allParticipants
    .filter(p => p.session_id === currentSession?.id)
    .sort((a, b) => (a.turn_order || 0) - (b.turn_order || 0));
  
  const assignments = allAssignments.filter(a => a.session_id === currentSession?.id);

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

  const assignedCount = assignments.length;
  const totalCount = participants.length;
  const pendingCount = totalCount - assignedCount;

  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <h2 className="text-2xl font-heading font-bold">Tablero de Asignaciones</h2>
        <div className="flex items-center gap-3">
          {currentSession?.status === 'draw_completed' && (
            <>
              <span className="bg-[var(--color-success)] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Sorteo completado
              </span>
              {id && (
                <button 
                  onClick={() => navigate(`/municipal/${id}/bracket`)}
                  className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-1.5 rounded-[2px] text-sm font-medium hover:bg-opacity-90 transition-opacity"
                >
                  Ir a Bracket Municipal
                </button>
              )}
            </>
          )}
          {currentSession && currentSession.status !== 'draw_completed' && id && (
            <button 
              onClick={() => navigate(`/municipal/${id}/ruleta`)}
              className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-1.5 rounded-[2px] text-sm font-medium hover:bg-opacity-90 transition-opacity"
            >
              Volver a Ruleta
            </button>
          )}
        </div>
      </div>
      
      <p className="text-xs text-[var(--color-muted)] mb-6 italic">
        ℹ️ Datos guardados localmente en este navegador.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col items-center">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Total</div>
          <div className="text-2xl font-bold">{totalCount}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-success)] border-opacity-30 rounded-xl p-4 flex flex-col items-center">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Asignados</div>
          <div className="text-2xl font-bold text-[var(--color-success)]">{assignedCount}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col items-center">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Pendientes</div>
          <div className="text-2xl font-bold">{pendingCount}</div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[#142e1d]">
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
                <tr key={participant.id} className="border-b border-[var(--color-border)] hover:bg-[#142e1d] transition-colors">
                  <td className="p-4 text-[var(--color-muted)] font-mono">{participant.turn_order || index + 1}</td>
                  <td className="p-4 font-medium">{participant.display_name}</td>
                  <td className="p-4 text-[var(--color-primary)] font-bold">{team ? team.name : '—'}</td>
                  <td className="p-4">
                    {team ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-[6px] text-xs font-medium bg-[var(--color-success)] text-white">
                        Asignado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-[6px] text-xs font-medium bg-[#1b4028] text-[var(--color-text)]">
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
