import { useNavigate, useParams } from 'react-router-dom';
import { useTournamentStore } from '../../store';

export default function MunicipalBracket() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const currentSession = useTournamentStore(state => state.currentSession);
  const bracket = useTournamentStore(state => state.bracket);
  const matchesByRound = useTournamentStore(state => state.getMatchesByRound());
  const participants = useTournamentStore(state => state.participants);
  const generateMunicipalBracket = useTournamentStore(state => state.generateMunicipalBracket);
  const getParticipantTeam = useTournamentStore(state => state.getParticipantTeam);

  if (!currentSession) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-danger)] rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold text-[var(--color-danger)] mb-2">No hay sesión</h2>
        <p className="text-[var(--color-muted)] mb-4">Debes iniciar y completar el sorteo primero.</p>
        <button 
          onClick={() => navigate(`/municipal/${id}/registro`)}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-[2px] font-medium"
        >
          Ir a Registro
        </button>
      </div>
    );
  }

  const validStatuses = ['draw_completed', 'bracket_ready', 'bracket_active'];
  if (!validStatuses.includes(currentSession.status)) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold mb-2">Sorteo Incompleto</h2>
        <p className="text-[var(--color-muted)] mb-4">Primero debe completarse el sorteo de selecciones.</p>
        <button 
          onClick={() => navigate(`/municipal/${id}/ruleta`)}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-[2px] font-medium"
        >
          Ir a Ruleta
        </button>
      </div>
    );
  }

  if (currentSession.status === 'draw_completed' && !bracket) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-3xl font-heading font-bold mb-4">Bracket Municipal</h2>
        <p className="text-[var(--color-muted)] mb-8">El sorteo ha concluido. Es momento de generar las llaves del torneo.</p>
        <button 
          onClick={() => generateMunicipalBracket()}
          className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-[2px] font-bold text-lg hover:bg-opacity-90 transition-opacity"
        >
          Generar bracket municipal
        </button>
      </div>
    );
  }

  if (!bracket) return null;

  const totalMatches = Object.values(matchesByRound).flat().length;
  
  const getChampionAndRunnerUp = useTournamentStore(state => state.getChampionAndRunnerUp);
  const { champion, runnerUp } = currentSession.status === 'completed' ? getChampionAndRunnerUp() : { champion: null, runnerUp: null };

  const orderedRounds = ['round_32', 'round_16', 'quarterfinal', 'semifinal', 'final'];
  const activeRounds = orderedRounds.filter(r => matchesByRound[r] && matchesByRound[r].length > 0);

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-heading font-bold">Bracket Municipal</h2>
        <span className="bg-[#252a33] text-[var(--color-muted)] px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-[var(--color-border)]">
          Fase: {bracket.bracket_size === 32 ? '16vos' : bracket.bracket_size === 16 ? 'Octavos' : 'Cuartos'}
        </span>
      </div>

      {currentSession.status === 'completed' && champion && (
        <div className="mb-8 bg-[rgba(38,150,132,0.1)] border border-[var(--color-success)] rounded-xl p-6 text-center shadow-[0_0_20px_rgba(38,150,132,0.2)] animate-fade-in">
          <h3 className="text-2xl font-bold text-[var(--color-success)] mb-2 uppercase tracking-widest font-heading">Campeón Municipal</h3>
          <div className="text-3xl font-bold text-white mb-2">{champion.display_name}</div>
          <div className="text-[var(--color-accent)] font-bold">{getParticipantTeam(champion.id)?.name}</div>
          
          {runnerUp && (
            <div className="mt-6 pt-6 border-t border-[rgba(38,150,132,0.2)]">
              <div className="text-sm text-[var(--color-muted)] uppercase tracking-wider mb-1">Subcampeón</div>
              <div className="text-lg font-bold text-[var(--color-text)]">{runnerUp.display_name}</div>
              <div className="text-sm text-[var(--color-accent)] font-medium">{getParticipantTeam(runnerUp.id)?.name}</div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col items-center">
          <div className="text-xs text-[var(--color-muted)] font-mono mb-1 uppercase">Participantes</div>
          <div className="text-xl font-bold">{bracket.participant_count}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col items-center">
          <div className="text-xs text-[var(--color-muted)] font-mono mb-1 uppercase">Tamaño Bracket</div>
          <div className="text-xl font-bold">{bracket.bracket_size}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col items-center">
          <div className="text-xs text-[var(--color-muted)] font-mono mb-1 uppercase">Byes</div>
          <div className="text-xl font-bold text-[var(--color-accent)]">{bracket.bye_count}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col items-center">
          <div className="text-xs text-[var(--color-muted)] font-mono mb-1 uppercase">Partidos</div>
          <div className="text-xl font-bold text-[var(--color-primary)]">{totalMatches}</div>
        </div>
      </div>

      <div className="space-y-8">
        {activeRounds.map((round) => {
          const matches = matchesByRound[round];
          return (
          <div key={round} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 font-heading uppercase text-[var(--color-primary)]">{round.replace('_', ' ')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map(match => {
                const pA = match.player_a_id ? participants.find(p => p.id === match.player_a_id) : undefined;
                const teamA = match.player_a_id ? getParticipantTeam(match.player_a_id) : undefined;
                
                const pB = match.player_b_id ? participants.find(p => p.id === match.player_b_id) : undefined;
                const teamB = match.player_b_id ? getParticipantTeam(match.player_b_id) : undefined;
                
                // Un match pending que corresponde a la primera ronda y tiene playerA pero no B es un bye de la generación
                const isFirstRound = round === activeRounds[0];
                const isBye = isFirstRound && match.player_a_id && !match.player_b_id;

                return (
                  <div key={match.id} className="border border-[var(--color-border)] rounded-lg p-4 bg-[#1a1d24] flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono text-[var(--color-muted)] bg-[#252a33] px-2 py-1 rounded">Match {match.match_number}</span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        match.status === 'completed' ? 'bg-[var(--color-success)] text-white' :
                        match.status === 'ready' ? 'bg-[var(--color-primary)] text-white' :
                        isBye ? 'bg-[var(--color-accent)] text-[#05060f]' : 'bg-[#3f4959] text-white'
                      }`}>
                        {isBye && match.status !== 'completed' ? 'BYE' : match.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center bg-[var(--color-bg)] p-2 rounded border border-[var(--color-border)] border-l-4 border-l-[var(--color-primary)]">
                        <div className="flex-1 truncate">
                          <span className="font-medium">{pA?.display_name || 'Pendiente'}</span>
                          <div className="text-xs text-[var(--color-accent)] font-bold">{teamA?.name || ''}</div>
                        </div>
                        {match.status === 'completed' && match.regular_score_a !== null && (
                          <div className="text-xl font-bold ml-4">{match.regular_score_a}</div>
                        )}
                      </div>
                      
                      {isBye ? (
                        <div className="flex justify-between items-center bg-[var(--color-bg)] p-2 rounded border border-[var(--color-border)] border-dashed opacity-50">
                          <span className="font-medium text-[var(--color-muted)]">BYE</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center bg-[var(--color-bg)] p-2 rounded border border-[var(--color-border)] border-l-4 border-l-[#3f4959]">
                          <div className="flex-1 truncate">
                            <span className="font-medium">{pB?.display_name || 'Pendiente'}</span>
                            <div className="text-xs text-[var(--color-accent)] font-bold">{teamB?.name || ''}</div>
                          </div>
                          {match.status === 'completed' && match.regular_score_b !== null && (
                            <div className="text-xl font-bold ml-4">{match.regular_score_b}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {match.status === 'completed' ? (
                      <button 
                        onClick={() => navigate(`/municipal/${id}/partido/${match.id}`)}
                        className="w-full bg-transparent border border-[var(--color-border)] text-[var(--color-text)] py-2 rounded-[2px] font-medium text-sm hover:bg-[#3f4959] transition-colors"
                      >
                        Ver resultado
                      </button>
                    ) : match.status === 'ready' ? (
                      <button 
                        onClick={() => navigate(`/municipal/${id}/partido/${match.id}`)}
                        className="w-full bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] py-2 rounded-[2px] font-medium text-sm hover:bg-[rgba(102,58,243,0.1)] transition-colors"
                      >
                        Capturar marcador
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="w-full bg-[#3f4959] text-[var(--color-muted)] py-2 rounded-[2px] font-medium text-sm cursor-not-allowed border border-[var(--color-border)]"
                      >
                        {isBye ? 'BYE / Avance automático' : 'Esperando rival'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
