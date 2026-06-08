import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../../store';

export default function StateBracket() {
  const navigate = useNavigate();

  const getStateReadiness = useTournamentStore(state => state.getStateReadiness);
  const currentSession = useTournamentStore(state => state.currentSession);
  const bracket = useTournamentStore(state => state.bracket);
  const matches = useTournamentStore(state => state.matches);
  const participants = useTournamentStore(state => state.participants);
  const getTeamById = useTournamentStore(state => state.getTeamById);

  const createStateSession = useTournamentStore(state => state.createStateSession);
  const generateStateBracket = useTournamentStore(state => state.generateStateBracket);
  const createCompletedStateResult = useTournamentStore(state => state.createCompletedStateResult);
  const clearLocalTournamentState = useTournamentStore(state => state.clearLocalTournamentState);

  const readiness = getStateReadiness();

  if (!readiness.isReady || readiness.actualQualifiedPlayers !== readiness.expectedQualifiedPlayers || readiness.duplicateGroups > 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-[var(--color-surface)] border border-red-500/50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">El estado aún no está listo para iniciar el bracket.</h2>
          <button onClick={() => navigate(`/estatal/dashboard`)} className="px-6 py-2 border border-[var(--color-border)] rounded hover:bg-[var(--color-surface)] transition-colors">
            Volver al Dashboard Estatal
          </button>
        </div>
      </div>
    );
  }

  const isCurrentSessionState = currentSession?.stage === 'state';

  const handleCreateSession = () => {
    try {
      createStateSession();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleGenerateBracket = () => {
    try {
      generateStateBracket();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCloseState = () => {
    try {
      createCompletedStateResult();
      clearLocalTournamentState();
      navigate(`/estatal/dashboard`);
    } catch (e: any) {
      alert(e.message);
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

  const roundOrder = ['round_64', 'round_32', 'round_16', 'quarterfinal', 'semifinal', 'final'];
  const activeRounds = roundOrder.filter(r => matchesByRound[r]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-yellow-400">La Gran Final Estatal</h2>
          <p className="text-[var(--color-muted)] mt-1">Bracket Definitivo</p>
        </div>
        <button onClick={() => navigate(`/estatal/dashboard`)} className="px-4 py-2 border border-[var(--color-border)] rounded hover:bg-[var(--color-surface)] transition-colors text-sm">
          &larr; Dashboard
        </button>
      </div>

      {!isCurrentSessionState && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <h3 className="text-2xl font-heading font-bold mb-4">Iniciar La Gran Final Estatal</h3>
          <p className="text-[var(--color-muted)] mb-8">Esto configurará la sesión con los {readiness.actualQualifiedPlayers} clasificados listos.</p>
          <button onClick={handleCreateSession} className="px-8 py-3 bg-[var(--color-primary)] hover:bg-opacity-80 rounded-lg font-bold transition-colors">
            Crear sesión estatal
          </button>
        </div>
      )}

      {isCurrentSessionState && !bracket && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <h3 className="text-2xl font-heading font-bold mb-4">Sesión lista</h3>
          <p className="text-[var(--color-muted)] mb-8">Hay {participants.length} clasificados importados exitosamente.</p>
          <button onClick={handleGenerateBracket} className="px-8 py-3 bg-[var(--color-primary)] hover:bg-opacity-80 rounded-lg font-bold transition-colors">
            Generar Bracket Estatal
          </button>
        </div>
      )}

      {isCurrentSessionState && bracket && (
        <>
          {isFinalCompleted && currentSession?.status === 'bracket_ready' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center mb-8">
              <h3 className="text-2xl font-bold text-green-400 mb-4">¡Torneo Estatal Finalizado!</h3>
              <p className="text-[var(--color-muted)] mb-6">El Campeón de Campeones ha sido definido.</p>
              <button onClick={handleCloseState} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors">
                Cerrar Torneo y Guardar Resultados
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
                <h3 className="text-center font-bold text-[var(--color-muted)] uppercase mb-6">{round.replace(/_/g, ' ')}</h3>
                <div className="space-y-6">
                  {matchesByRound[round].map(match => {
                    const pA = participants.find(p => p.id === match.player_a_id);
                    const pB = participants.find(p => p.id === match.player_b_id);
                    const teamA = match.team_a_id ? getTeamById(match.team_a_id) : null;
                    const teamB = match.team_b_id ? getTeamById(match.team_b_id) : null;

                    return (
                      <div key={match.id} className={`bg-[var(--color-surface)] border ${match.round === 'final' ? 'border-yellow-500/50' : 'border-[var(--color-border)]'} rounded-lg p-4 relative`}>
                        {match.round === 'final' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-yellow-300">LA GRAN FINAL</div>}
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
                              onClick={() => navigate(`/estatal/partido/${match.id}`)}
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
