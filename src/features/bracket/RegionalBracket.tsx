import { useParams, useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../../store';
import { initialRegions } from '../../data/regions';

const getErrorMessage = (err: unknown) => err instanceof Error ? err.message : 'Ocurrió un error inesperado.';

export default function RegionalBracket() {
  const { regionId } = useParams();
  const navigate = useNavigate();

  const getRegionReadiness = useTournamentStore(state => state.getRegionReadiness);
  const currentSession = useTournamentStore(state => state.currentSession);
  const bracket = useTournamentStore(state => state.bracket);
  const matches = useTournamentStore(state => state.matches);
  const participants = useTournamentStore(state => state.participants);
  const getTeamById = useTournamentStore(state => state.getTeamById);

  const createRegionalSession = useTournamentStore(state => state.createRegionalSession);
  const generateRegionalBracket = useTournamentStore(state => state.generateRegionalBracket);
  const createCompletedRegionalResult = useTournamentStore(state => state.createCompletedRegionalResult);
  const resetActiveSession = useTournamentStore(state => state.resetActiveSession);

  if (!regionId) return null;

  const region = initialRegions.find(r => r.id === regionId);
  if (!region) return null;

  const readiness = getRegionReadiness(regionId);

  if (!readiness.isReady || readiness.actualQualifiedPlayers !== readiness.expectedQualifiedPlayers) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-[var(--color-surface)] border border-red-500/50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">La región aún no está lista para bracket.</h2>
          <button onClick={() => navigate(`/regional/${regionId}`)} className="px-6 py-2 border border-[var(--color-border)] rounded hover:bg-[var(--color-surface)] transition-colors">
            Volver al Dashboard Regional
          </button>
        </div>
      </div>
    );
  }

  const isCurrentSessionRegional = currentSession?.region_id === regionId && currentSession?.stage === 'regional';

  const handleCreateSession = () => {
    try {
      createRegionalSession(regionId);
    } catch (e: unknown) {
      alert(getErrorMessage(e));
    }
  };

  const handleGenerateBracket = () => {
    try {
      generateRegionalBracket();
    } catch (e: unknown) {
      alert(getErrorMessage(e));
    }
  };

  const handleCloseRegional = () => {
    try {
      createCompletedRegionalResult();
      resetActiveSession();
      navigate(`/regional/${regionId}`);
    } catch (e: unknown) {
      alert(getErrorMessage(e));
    }
  };

  const finalMatch = matches.find(m => m.round === 'final');
  const isFinalCompleted = finalMatch?.status === 'completed';

  const matchesByRound = matches.reduce((acc, match) => {
    const list = acc[match.round] || [];
    list.push(match);
    acc[match.round] = list;
    return acc;
  }, {} as Record<string, typeof matches>);

  const roundOrder = ['round_32', 'round_16', 'quarterfinal', 'semifinal', 'final'];
  const activeRounds = roundOrder.filter(r => matchesByRound[r]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold">Bracket Regional</h2>
          <p className="text-[var(--color-muted)] mt-1">Región: {region.name}</p>
        </div>
        <button onClick={() => navigate(`/regional/${regionId}`)} className="px-4 py-2 border border-[var(--color-border)] rounded hover:bg-[var(--color-surface)] transition-colors text-sm">
          &larr; Dashboard
        </button>
      </div>

      {!isCurrentSessionRegional && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <h3 className="text-2xl font-heading font-bold mb-4">Iniciar Torneo Regional</h3>
          <p className="text-[var(--color-muted)] mb-8">Esto configurará la sesión con los {readiness.actualQualifiedPlayers} clasificados listos.</p>
          <button onClick={handleCreateSession} className="px-8 py-3 bg-[var(--color-primary)] hover:bg-opacity-80 rounded-lg font-bold transition-colors">
            Crear sesión regional
          </button>
        </div>
      )}

      {isCurrentSessionRegional && !bracket && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <h3 className="text-2xl font-heading font-bold mb-4">Sesión lista</h3>
          <p className="text-[var(--color-muted)] mb-8">Hay {participants.length} clasificados importados exitosamente.</p>
          <button onClick={handleGenerateBracket} className="px-8 py-3 bg-[var(--color-primary)] hover:bg-opacity-80 rounded-lg font-bold transition-colors">
            Generar bracket regional
          </button>
        </div>
      )}

      {isCurrentSessionRegional && bracket && (
        <>
          {isFinalCompleted && currentSession?.status === 'completed' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center mb-8">
              <h3 className="text-2xl font-bold text-green-400 mb-4">Torneo Regional Finalizado</h3>
              <p className="text-[var(--color-muted)] mb-6">El campeón y subcampeón han sido definidos. Puedes cerrar esta fase.</p>
              <button onClick={handleCloseRegional} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors">
                Cerrar Torneo Regional
              </button>
            </div>
          )}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 text-center">
              <div className="text-xs text-[var(--color-muted)] uppercase mb-1">Clasificados</div>
              <div className="text-2xl font-bold">{bracket.participant_count}</div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 text-center">
              <div className="text-xs text-[var(--color-muted)] uppercase mb-1">Tamaño Llave</div>
              <div className="text-2xl font-bold">{bracket.bracket_size}</div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 text-center">
              <div className="text-xs text-[var(--color-muted)] uppercase mb-1">BYEs</div>
              <div className="text-2xl font-bold">{bracket.bye_count}</div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 text-center">
              <div className="text-xs text-[var(--color-muted)] uppercase mb-1">Partidos</div>
              <div className="text-2xl font-bold">{matches.length}</div>
            </div>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-8">
            {activeRounds.map(round => (
              <div key={round} className="flex-none w-80">
                <h3 className="text-center font-bold text-[var(--color-muted)] uppercase mb-6">{round.replace('_', ' ')}</h3>
                <div className="space-y-6">
                  {matchesByRound[round].map(match => {
                    const pA = participants.find(p => p.id === match.player_a_id);
                    const pB = participants.find(p => p.id === match.player_b_id);
                    const teamA = match.team_a_id ? getTeamById(match.team_a_id) : null;
                    const teamB = match.team_b_id ? getTeamById(match.team_b_id) : null;

                    return (
                      <div key={match.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--color-border)]">
                          <div className="flex items-center gap-2">
                            {teamA && teamA.flag_asset_url && (
                              <img src={teamA.flag_asset_url} alt="flag" className="w-5 h-4 object-cover rounded-sm" />
                            )}
                            <span className="font-bold">{pA ? pA.display_name : 'Por definir'}</span>
                          </div>
                          {match.status === 'completed' && match.winner_id === match.player_a_id && (
                            <span className="text-green-400 text-xs font-bold">GANADOR</span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            {teamB && teamB.flag_asset_url ? (
                              <img src={teamB.flag_asset_url} alt="flag" className="w-5 h-4 object-cover rounded-sm" />
                            ) : pB ? (
                              <div className="w-5 h-4 bg-gray-700 rounded-sm"></div>
                            ) : null}
                            <span className="font-bold text-[var(--color-muted)]">
                              {!match.player_b_id && match.status === 'completed' ? 'BYE' : pB ? pB.display_name : 'Por definir'}
                            </span>
                          </div>
                        </div>

                        {match.status === 'ready' && match.player_a_id && match.player_b_id && (
                          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                            <button 
                              onClick={() => navigate(`/regional/${regionId}/partido/${match.id}`)}
                              className="w-full py-2 bg-[var(--color-primary)] hover:bg-opacity-80 text-white text-sm font-bold rounded transition-colors"
                            >
                              Capturar Marcador
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
