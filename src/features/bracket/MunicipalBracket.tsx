import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTournamentStore } from '../../store';
import ExportPanel from '../exports/ExportPanel';
import { exportToCSV, exportToJSON } from '../../lib/utils/exportUtils';
import html2canvas from 'html2canvas';
import { municipalRoute, resolveMunicipalEventId } from '../../lib/municipalRoutes';

export default function MunicipalBracket() {
  const { id, eventId } = useParams<{ id: string; eventId?: string }>();
  const navigate = useNavigate();
  const activeEventId = resolveMunicipalEventId(id, eventId);
  const bracketRef = useRef<HTMLDivElement>(null);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const handleExportImage = async () => {
    if (!bracketRef.current) return;
    try {
      setIsExportingImage(true);
      const canvas = await html2canvas(bracketRef.current, {
        backgroundColor: '#040906',
        scale: 2,
        useCORS: true,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `MundialFC26-Bracket-${id}.png`;
      link.click();
    } catch (err) {
      console.error('Error al exportar imagen:', err);
      alert('Error al generar la imagen del bracket.');
    } finally {
      setIsExportingImage(false);
    }
  };
  
  const currentSession = useTournamentStore(state => state.currentSession);
  const bracket = useTournamentStore(state => state.bracket);
  const getMatchesByRound = useTournamentStore(state => state.getMatchesByRound);
  const matchesByRound = getMatchesByRound();
  
  const participants = useTournamentStore(state => state.participants);
  const generateMunicipalBracket = useTournamentStore(state => state.generateMunicipalBracket);
  const getParticipantTeam = useTournamentStore(state => state.getParticipantTeam);
  const getChampionAndRunnerUp = useTournamentStore(state => state.getChampionAndRunnerUp);
  const getQualifiedPlayersForCurrentSession = useTournamentStore(state => state.getQualifiedPlayersForCurrentSession);
  const completedMunicipalResults = useTournamentStore(state => state.completedMunicipalResults);

  if (!currentSession) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-danger)] rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold text-[var(--color-danger)] mb-2">No hay sesión</h2>
        <p className="text-[var(--color-muted)] mb-4">Debes iniciar y completar el sorteo primero.</p>
        <button 
          onClick={() => navigate(municipalRoute(id!, activeEventId, 'registro'))}
          className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-2 rounded-[2px] font-medium"
        >
          Ir a Registro
        </button>
      </div>
    );
  }

  const validStatuses = ['draw_completed', 'bracket_ready', 'bracket_active', 'completed'];
  if (!validStatuses.includes(currentSession.status)) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold mb-2">Sorteo Incompleto</h2>
        <p className="text-[var(--color-muted)] mb-4">Primero debe completarse el sorteo de selecciones.</p>
        <button 
          onClick={() => navigate(municipalRoute(id!, activeEventId, 'ruleta'))}
          className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-2 rounded-[2px] font-medium"
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
          className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-8 py-3 rounded-[2px] font-bold text-lg hover:bg-opacity-90 transition-opacity"
        >
          Generar bracket municipal
        </button>
      </div>
    );
  }

  if (!bracket) return null;

  const totalMatches = Object.values(matchesByRound).flat().length;
  
  const { champion, runnerUp } = currentSession.status === 'completed' ? getChampionAndRunnerUp() : { champion: null, runnerUp: null };
  const qualifiedPlayers = currentSession.status === 'completed' ? getQualifiedPlayersForCurrentSession() : [];

  const orderedRounds = ['round_32', 'round_16', 'quarterfinal', 'semifinal', 'final'];
  const activeRounds = orderedRounds.filter(r => matchesByRound[r] && matchesByRound[r].length > 0);

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-heading font-bold">Bracket Municipal</h2>
        <div className="flex items-center gap-4">
          <span className="bg-[#142e1d] text-[var(--color-muted)] px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-[var(--color-border)]">
            Fase: {bracket.bracket_size === 32 ? '16vos' : bracket.bracket_size === 16 ? 'Octavos' : 'Cuartos'}
          </span>
          <button 
            onClick={handleExportImage}
            disabled={isExportingImage}
            className="text-xs bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-2 rounded-[2px] font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {isExportingImage ? 'Generando...' : '📷 Descargar Imagen'}
          </button>
        </div>
      </div>

      <div ref={bracketRef} className="bg-[var(--color-bg)] p-4 -m-4 rounded-xl">
        <div className="mb-6 flex justify-center">
          <img src="/icono oficial/Recurso 6.png" alt="IPJ" className="h-10 opacity-50" />
        </div>

      {currentSession.status === 'completed' && champion && (() => {
        const champTeam = getParticipantTeam(champion.id);
        const runnerTeam = runnerUp ? getParticipantTeam(runnerUp.id) : null;
        return (
        <div className="mb-8 bg-[rgba(38,150,132,0.1)] border border-[var(--color-success)] rounded-xl p-8 text-center shadow-[0_0_30px_rgba(38,150,132,0.3)] animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -ml-[100px] w-[200px] h-[200px] bg-[var(--color-success)] opacity-20 blur-[80px] rounded-full pointer-events-none" />
          
          <h3 className="text-2xl font-bold text-[var(--color-success)] mb-4 uppercase tracking-widest font-heading drop-shadow-md">Campeón Municipal</h3>
          
          <div className="flex flex-col items-center justify-center mb-6 animate-[bounce_1s_ease-in-out_infinite] hover:animate-none transition-transform hover:scale-110">
            {champTeam?.flag_asset_url && (
              <img src={champTeam.flag_asset_url} alt={champTeam.name} className="w-24 h-16 rounded shadow-[0_0_15px_rgba(255,255,255,0.2)] border-2 border-white/20 mb-3 object-cover" />
            )}
            <div className="text-4xl font-bold text-white mb-1 drop-shadow-lg">{champion.display_name}</div>
            <div className="text-xl text-[var(--color-primary)] font-bold">{champTeam?.name}</div>
          </div>
          
          {runnerUp && (
            <div className="mt-8 pt-6 border-t border-[rgba(38,150,132,0.3)]">
              <div className="text-sm text-[var(--color-muted)] uppercase tracking-wider mb-3">Subcampeón</div>
              <div className="flex flex-col items-center justify-center transition-transform hover:scale-105">
                {runnerTeam?.flag_asset_url && (
                  <img src={runnerTeam.flag_asset_url} alt={runnerTeam.name} className="w-16 h-10 rounded shadow-md border border-white/20 mb-2 object-cover" />
                )}
                <div className="text-xl font-bold text-[var(--color-text)]">{runnerUp.display_name}</div>
                <div className="text-md text-[var(--color-primary)] font-medium">{runnerTeam?.name}</div>
              </div>
            </div>
          )}

          {qualifiedPlayers.length > 0 && (
            <div className="mt-8 pt-8 border-t border-[rgba(38,150,132,0.3)] text-left relative z-10">
              <h4 className="text-sm text-[var(--color-success)] uppercase tracking-wider mb-4 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" /> Clasificados regionales generados
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {qualifiedPlayers.map(qp => {
                  const p = participants.find(p => p.id === qp.participant_id);
                  const t = getParticipantTeam(qp.participant_id);
                  return (
                    <div key={qp.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 flex items-center gap-4 hover:border-[var(--color-success)] transition-colors group cursor-default">
                      {t?.flag_asset_url && (
                        <img src={t.flag_asset_url} alt={t.name} className="w-12 h-8 rounded-sm object-cover border border-white/10 group-hover:scale-110 transition-transform" />
                      )}
                      <div>
                        <div className="text-xs text-[var(--color-muted)] font-mono uppercase mb-1">{qp.rank === 'champion' ? '🏆 Campeón' : '🥈 Subcampeón'}</div>
                        <div className="font-bold text-white text-md">{p?.display_name}</div>
                        <div className="text-[var(--color-primary)] font-medium text-xs">{t?.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        );
      })()}

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
          <div className="text-xl font-bold text-[var(--color-primary)]">{bracket.bye_count}</div>
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
                  <div key={match.id} className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-surface)] flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono text-[var(--color-muted)] bg-[#142e1d] px-2 py-1 rounded">Match {match.match_number}</span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        match.status === 'completed' && !match.player_b_id ? 'bg-[var(--color-primary)] text-[#05060f]' :
                        match.status === 'completed' ? 'bg-[var(--color-success)] text-white' :
                        match.status === 'ready' ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)]' :
                        isBye ? 'bg-[var(--color-primary)] text-[#05060f]' : 'bg-[#1b4028] text-white'
                      }`}>
                        {match.status === 'completed' && !match.player_b_id ? 'BYE Automático' : isBye && match.status !== 'completed' ? 'BYE' : match.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center bg-[var(--color-bg)] p-2 rounded border border-[var(--color-border)] border-l-4 border-l-[var(--color-primary)]">
                        <div className="flex items-center gap-3 flex-1 truncate">
                          {teamA?.flag_asset_url && (
                            <img src={teamA.flag_asset_url} alt={teamA.name} className="w-7 h-5 rounded-sm object-cover border border-white/10 shrink-0" />
                          )}
                          <div className="flex-1 truncate">
                            <span className="font-medium">{pA?.display_name || 'Pendiente'}</span>
                            <div className="text-xs text-[var(--color-primary)] font-bold">{teamA?.name || ''}</div>
                          </div>
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
                        <div className="flex justify-between items-center bg-[var(--color-bg)] p-2 rounded border border-[var(--color-border)] border-l-4 border-l-[#1b4028]">
                          <div className="flex items-center gap-3 flex-1 truncate">
                            {teamB?.flag_asset_url && (
                              <img src={teamB.flag_asset_url} alt={teamB.name} className="w-7 h-5 rounded-sm object-cover border border-white/10 shrink-0" />
                            )}
                            <div className="flex-1 truncate">
                              <span className="font-medium">{pB?.display_name || 'Pendiente'}</span>
                              <div className="text-xs text-[var(--color-primary)] font-bold">{teamB?.name || ''}</div>
                            </div>
                          </div>
                          {match.status === 'completed' && match.regular_score_b !== null && (
                            <div className="text-xl font-bold ml-4">{match.regular_score_b}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {match.status === 'completed' ? (
                      !match.player_b_id ? (
                        <button 
                          disabled
                          className="w-full bg-[#1b4028] text-[var(--color-muted)] py-2 rounded-[2px] font-medium text-sm cursor-not-allowed border border-[var(--color-border)]"
                        >
                          Avance automático por BYE
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate(municipalRoute(id!, activeEventId, `partido/${match.id}`))}
                          className="w-full bg-transparent border border-[var(--color-border)] text-[var(--color-text)] py-2 rounded-[2px] font-medium text-sm hover:bg-[#1b4028] transition-colors"
                        >
                          Ver resultado
                        </button>
                      )
                    ) : match.status === 'ready' ? (
                      <button 
                        onClick={() => navigate(municipalRoute(id!, activeEventId, `partido/${match.id}`))}
                        className="w-full bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] py-2 rounded-[2px] font-medium text-sm hover:bg-[rgba(139,197,63,0.1)] transition-colors"
                      >
                        Capturar marcador
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="w-full bg-[#1b4028] text-[var(--color-muted)] py-2 rounded-[2px] font-medium text-sm cursor-not-allowed border border-[var(--color-border)]"
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

      {currentSession.status === 'completed' && (
        <div className="mt-8">
          <ExportPanel 
            title="Exportar Resultado Municipal" 
            description="Descarga el resultado oficial y detalles de los clasificados de este municipio."
            onExportCSV={() => {
              const res = completedMunicipalResults.find(r => r.municipal_event_id === activeEventId || (!r.municipal_event_id && r.municipality_id === id));
              if (res) exportToCSV(`resultado_municipal_${id}`, [res]);
            }}
            onExportJSON={() => {
              const res = completedMunicipalResults.find(r => r.municipal_event_id === activeEventId || (!r.municipal_event_id && r.municipality_id === id));
              if (res) exportToJSON(`resultado_municipal_${id}`, [res]);
            }}
            disabled={!completedMunicipalResults.some(r => r.municipal_event_id === activeEventId || (!r.municipal_event_id && r.municipality_id === id))}
          />
        </div>
      )}
    </div>
  );
}
