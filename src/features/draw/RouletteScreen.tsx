import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTournamentStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '../../types';

export default function RouletteScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const currentSession = useTournamentStore(state => state.currentSession);
  const startDraw = useTournamentStore(state => state.startDraw);
  const getOrderedParticipants = useTournamentStore(state => state.getOrderedParticipants);
  const getPendingParticipants = useTournamentStore(state => state.getPendingParticipants);
  const getAvailableTeams = useTournamentStore(state => state.getAvailableTeams);
  const assignRandomTeamToParticipant = useTournamentStore(state => state.assignRandomTeamToParticipant);
  const getTeamById = useTournamentStore(state => state.getTeamById);

  const orderedParticipants = getOrderedParticipants();
  const pendingParticipants = getPendingParticipants();
  const availableTeams = getAvailableTeams();

  const currentParticipant = pendingParticipants.length > 0 ? pendingParticipants[0] : null;

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [lastAssignedTeam, setLastAssignedTeam] = useState<Team | null>(null);
  const [lastAssignedParticipant, setLastAssignedParticipant] = useState<typeof currentParticipant>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clearLocalTournamentState = useTournamentStore(state => state.clearLocalTournamentState);

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de reiniciar la sesión local? Se perderán todos los participantes y asignaciones actuales.')) {
      clearLocalTournamentState();
      navigate(`/municipal/${id}/registro`);
    }
  };

  if (!currentSession || orderedParticipants.length === 0) {
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

  if (currentSession.status === 'ready_for_draw') {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-3xl font-heading font-bold mb-2">Mundial FC 26</h2>
        <p className="text-[var(--color-muted)] mb-8">Sesión lista para iniciar: {currentSession.name}</p>
        <div className="flex gap-4 flex-col items-center">
          <button 
            onClick={() => startDraw()}
            className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-[2px] font-bold text-lg hover:bg-opacity-90 transition-opacity"
          >
            Iniciar sorteo
          </button>
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
          <div className="mb-12 bg-[#252a33] p-6 rounded-xl border border-[var(--color-border)] text-center animate-fade-in">
             <div className="text-sm text-[var(--color-muted)] font-mono mb-2">Última asignación</div>
             <div className="text-xl font-bold">{lastAssignedParticipant.display_name}</div>
             <div className="text-[var(--color-accent)] font-bold text-2xl mt-2">{lastAssignedTeam.name}</div>
          </div>
        )}

        <div className="flex gap-4 flex-col items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => navigate(`/municipal/${id}/asignaciones`)}
              className="bg-transparent border border-[var(--color-border)] text-[var(--color-text)] px-6 py-2 rounded-[2px] font-medium hover:bg-[#3f4959] transition-colors"
            >
              Ver Asignaciones
            </button>
            <button 
              onClick={() => navigate(`/municipal/${id}/bracket`)}
              className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity shadow-[0_0_15px_rgba(102,58,243,0.3)]"
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al asignar selección.');
      return; // Detener animación si falla la lógica
    }

    // Iniciar animación si la lógica funcionó
    setIsSpinning(true);
    
    // Calcular nueva rotación (min 540deg, max 1080deg) + offset aleatorio
    const newRotation = spinRotation + 720 + Math.floor(Math.random() * 360);
    setSpinRotation(newRotation);

    // Esperar a que termine la animación visual para mostrar tarjeta
    setTimeout(() => {
      if (teamAssigned) {
        setLastAssignedTeam(teamAssigned);
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
      
      <div className="text-sm text-[var(--color-accent)] font-mono font-bold mb-6 bg-[#252a33] px-4 py-1 rounded-[6px] border border-[var(--color-border)]">
        Turno {currentTurn} / {totalParticipants}
      </div>
      
      <div className="w-80 h-80 relative flex items-center justify-center mb-8">
        {/* Contenedor de la ruleta visual */}
        <motion.div 
          className="w-full h-full border-[6px] border-[var(--color-border)] rounded-full absolute"
          animate={{ rotate: spinRotation }}
          transition={{ duration: 2.5, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ 
            background: 'conic-gradient(from 0deg, var(--color-surface) 0%, #1a1d24 50%, var(--color-surface) 100%)',
            boxShadow: '0 0 40px rgba(102,58,243,0.1)'
          }}
        >
          {/* Decorative segments inside the roulette */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-full bg-[var(--color-border)] left-1/2 -ml-[2px]" 
              style={{ transform: `rotate(${i * 45}deg)` }}
            />
          ))}
        </motion.div>
        
        {/* Pointer */}
        <div className="absolute -top-4 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-transparent border-t-[var(--color-primary)] z-10" />

        {/* Center hub */}
        <div className="w-48 h-48 bg-[#05060f] rounded-full z-10 border-[4px] border-[var(--color-primary)] shadow-[0_0_20px_rgba(102,58,243,0.4)] flex flex-col items-center justify-center p-4">
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
            className="mb-8 bg-[#252a33] p-4 rounded-xl border border-[var(--color-success)] text-center shadow-[0_0_20px_rgba(38,150,132,0.2)]"
          >
            <div className="text-[var(--color-text)]">
              <span className="font-bold">{lastAssignedParticipant.display_name}</span>
              {' representará a '}
            </div>
            <div className="text-[var(--color-success)] font-bold text-2xl mt-1">{lastAssignedTeam.name}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={handleSpin}
        disabled={isSpinning || !currentParticipant}
        className={`px-10 py-4 rounded-[2px] font-bold text-xl shadow-[0_0_15px_rgba(102,58,243,0.3)] transition-all ${
          isSpinning || !currentParticipant
            ? 'bg-[#3f4959] text-[var(--color-muted)] cursor-not-allowed shadow-none border border-[var(--color-border)]'
            : 'bg-[var(--color-primary)] text-white hover:bg-opacity-90 hover:scale-105'
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
