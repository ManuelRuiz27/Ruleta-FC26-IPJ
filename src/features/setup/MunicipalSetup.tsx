import { useParams, useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../../store';

export default function MunicipalSetup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const getMunicipalityById = useTournamentStore(state => state.getMunicipalityById);
  const getRegionById = useTournamentStore(state => state.getRegionById);
  const currentSession = useTournamentStore(state => state.currentSession);
  const getChampionAndRunnerUp = useTournamentStore(state => state.getChampionAndRunnerUp);
  const getParticipantTeam = useTournamentStore(state => state.getParticipantTeam);
  
  const municipality = id ? getMunicipalityById(id) : undefined;
  const region = municipality ? getRegionById(municipality.region_id) : undefined;

  const sessionExists = currentSession && currentSession.municipality_id === municipality?.id;
  const sessionStatus = sessionExists ? currentSession.status : 'No iniciada';
  const isCompleted = sessionStatus === 'completed';
  const { champion, runnerUp } = isCompleted ? getChampionAndRunnerUp() : { champion: null, runnerUp: null };

  if (!municipality) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-danger)] rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold text-[var(--color-danger)] mb-2">Error</h2>
        <p className="text-[var(--color-muted)]">El municipio seleccionado no existe o no fue encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Configuración Municipal</h2>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Municipio</div>
              <div className="font-bold text-lg">{municipality.name}</div>
            </div>
            <div>
              <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Región</div>
              <div className="font-bold text-lg">{region?.name || 'Desconocida'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Estado de Sesión</div>
              <div className="font-bold">
                <span className={`inline-flex items-center px-2 py-1 rounded-[6px] text-xs font-medium ${isCompleted ? 'bg-[var(--color-success)] text-white' : sessionExists ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)]' : 'bg-[#1b4028] text-[var(--color-text)]'}`}>
                  {isCompleted ? 'Eliminatoria municipal cerrada' : sessionStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {isCompleted && champion && (
          <div className="border-t border-[var(--color-border)] pt-6 mb-6">
            <h3 className="text-lg font-heading font-bold text-[var(--color-success)] mb-4">Clasificados Regionales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]">
                <div className="text-xs text-[var(--color-muted)] font-mono uppercase mb-1">Campeón Municipal</div>
                <div className="font-bold text-lg text-white">{champion.display_name}</div>
                <div className="text-[var(--color-primary)] font-medium text-sm">{getParticipantTeam(champion.id)?.name}</div>
              </div>
              {runnerUp && (
                <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-muted)] font-mono uppercase mb-1">Subcampeón Municipal</div>
                  <div className="font-bold text-lg text-white">{runnerUp.display_name}</div>
                  <div className="text-[var(--color-primary)] font-medium text-sm">{getParticipantTeam(runnerUp.id)?.name}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-[var(--color-border)] pt-6">
          <p className="text-[var(--color-muted)] text-sm mb-4">Acciones disponibles para este municipio:</p>
          {isCompleted ? (
            <button 
              onClick={() => navigate(`/municipal/${municipality.id}/bracket`)}
              className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-6 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity"
            >
              Ver bracket
            </button>
          ) : (
            <button 
              onClick={() => navigate(`/municipal/${municipality.id}/registro`)}
              className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-6 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity"
            >
              Registrar participantes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
