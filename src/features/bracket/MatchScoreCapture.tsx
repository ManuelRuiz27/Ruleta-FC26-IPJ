import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTournamentStore } from '../../store';

export default function MatchScoreCapture() {
  const { id, regionId, matchId } = useParams<{ id?: string, regionId?: string, matchId: string }>();
  const navigate = useNavigate();
  
  const isState = window.location.pathname.includes('/estatal');
  const backUrl = isState ? '/estatal/bracket' : regionId ? `/regional/${regionId}/bracket` : `/municipal/${id}/bracket`;
  
  const getMatchById = useTournamentStore(state => state.getMatchById);
  const participants = useTournamentStore(state => state.participants);
  const teams = useTournamentStore(state => state.teams);
  const submitMatchResult = useTournamentStore(state => state.submitMatchResult);
  
  const match = matchId ? getMatchById(matchId) : undefined;
  
  const [scoreA, setScoreA] = useState<number | ''>('');
  const [scoreB, setScoreB] = useState<number | ''>('');
  const [extraTime, setExtraTime] = useState(false);
  const [penalties, setPenalties] = useState(false);
  const [penScoreA, setPenScoreA] = useState<number | ''>('');
  const [penScoreB, setPenScoreB] = useState<number | ''>('');
  const [manualWinnerId, setManualWinnerId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!match) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-danger)] rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold text-[var(--color-danger)] mb-2">Partido no encontrado</h2>
        <button 
          onClick={() => navigate(backUrl)}
          className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-2 rounded-[2px] font-medium mt-4"
        >
          Volver al Bracket
        </button>
      </div>
    );
  }

  const pA = participants.find(p => p.id === match.player_a_id);
  const tA = teams.find(t => t.id === match.team_a_id);
  const pB = participants.find(p => p.id === match.player_b_id);
  const tB = teams.find(t => t.id === match.team_b_id);

  if (!pA) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold mb-2">Partido no listo</h2>
        <p className="text-[var(--color-muted)] mb-4">Aún falta definir a los jugadores para este partido.</p>
        <button 
          onClick={() => navigate(backUrl)}
          className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-2 rounded-[2px] font-medium"
        >
          Volver al Bracket
        </button>
      </div>
    );
  }

  const isBye = !match.player_b_id;

  if (match.status === 'completed' && isBye) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center">
        <h2 className="text-2xl font-heading font-bold mb-4 text-[var(--color-primary)]">Avance automático por BYE</h2>
        <div className="bg-[var(--color-surface)] p-6 rounded-lg mb-6 border border-[var(--color-border)] inline-block">
          <div className="text-xl font-bold text-white mb-2">{pA.display_name}</div>
          <div className="text-[var(--color-primary)] font-medium">{tA?.name}</div>
        </div>
        <div>
          <button 
            onClick={() => navigate(backUrl)}
            className="w-full bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-2 rounded-[2px] font-medium"
          >
            Volver al Bracket
          </button>
        </div>
      </div>
    );
  }

  if (match.status === 'pending') {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 text-center">
        <h2 className="text-xl font-heading font-bold mb-2 text-[var(--color-primary)]">Partido pendiente de rival</h2>
        <p className="text-[var(--color-muted)] mb-6">Aún falta que se resuelvan los partidos anteriores para conocer a ambos contrincantes.</p>
        <button 
          onClick={() => navigate(backUrl)}
          className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-2 rounded-[2px] font-medium"
        >
          Volver al Bracket
        </button>
      </div>
    );
  }

  if (match.status === 'completed' && pB && tB) {
    const winner = match.winner_id === pA.id ? pA : pB;
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-2xl font-heading font-bold mb-4">Resultado de Partido</h2>
        
        <div className="grid grid-cols-3 gap-4 items-center mb-6 bg-[var(--color-surface)] p-4 rounded-lg">
          <div className="text-center">
            <div className="font-medium">{pA.display_name}</div>
            <div className="text-[var(--color-primary)] font-bold text-sm">{tA?.name}</div>
            <div className="text-3xl font-bold mt-2">{match.regular_score_a}</div>
            {match.penalties_played && <div className="text-[var(--color-muted)] text-sm">Pen: {match.penalties_score_a}</div>}
          </div>
          <div className="text-center font-bold text-[var(--color-muted)]">VS</div>
          <div className="text-center">
            <div className="font-medium">{pB.display_name}</div>
            <div className="text-[var(--color-primary)] font-bold text-sm">{tB?.name}</div>
            <div className="text-3xl font-bold mt-2">{match.regular_score_b}</div>
            {match.penalties_played && <div className="text-[var(--color-muted)] text-sm">Pen: {match.penalties_score_b}</div>}
          </div>
        </div>
        
        <div className="text-center mb-6">
          <div className="text-sm text-[var(--color-muted)] uppercase tracking-wider mb-1">Ganador</div>
          <div className="text-xl font-bold text-[var(--color-success)]">{winner?.display_name}</div>
        </div>

        <button 
          onClick={() => navigate(backUrl)}
          className="w-full bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-2 rounded-[2px] font-medium"
        >
          Volver al Bracket
        </button>
      </div>
    );
  }

  if (!pB || !tB) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold mb-2">Error</h2>
        <p className="text-[var(--color-muted)] mb-4">Faltan datos del rival.</p>
        <button onClick={() => navigate(backUrl)} className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-2 rounded-[2px] font-medium">Volver</button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (scoreA === '' || scoreB === '') {
      setErrorMsg('Debe ingresar el marcador regular');
      return;
    }
    if (scoreA < 0 || scoreB < 0) {
      setErrorMsg('Los marcadores no pueden ser negativos');
      return;
    }

    let winnerId = '';
    
    if (scoreA !== scoreB) {
      winnerId = scoreA > scoreB ? pA.id : pB.id;
    } else {
      if (!extraTime) {
        setErrorMsg('Un empate requiere tiempos extra');
        return;
      }
      if (penalties) {
        if (penScoreA === '' || penScoreB === '') {
          setErrorMsg('Debe ingresar el marcador de penales');
          return;
        }
        if (penScoreA === penScoreB) {
          setErrorMsg('Los penales no pueden terminar en empate');
          return;
        }
        winnerId = penScoreA > penScoreB ? pA.id : pB.id;
      } else {
        if (!manualWinnerId) {
          setErrorMsg('Debe seleccionar quién ganó en tiempos extra');
          return;
        }
        winnerId = manualWinnerId;
      }
    }

    try {
      submitMatchResult({
        matchId: match.id,
        regularScoreA: Number(scoreA),
        regularScoreB: Number(scoreB),
        extraTimePlayed: extraTime,
        penaltiesPlayed: penalties,
        penaltiesScoreA: penalties ? Number(penScoreA) : null,
        penaltiesScoreB: penalties ? Number(penScoreB) : null,
        winnerId
      });
      navigate(backUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el marcador');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-heading font-bold mb-6">Capturar Marcador</h2>
      
      <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex justify-between items-center bg-[var(--color-surface)] p-4 rounded-lg mb-6 border border-[var(--color-border)]">
          <div className="flex-1 text-center">
            <div className="font-bold text-lg">{pA.display_name}</div>
            <div className="text-[var(--color-primary)] font-medium mb-3">{tA?.name}</div>
            <input 
              type="number" 
              min="0"
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-20 bg-[#05060f] border border-[var(--color-border)] rounded p-2 text-center text-2xl font-bold"
            />
          </div>
          <div className="text-xl font-bold text-[var(--color-muted)] px-4">VS</div>
          <div className="flex-1 text-center">
            <div className="font-bold text-lg">{pB.display_name}</div>
            <div className="text-[var(--color-primary)] font-medium mb-3">{tB?.name}</div>
            <input 
              type="number" 
              min="0"
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-20 bg-[#05060f] border border-[var(--color-border)] rounded p-2 text-center text-2xl font-bold"
            />
          </div>
        </div>

        {scoreA !== '' && scoreB !== '' && scoreA === scoreB && (
          <div className="mb-6 space-y-4 p-4 border border-[var(--color-primary)] border-opacity-50 rounded-lg bg-[rgba(139,197,63,0.05)]">
            <h4 className="font-bold text-[var(--color-primary)]">Opciones de Empate</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={extraTime} onChange={e => setExtraTime(e.target.checked)} className="rounded" />
              <span>Hubo tiempos extra</span>
            </label>
            
            {extraTime && (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={penalties} onChange={e => setPenalties(e.target.checked)} className="rounded" />
                  <span>Se definió por penales</span>
                </label>
                
                {penalties ? (
                  <div className="flex justify-between items-center mt-4">
                    <input type="number" min="0" placeholder="Penales A" value={penScoreA} onChange={e => setPenScoreA(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-24 bg-[#05060f] border border-[var(--color-border)] rounded p-2 text-center" />
                    <span className="text-[var(--color-muted)]">Resultado Penales</span>
                    <input type="number" min="0" placeholder="Penales B" value={penScoreB} onChange={e => setPenScoreB(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-24 bg-[#05060f] border border-[var(--color-border)] rounded p-2 text-center" />
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-[var(--color-muted)] mb-2">Selecciona quién ganó en tiempos extra:</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-[var(--color-surface)] p-2 rounded flex-1 border border-[var(--color-border)] hover:border-[var(--color-primary)]">
                        <input type="radio" name="winner" value={pA.id} checked={manualWinnerId === pA.id} onChange={() => setManualWinnerId(pA.id)} />
                        <span>{pA.display_name}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-[var(--color-surface)] p-2 rounded flex-1 border border-[var(--color-border)] hover:border-[var(--color-primary)]">
                        <input type="radio" name="winner" value={pB.id} checked={manualWinnerId === pB.id} onChange={() => setManualWinnerId(pB.id)} />
                        <span>{pB.display_name}</span>
                      </label>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 bg-[rgba(240,68,56,0.1)] border border-[var(--color-danger)] text-[var(--color-danger)] px-4 py-3 rounded text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button 
            type="button"
            onClick={() => navigate(backUrl)}
            className="flex-1 bg-transparent border border-[var(--color-border)] text-[var(--color-text)] py-3 rounded-[2px] font-bold hover:bg-[#1b4028] transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="flex-1 bg-[var(--color-primary)] text-[var(--color-primary-content)] py-3 rounded-[2px] font-bold shadow-[0_0_15px_rgba(139,197,63,0.3)] hover:bg-opacity-90 transition-opacity"
          >
            Guardar resultado
          </button>
        </div>
      </form>
    </div>
  );
}
