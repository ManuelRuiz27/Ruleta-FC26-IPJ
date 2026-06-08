import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTournamentStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '../../types';

type WindowWithWebkitAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

const getAudioContext = () => {
  const AudioContextConstructor = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
  return AudioContextConstructor ? new AudioContextConstructor() : null;
};

const getErrorMessage = (err: unknown, fallback: string) => err instanceof Error ? err.message : fallback;

const playTickSound = () => {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
  } catch {
    /* ignore audio errors */
  }
};

const playSuccessSound = () => {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => { 
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(audioCtx.currentTime + i * 0.05);
      oscillator.stop(audioCtx.currentTime + 1.5);
    });
  } catch {
    /* ignore audio errors */
  }
};

export default function RouletteScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const currentSession = useTournamentStore(state => state.currentSession);
  const startDraw = useTournamentStore(state => state.startDraw);
  const assignRandomTeamToParticipant = useTournamentStore(state => state.assignRandomTeamToParticipant);
  const getTeamById = useTournamentStore(state => state.getTeamById);
  const prepareDraftSessionForDraw = useTournamentStore(state => state.prepareDraftSessionForDraw);
  const clearLocalTournamentState = useTournamentStore(state => state.clearLocalTournamentState);

  const allParticipants = useTournamentStore(state => state.participants);
  const assignments = useTournamentStore(state => state.assignments);
  const teams = useTournamentStore(state => state.teams);

  const orderedParticipants = allParticipants
    .filter(p => p.session_id === currentSession?.id)
    .sort((a, b) => (a.turn_order || 0) - (b.turn_order || 0));

  const assignedParticipantIds = assignments
    .filter(a => a.session_id === currentSession?.id)
    .map(a => a.participant_id);

  const pendingParticipants = orderedParticipants.filter(p => !assignedParticipantIds.includes(p.id));

  const assignedTeamIds = assignments
    .filter(a => a.session_id === currentSession?.id)
    .map(a => a.team_id);

  const availableTeams = teams.filter(t => !assignedTeamIds.includes(t.id));

  const currentParticipant = pendingParticipants.length > 0 ? pendingParticipants[0] : null;

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [lastAssignedTeam, setLastAssignedTeam] = useState<Team | null>(null);
  const [lastAssignedParticipant, setLastAssignedParticipant] = useState<typeof currentParticipant>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [wheelTeams, setWheelTeams] = useState<Team[]>([]);
  
  const lastTickAngle = useRef<number>(0);

  useEffect(() => {
    if (!isSpinning && availableTeams.length > 0) {
      const shuffled = [...availableTeams].sort(() => Math.random() - 0.5);
      const display = [];
      for (let i = 0; i < 8; i++) {
        display.push(shuffled[i % shuffled.length]);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWheelTeams(display);
    }
  }, [availableTeams, isSpinning]);

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de reiniciar la sesión local? Se perderán todos los participantes y asignaciones actuales.')) {
      clearLocalTournamentState();
      navigate(`/municipal/${id}/registro`);
    }
  };

  if (!currentSession || orderedParticipants.length < 8) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-2xl font-heading font-bold mb-4">Participantes insuficientes</h2>
        <p className="text-[var(--color-muted)] mb-8">Debes registrar al menos 8 participantes para iniciar el sorteo.</p>
        <button 
          onClick={() => navigate(`/municipal/${id}/registro`)}
          className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-6 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity"
        >
          Ir a Registro
        </button>
      </div>
    );
  }

  if (currentSession.status === 'draft') {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-3xl font-heading font-bold mb-2">Sorteo en borrador</h2>
        <p className="text-[var(--color-muted)] mb-8">Esta sesión necesita preparación antes de iniciar el sorteo.</p>
        <div className="flex gap-4 flex-col items-center">
          <button 
            onClick={() => {
              try {
                prepareDraftSessionForDraw();
              } catch (err: unknown) {
                setErrorMsg(getErrorMessage(err, 'Error al preparar sesión.'));
              }
            }}
            className="bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] px-8 py-3 rounded-[2px] font-bold text-lg hover:bg-[rgba(139,197,63,0.1)] transition-colors"
          >
            Preparar sorteo
          </button>
          {errorMsg && <p className="text-[var(--color-danger)] text-sm mt-2">{errorMsg}</p>}
          <button 
            onClick={handleReset}
            className="text-[var(--color-muted)] text-sm underline hover:text-[var(--color-danger)] transition-colors mt-4"
          >
            Reiniciar sesión local
          </button>
        </div>
      </div>
    );
  }

  if (currentSession.status === 'ready_for_draw') {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-3xl font-heading font-bold mb-2">Mundial FC 26</h2>
        <p className="text-[var(--color-muted)] mb-8">Sesión lista para iniciar: {currentSession.name}</p>
        <div className="flex gap-4 flex-col items-center">
          <button 
            onClick={() => {
              try {
                startDraw();
              } catch (err: unknown) {
                setErrorMsg(getErrorMessage(err, 'Error al iniciar sorteo.'));
              }
            }}
            className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-8 py-3 rounded-[2px] font-bold text-lg hover:bg-opacity-90 transition-opacity"
          >
            Iniciar sorteo
          </button>
          {errorMsg && <p className="text-[var(--color-danger)] text-sm mt-2">{errorMsg}</p>}
          <button 
            onClick={handleReset}
            className="text-[var(--color-muted)] text-sm underline hover:text-[var(--color-danger)] transition-colors mt-4"
          >
            Reiniciar sesión local
          </button>
        </div>
      </div>
    );
  }

  if (currentSession.status === 'draw_completed') {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-3xl font-heading font-bold mb-4 text-[var(--color-success)]">Sorteo completado</h2>
        <p className="text-[var(--color-muted)] mb-12">Todos los participantes tienen una selección asignada.</p>
        
        {lastAssignedTeam && lastAssignedParticipant && (
          <div className="mb-12 bg-[#142e1d] p-6 rounded-xl border border-[var(--color-border)] text-center animate-fade-in">
             <div className="text-sm text-[var(--color-muted)] font-mono mb-2">Última asignación</div>
             <div className="text-xl font-bold">{lastAssignedParticipant.display_name}</div>
             <div className="text-[var(--color-primary)] font-bold text-2xl mt-2">{lastAssignedTeam.name}</div>
          </div>
        )}

        <div className="flex gap-4 flex-col items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => navigate(`/municipal/${id}/asignaciones`)}
              className="bg-transparent border border-[var(--color-border)] text-[var(--color-text)] px-6 py-2 rounded-[2px] font-medium hover:bg-[#1b4028] transition-colors"
            >
              Ver Asignaciones
            </button>
            <button 
              onClick={() => navigate(`/municipal/${id}/bracket`)}
              className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-6 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity shadow-[0_0_15px_rgba(139,197,63,0.3)]"
            >
              Ir a bracket municipal
            </button>
          </div>
          <button 
            onClick={handleReset}
            className="text-[var(--color-muted)] text-sm underline hover:text-[var(--color-danger)] transition-colors mt-8"
          >
            Reiniciar sesión local
          </button>
        </div>
      </div>
    );
  }

  const postDrawStatuses = ['completed', 'bracket_ready', 'bracket_active'];
  if (postDrawStatuses.includes(currentSession.status)) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-3xl font-heading font-bold mb-4 text-[var(--color-success)]">El sorteo ya terminó</h2>
        <p className="text-[var(--color-muted)] mb-12">Esta sesión ya se encuentra en fase de bracket o finalizada.</p>
        <div className="flex gap-4 flex-col items-center">
          <button 
            onClick={() => navigate(`/municipal/${id}/bracket`)}
            className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-6 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity"
          >
            Ver bracket
          </button>
        </div>
      </div>
    );
  }

  const handleSpin = () => {
    if (isSpinning || !currentParticipant) return;
    
    setErrorMsg(null);
    setLastAssignedTeam(null);
    setLastAssignedParticipant(currentParticipant);

    let teamAssigned: Team | undefined;

    // Calcular resultado antes de animar
    try {
      const assignment = assignRandomTeamToParticipant(currentParticipant.id);
      teamAssigned = getTeamById(assignment.team_id);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, 'Error al asignar selección.'));
      return; // Detener animación si falla la lógica
    }

    if (!teamAssigned) return;

    // Asegurar que teamAssigned está en wheelTeams
    const updatedWheelTeams = [...wheelTeams];
    let targetIndex = updatedWheelTeams.findIndex(t => t.id === teamAssigned!.id);
    if (targetIndex === -1) {
      targetIndex = Math.floor(Math.random() * 8);
      updatedWheelTeams[targetIndex] = teamAssigned;
      setWheelTeams(updatedWheelTeams);
    }

    // Iniciar animación si la lógica funcionó
    setIsSpinning(true);
    
    // Calcular nueva rotación para que el puntero apunte al targetIndex
    // targetIndex * 45 + newRotation = 360 * k
    const randomOffset = Math.floor(Math.random() * 30) - 15; // +- 15 grados dentro del segmento
    // Modificamos a -newRotation porque la rueda gira en sentido horario y la formula es 360 - ...
    const newRotation = spinRotation + (360 * 5) - (targetIndex * 45) + randomOffset;
    
    lastTickAngle.current = spinRotation;
    setSpinRotation(newRotation);

    // Esperar a que termine la animación visual para mostrar tarjeta
    setTimeout(() => {
      if (teamAssigned) {
        setLastAssignedTeam(teamAssigned);
        playSuccessSound();
      }
      setIsSpinning(false);
    }, 2500); // 2.5 seconds
  };

  const totalParticipants = orderedParticipants.length;
  const currentTurn = currentParticipant ? currentParticipant.turn_order : totalParticipants;

  return (
    <div className="h-full flex flex-col items-center justify-center relative">
      <h2 className="text-3xl font-heading font-bold mb-2">Mundial FC 26</h2>
      <p className="text-[var(--color-muted)] mb-8">Sorteo de Selecciones - {currentSession.name}</p>
      
      <div className="text-sm text-[var(--color-primary)] font-mono font-bold mb-6 bg-[#142e1d] px-4 py-1 rounded-[6px] border border-[var(--color-border)]">
        Turno {currentTurn} / {totalParticipants}
      </div>
      
      <div className="w-80 h-80 relative flex items-center justify-center mb-8">
        {/* Contenedor de la ruleta visual */}
        <motion.div 
          className="w-full h-full border-[6px] border-[var(--color-border)] rounded-full absolute overflow-hidden"
          animate={{ rotate: spinRotation }}
          transition={{ duration: 2.5, ease: [0.2, 0.8, 0.2, 1] }}
          onUpdate={(latest) => {
            const currentAngle = latest.rotate as number;
            const segment = Math.floor(currentAngle / 45);
            const lastSegment = Math.floor(lastTickAngle.current / 45);
            if (segment !== lastSegment) {
              playTickSound();
              lastTickAngle.current = currentAngle;
            }
          }}
          style={{ 
            background: 'conic-gradient(from 0deg, var(--color-surface) 0%, #0a170f 50%, var(--color-surface) 100%)',
            boxShadow: '0 0 40px rgba(139,197,63,0.1)'
          }}
        >
          {/* Decorative segments inside the roulette */}
          {wheelTeams.map((team, i) => {
            return (
            <div 
              key={i} 
              className="absolute w-full h-full flex justify-center" 
              style={{ transform: `rotate(${i * 45}deg)` }}
            >
              {team && team.flag_asset_url && (
                <div 
                  className="absolute top-6 w-10 h-7 bg-cover bg-center rounded-[2px] opacity-70 border border-white/20" 
                  style={{
                    backgroundImage: `url(${team.flag_asset_url})`
                  }}
                />
              )}
              <div className="absolute w-[2px] h-full bg-[var(--color-border)]" />
            </div>
            );
          })}
        </motion.div>
        
        {/* Pointer */}
        <div className="absolute -top-4 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-transparent border-t-[var(--color-primary)] z-10" />

        {/* Center hub */}
        <div className="w-48 h-48 bg-[#05060f] rounded-full z-10 border-[4px] border-[var(--color-primary)] shadow-[0_0_20px_rgba(139,197,63,0.4)] flex flex-col items-center justify-center p-4">
          <div className="text-xs text-[var(--color-muted)] font-mono mb-1 uppercase tracking-wider">Participante</div>
          <div className="text-lg font-bold text-center leading-tight">
            {currentParticipant ? currentParticipant.display_name : 'Completado'}
          </div>
        </div>
      </div>
      
      {errorMsg && (
        <div className="mb-4 bg-[rgba(240,68,56,0.1)] border border-[var(--color-danger)] text-[var(--color-danger)] px-4 py-2 rounded-[2px] text-sm animate-fade-in">
          {errorMsg}
        </div>
      )}

      <AnimatePresence>
        {lastAssignedTeam && lastAssignedParticipant && !isSpinning && !errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-8 bg-[#142e1d] p-6 rounded-xl border border-[var(--color-success)] text-center shadow-[0_0_30px_rgba(38,150,132,0.3)] min-w-[320px]"
          >
            <div className="text-[var(--color-muted)] text-sm uppercase tracking-widest mb-2">Selección Asignada</div>
            <div className="text-[var(--color-text)] mb-4">
              <span className="font-bold text-xl">{lastAssignedParticipant.display_name}</span>
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex justify-center mb-3"
            >
              {lastAssignedTeam.flag_asset_url && (
                <img src={lastAssignedTeam.flag_asset_url} alt={lastAssignedTeam.name} className="w-20 h-14 rounded shadow-lg border border-white/20" />
              )}
            </motion.div>
            <div className="text-[var(--color-success)] font-bold text-3xl font-heading">{lastAssignedTeam.name}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={handleSpin}
        disabled={isSpinning || !currentParticipant}
        className={`px-10 py-4 rounded-[2px] font-bold text-xl shadow-[0_0_15px_rgba(139,197,63,0.3)] transition-all ${
          isSpinning || !currentParticipant
            ? 'bg-[#1b4028] text-[var(--color-muted)] cursor-not-allowed shadow-none border border-[var(--color-border)]'
            : 'bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:bg-opacity-90 hover:scale-105'
        }`}
      >
        {isSpinning ? 'Girando...' : 'Girar Ruleta'}
      </button>
      
      <div className="mt-8 text-[var(--color-muted)] text-sm flex flex-col items-center">
        <div>Selecciones disponibles: <span className="text-[var(--color-text)] font-mono">{availableTeams.length}</span></div>
        <button 
          onClick={handleReset}
          className="text-[var(--color-muted)] text-xs underline hover:text-[var(--color-danger)] transition-colors mt-4"
        >
          Reiniciar sesión local
        </button>
      </div>
    </div>
  );
}
