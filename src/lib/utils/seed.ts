import { useTournamentStore } from '../../store';
import { initialMunicipalities } from '../../data/municipalities';

export const seedAllMunicipalities = async () => {
  const store = useTournamentStore.getState();
  
  // Nombres ficticios para llenar los torneos
  const playerNames = ['Hugo', 'Paco', 'Luis', 'Juan', 'Pepe', 'Toño', 'Chucho', 'Panchito'];

  for (const mun of initialMunicipalities) {
    console.log(`Seeding: ${mun.name}`);
    
    // 1. Crear sesión municipal
    const session = store.createMunicipalSession(mun.id, mun.region_id);
    
    // 2. Establecer participantes
    store.setParticipantsFromNames(playerNames, session.id);
    
    // 3. Iniciar sorteo
    store.startDraw();
    
    // 5. Asignar equipos aleatorios
    const currentStore = useTournamentStore.getState(); // refresh state
    const pending = currentStore.getPendingParticipants();
    pending.forEach(p => {
      useTournamentStore.getState().assignRandomTeamToParticipant(p.id);
    });
    
    // 6. Completar sorteo y generar bracket
    useTournamentStore.setState(state => ({
      currentSession: { ...state.currentSession!, status: 'draw_completed' }
    }));
    useTournamentStore.getState().generateMunicipalBracket();
    
    // 7. Simular todos los partidos automáticamente
    let allCompleted = false;
    while (!allCompleted) {
      const state = useTournamentStore.getState();
      const readyMatches = state.matches.filter(m => m.status === 'ready' && m.player_a_id && m.player_b_id);
      
      if (readyMatches.length === 0) {
        // Verificar si hay bracket completado
        if (state.currentSession?.status === 'completed') {
          allCompleted = true;
        } else {
          // Fallback de seguridad
          break;
        }
      }
      
      readyMatches.forEach(match => {
        // Marcador aleatorio sin empate
        let scoreA = Math.floor(Math.random() * 5);
        const scoreB = Math.floor(Math.random() * 5);
        if (scoreA === scoreB) scoreA += 1;
        
        const winnerId = scoreA > scoreB ? match.player_a_id! : match.player_b_id!;
        
        useTournamentStore.getState().submitMatchResult({
          matchId: match.id,
          regularScoreA: scoreA,
          regularScoreB: scoreB,
          extraTimePlayed: false,
          penaltiesPlayed: false,
          winnerId
        });
        
        useTournamentStore.getState().advanceWinnerToNextMatch(match.id, winnerId);
      });
    }

    // 8. Al terminar, la lógica de store debería auto-generar los clasificados y el resultado final si la final se completa,
    // pero si el state.currentSession.status no es completed aún, lo forzamos (aunque advanceWinnerToNextMatch lo hace).
    const finalState = useTournamentStore.getState();
    if (finalState.currentSession?.status === 'completed') {
      const existingRes = finalState.completedMunicipalResults.find(r => r.municipality_id === mun.id);
      if (!existingRes) {
         finalState.createMunicipalQualifiedPlayers();
         finalState.createCompletedMunicipalResult();
      }
    }
  }

  alert("¡Seeding completado para los 25 municipios! Ahora puedes probar los dashboards regionales y estatales.");
};
