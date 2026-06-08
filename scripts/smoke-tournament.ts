class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

globalThis.localStorage = new MemoryStorage();

const { useTournamentStore } = await import('../src/store/index.ts');
const { initialMunicipalities } = await import('../src/data/municipalities.ts');
const { initialMunicipalEvents } = await import('../src/data/municipalEvents.ts');
const { initialRegions } = await import('../src/data/regions.ts');

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const names = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, index) => `${prefix} Jugador ${String(index + 1).padStart(2, '0')}`);

const completeActiveBracket = () => {
  let guard = 0;

  while (useTournamentStore.getState().currentSession?.status !== 'completed') {
    guard += 1;
    assert(guard < 200, 'El bracket no pudo completarse dentro del limite de seguridad.');

    const readyMatches = useTournamentStore
      .getState()
      .matches
      .filter(match => match.status === 'ready' && match.player_a_id && match.player_b_id);

    assert(readyMatches.length > 0, 'No hay partidos listos, pero la sesion no esta completada.');

    for (const match of readyMatches) {
      useTournamentStore.getState().submitMatchResult({
        matchId: match.id,
        regularScoreA: 2,
        regularScoreB: 1,
        extraTimePlayed: false,
        penaltiesPlayed: false,
        winnerId: match.player_a_id!
      });
    }
  }
};

const resolveRegionalDuplicates = (regionId: string) => {
  let guard = 0;

  while (useTournamentStore.getState().getDuplicateTeamsByRegion(regionId).length > 0) {
    guard += 1;
    assert(guard < 50, `No se pudieron resolver duplicados regionales para ${regionId}.`);

    const [duplicate] = useTournamentStore.getState().getDuplicateTeamsByRegion(regionId);
    const keeperCandidates = duplicate.occurrences.filter(occ => occ.rank === 'champion');
    const keeper = (keeperCandidates.length > 0 ? keeperCandidates : duplicate.occurrences)[0];
    const affected = duplicate.occurrences.find(occ => occ.qualified_player_id !== keeper.qualified_player_id);
    assert(affected, `Duplicado regional sin jugador afectado para ${duplicate.team_name}.`);

    const beforeHistory = JSON.stringify(useTournamentStore.getState().completedMunicipalResults);
    const availableTeam = useTournamentStore.getState().getAvailableTeamsForRegion(regionId)[0];
    assert(availableTeam, `No hay seleccion disponible para reasignar en ${regionId}.`);

    useTournamentStore.getState().resolveDuplicateTeam({
      qualifiedPlayerId: affected.qualified_player_id,
      newTeamId: availableTeam.id,
      keptByQualifiedPlayerId: keeper.qualified_player_id,
      reason: 'Smoke test regional duplicate resolution'
    });

    assert(
      JSON.stringify(useTournamentStore.getState().completedMunicipalResults) === beforeHistory,
      'La resolucion regional modifico completedMunicipalResults.'
    );
  }
};

const resolveStateDuplicates = () => {
  let guard = 0;

  while (useTournamentStore.getState().getDuplicateTeamsState().length > 0) {
    guard += 1;
    assert(guard < 50, 'No se pudieron resolver duplicados estatales.');

    const [duplicate] = useTournamentStore.getState().getDuplicateTeamsState();
    const keeperCandidates = duplicate.occurrences.filter(occ => occ.rank === 'champion');
    const keeper = (keeperCandidates.length > 0 ? keeperCandidates : duplicate.occurrences)[0];
    const affected = duplicate.occurrences.find(occ => occ.qualified_player_id !== keeper.qualified_player_id);
    assert(affected, `Duplicado estatal sin jugador afectado para ${duplicate.team_name}.`);

    const availableTeam = useTournamentStore.getState().getAvailableTeamsForState()[0];
    assert(availableTeam, 'No hay seleccion disponible para reasignar en estado.');

    useTournamentStore.getState().resolveDuplicateTeam({
      qualifiedPlayerId: affected.qualified_player_id,
      newTeamId: availableTeam.id,
      keptByQualifiedPlayerId: keeper.qualified_player_id,
      reason: 'Smoke test state duplicate resolution'
    });
  }
};

const runMunicipalFlow = (event: (typeof initialMunicipalEvents)[number], participantCount: number) => {
  const municipality = initialMunicipalities.find(m => m.id === event.municipality_id);
  assert(municipality, `Municipio no encontrado para ${event.id}.`);
  const store = useTournamentStore.getState();
  const session = store.createMunicipalSession(municipality.id, municipality.region_id, event.id);
  store.setParticipantsFromNames(names(participantCount, municipality.id), session.id);
  useTournamentStore.getState().startDraw();

  while (useTournamentStore.getState().getPendingParticipants().length > 0) {
    const [participant] = useTournamentStore.getState().getPendingParticipants();
    useTournamentStore.getState().assignRandomTeamToParticipant(participant.id);
  }

  const assignments = useTournamentStore.getState().getAssignmentsForCurrentSession();
  assert(assignments.length === participantCount, `Asignaciones incompletas en ${municipality.name}.`);
  assert(new Set(assignments.map(assignment => assignment.team_id)).size === assignments.length, `Seleccion duplicada municipal en ${municipality.name}.`);

  useTournamentStore.getState().generateMunicipalBracket();
  if (participantCount === 12) {
    assert(useTournamentStore.getState().bracket?.bye_count === 4, 'Bracket de 12 participantes no genero 4 BYEs.');
  }

  const firstReady = useTournamentStore.getState().matches.find(match => match.status === 'ready' && match.player_a_id && match.player_b_id);
  assert(firstReady, `No se encontro partido listo en ${municipality.name}.`);

  assertThrows(() => {
    useTournamentStore.getState().submitMatchResult({
      matchId: firstReady.id,
      regularScoreA: 1,
      regularScoreB: 1,
      extraTimePlayed: false,
      penaltiesPlayed: false,
      winnerId: firstReady.player_a_id!
    });
  }, 'Empate sin definicion no fue bloqueado.');

  assertThrows(() => {
    useTournamentStore.getState().submitMatchResult({
      matchId: firstReady.id,
      regularScoreA: 1,
      regularScoreB: 1,
      extraTimePlayed: true,
      penaltiesPlayed: true,
      penaltiesScoreA: 4,
      penaltiesScoreB: 4,
      winnerId: firstReady.player_a_id!
    });
  }, 'Penales empatados no fueron bloqueados.');

  completeActiveBracket();

  const finalState = useTournamentStore.getState();
  assert(finalState.getQualifiedPlayersForCurrentSession().length === 2, `No se generaron 2 clasificados en ${municipality.name}.`);
  assert(finalState.completedMunicipalResults.some(result => result.source_session_id === session.id), `No se genero resultado municipal en ${municipality.name}.`);
};

const assertThrows = (fn: () => void, message: string) => {
  let didThrow = false;
  try {
    fn();
  } catch {
    didThrow = true;
  }
  assert(didThrow, message);
};

useTournamentStore.getState().clearLocalTournamentState();

const validation = useTournamentStore.getState().validateParticipantNames(names(7, 'Minimo'));
assert(!validation.valid, 'La validacion permitio menos de 8 participantes.');
assert(useTournamentStore.getState().validateParticipantNames(names(8, 'Minimo')).valid, 'La validacion bloqueo 8 participantes.');
assert(!useTournamentStore.getState().validateParticipantNames(names(33, 'Maximo')).valid, 'La validacion permitio mas de 32 participantes.');
assert(!useTournamentStore.getState().validateParticipantNames(['A', 'A', ...names(6, 'Dup')]).valid, 'La validacion permitio nombres duplicados.');

initialMunicipalEvents.forEach((event, index) => {
  runMunicipalFlow(event, index === 0 ? 12 : 8);
});

assert(
  useTournamentStore.getState().completedMunicipalResults.length === initialMunicipalEvents.length,
  'No se completaron todos los resultados de jornadas municipales.'
);

for (const region of initialRegions) {
  resolveRegionalDuplicates(region.id);
  const readiness = useTournamentStore.getState().getRegionReadiness(region.id);
  assert(readiness.isReady, `La region ${region.name} no quedo lista.`);
  assert(readiness.actualQualifiedPlayers === readiness.expectedQualifiedPlayers, `Clasificados incompletos en ${region.name}.`);

  useTournamentStore.getState().createRegionalSession(region.id);
  useTournamentStore.getState().generateRegionalBracket();
  completeActiveBracket();
  useTournamentStore.getState().createCompletedRegionalResult();
  assert(
    useTournamentStore.getState().completedRegionalResults.some(result => result.region_id === region.id),
    `No se genero resultado regional para ${region.name}.`
  );
  useTournamentStore.getState().resetActiveSession();
}

assert(
  useTournamentStore.getState().completedRegionalResults.length === initialRegions.length,
  'No se completaron todos los resultados regionales.'
);

useTournamentStore.getState().createStateQualifiedPlayers();
resolveStateDuplicates();
const stateReadiness = useTournamentStore.getState().getStateReadiness();
assert(stateReadiness.isReady, 'El estado no quedo listo para bracket.');
assert(stateReadiness.actualQualifiedPlayers === stateReadiness.expectedQualifiedPlayers, 'Clasificados estatales incompletos.');

useTournamentStore.getState().createStateSession();
useTournamentStore.getState().generateStateBracket();
completeActiveBracket();
useTournamentStore.getState().createCompletedStateResult();

assert(useTournamentStore.getState().completedStateResults.length === 1, 'No se genero resultado estatal.');
assert(useTournamentStore.getState().teamReassignments.length > 0, 'No se registraron reasignaciones de duplicados.');

console.log('Smoke tournament OK');
