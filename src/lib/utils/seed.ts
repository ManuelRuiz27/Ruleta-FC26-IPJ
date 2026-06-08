import { useTournamentStore } from '../../store';
import { initialMunicipalities } from '../../data/municipalities';
import { initialMunicipalEvents } from '../../data/municipalEvents';

export const seedAllMunicipalities = async () => {
  const playerNames = ['Hugo', 'Paco', 'Luis', 'Juan', 'Pepe', 'Tono', 'Chucho', 'Panchito'];

  for (const event of initialMunicipalEvents) {
    const municipality = initialMunicipalities.find(m => m.id === event.municipality_id);
    if (!municipality) continue;

    console.log(`Seeding: ${municipality.name} - ${event.label}`);

    const session = useTournamentStore.getState().createMunicipalSession(municipality.id, municipality.region_id, event.id);
    useTournamentStore.getState().setParticipantsFromNames(playerNames, session.id);
    useTournamentStore.getState().startDraw();

    while (useTournamentStore.getState().getPendingParticipants().length > 0) {
      const [participant] = useTournamentStore.getState().getPendingParticipants();
      useTournamentStore.getState().assignRandomTeamToParticipant(participant.id);
    }

    useTournamentStore.getState().generateMunicipalBracket();

    while (useTournamentStore.getState().currentSession?.status !== 'completed') {
      const readyMatches = useTournamentStore
        .getState()
        .matches
        .filter(match => match.status === 'ready' && match.player_a_id && match.player_b_id);

      if (readyMatches.length === 0) break;

      readyMatches.forEach(match => {
        let scoreA = Math.floor(Math.random() * 5);
        const scoreB = Math.floor(Math.random() * 5);
        if (scoreA === scoreB) scoreA += 1;

        useTournamentStore.getState().submitMatchResult({
          matchId: match.id,
          regularScoreA: scoreA,
          regularScoreB: scoreB,
          extraTimePlayed: false,
          penaltiesPlayed: false,
          winnerId: scoreA > scoreB ? match.player_a_id! : match.player_b_id!
        });
      });
    }

    const finalState = useTournamentStore.getState();
    if (finalState.currentSession?.status === 'completed' && !finalState.completedMunicipalResults.some(r => r.municipal_event_id === event.id)) {
      finalState.createMunicipalQualifiedPlayers();
      finalState.createCompletedMunicipalResult();
    }
  }

  alert('Seeding completado para las jornadas municipales. Ahora puedes probar dashboards regionales y estatales.');
};
