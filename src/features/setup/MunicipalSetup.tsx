import { useParams, useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../../store';

export default function MunicipalSetup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const getMunicipalityById = useTournamentStore(state => state.getMunicipalityById);
  const getRegionById = useTournamentStore(state => state.getRegionById);
  const currentSession = useTournamentStore(state => state.currentSession);
  
  const municipality = id ? getMunicipalityById(id) : undefined;
  const region = municipality ? getRegionById(municipality.region_id) : undefined;

  if (!municipality) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-danger)] rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold text-[var(--color-danger)] mb-2">Error</h2>
        <p className="text-[var(--color-muted)]">El municipio seleccionado no existe o no fue encontrado.</p>
      </div>
    );
  }

  const sessionExists = currentSession && currentSession.municipality_id === municipality.id;
  const sessionStatus = sessionExists ? currentSession.status : 'No iniciada';

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
                <span className={`inline-flex items-center px-2 py-1 rounded-[6px] text-xs font-medium ${sessionExists ? 'bg-[var(--color-primary)] text-white' : 'bg-[#3f4959] text-[var(--color-text)]'}`}>
                  {sessionStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-[var(--color-border)] pt-6">
          <p className="text-[var(--color-muted)] text-sm mb-4">Acciones disponibles para este municipio:</p>
          <button 
            onClick={() => navigate(`/municipal/${municipality.id}/registro`)}
            className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity"
          >
            Registrar participantes
          </button>
        </div>
      </div>
    </div>
  );
}
