import { useNavigate, useParams } from 'react-router-dom';
import { useTournamentStore } from '../../store';

export default function RouletteScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const currentSession = useTournamentStore(state => state.currentSession);
  const participants = useTournamentStore(state => state.participants);
  const assignments = useTournamentStore(state => state.getAssignmentsForCurrentSession());

  // Participantes que no tienen asignación en la sesión actual
  const pendingParticipants = participants.filter(p => 
    !assignments.some(a => a.participant_id === p.id)
  );
  const currentParticipant = pendingParticipants.length > 0 ? pendingParticipants[0] : null;

  if (!currentSession || participants.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-2xl font-heading font-bold mb-4">No hay sesión activa</h2>
        <p className="text-[var(--color-muted)] mb-8">Debes registrar participantes primero para iniciar el sorteo.</p>
        <button 
          onClick={() => navigate(`/municipal/${id}/registro`)}
          className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity"
        >
          Ir a Registro
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h2 className="text-3xl font-heading font-bold mb-2">Mundial FC 26</h2>
      <p className="text-[var(--color-muted)] mb-12">Sorteo de Selecciones - {currentSession.name}</p>
      
      <div className="w-64 h-64 border-4 border-[var(--color-primary)] rounded-full flex flex-col items-center justify-center mb-8 relative shadow-[0_0_30px_rgba(102,58,243,0.3)] bg-[var(--color-surface)]">
        <div className="text-sm text-[var(--color-muted)] font-mono mb-2">Participante</div>
        <div className="text-xl font-bold text-center px-4">
          {currentParticipant ? currentParticipant.display_name : 'Sorteo Completado'}
        </div>
      </div>
      
      <button 
        disabled={true}
        className="bg-[#3f4959] text-[var(--color-muted)] px-8 py-3 rounded-[2px] font-bold text-lg cursor-not-allowed shadow-none border border-[var(--color-border)]"
      >
        Girar Ruleta (Pendiente de Implementación)
      </button>
    </div>
  );
}
