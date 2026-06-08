import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  Region, Municipality, Team, DrawSession, Participant, Assignment, 
  Bracket, Match, RoundType, QualifiedPlayer, CompletedMunicipalResult, TeamReassignment 
} from '../types';
import { initialRegions } from '../data/regions';
import { initialMunicipalities } from '../data/municipalities';
import { initialTeams } from '../data/teams';

interface TournamentState {
  regions: Region[];
  municipalities: Municipality[];
  teams: Team[];
  
  // Current session context
  currentSession: DrawSession | null;
  participants: Participant[];
  assignments: Assignment[];
  bracket: Bracket | null;
  matches: Match[];

  // Actions
  setCurrentSession: (session: DrawSession | null) => void;
  createMunicipalSession: (municipalityId: string, regionId: string) => DrawSession;
  createRegionalSession: (regionId: string) => DrawSession;
  resetMunicipalSession: () => void;
  clearLocalTournamentState: () => void;
  qualifiedPlayers: QualifiedPlayer[];
  completedMunicipalResults: CompletedMunicipalResult[];
  teamReassignments: TeamReassignment[];

  prepareDraftSessionForDraw: () => void;
  startDraw: () => void;
  assignRandomTeamToParticipant: (participantId: string) => Assignment;
  generateMunicipalBracket: () => void;
  generateRegionalBracket: () => void;
  submitMatchResult: (input: {
    matchId: string;
    regularScoreA: number;
    regularScoreB: number;
    extraTimePlayed: boolean;
    penaltiesPlayed: boolean;
    penaltiesScoreA?: number | null;
    penaltiesScoreB?: number | null;
    winnerId: string;
  }) => void;
  advanceWinnerToNextMatch: (matchId: string, winnerId: string) => void;
  createMunicipalQualifiedPlayers: () => void;
  createCompletedMunicipalResult: () => void;
  resolveDuplicateTeam: (input: { qualifiedPlayerId: string; newTeamId: string; keptByQualifiedPlayerId: string | null; reason: string; }) => void;
  
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (id: string, data: Partial<Participant>) => void;
  removeParticipant: (id: string) => void;
  setParticipantsFromNames: (names: string[], sessionId: string) => void;
  
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;

  setBracket: (bracket: Bracket | null) => void;
  setMatches: (matches: Match[]) => void;
  updateMatch: (id: string, data: Partial<Match>) => void;

  // Getters & Validators
  getMunicipalityById: (id: string) => Municipality | undefined;
  getRegionById: (id: string) => Region | undefined;
  getTeamById: (id: string) => Team | undefined;
  getMatchById: (matchId: string) => Match | undefined;
  getParticipantAssignment: (participantId: string) => Assignment | undefined;
  getParticipantTeam: (participantId: string) => Team | undefined;
  getMatchesByRound: () => Record<string, Match[]>;
  getChampionAndRunnerUp: () => { champion?: Participant; runnerUp?: Participant };
  getAssignmentsForCurrentSession: () => Assignment[];
  getOrderedParticipants: () => Participant[];
  getPendingParticipants: () => Participant[];
  getQualifiedPlayersForCurrentSession: () => QualifiedPlayer[];
  getQualifiedPlayersByRegion: (regionId: string) => QualifiedPlayer[];
  getAllCompletedMunicipalResults: () => CompletedMunicipalResult[];
  getCompletedMunicipalResultsByRegion: (regionId: string) => CompletedMunicipalResult[];
  getDuplicateTeamsByRegion: (regionId: string) => Array<{
    team_id: string;
    team_name: string;
    occurrences: Array<{
      qualified_player_id: string;
      municipality_id: string;
      municipality_name: string;
      participant_name: string;
      rank: 'champion' | 'runner_up';
      team_id: string;
      team_name: string;
    }>;
  }>;
  getAvailableTeamsForRegion: (regionId: string) => Team[];
  getRegionReadiness: (regionId: string) => {
    isReady: boolean;
    totalMunicipalities: number;
    completedMunicipalities: number;
    expectedQualifiedPlayers: number;
    actualQualifiedPlayers: number;
    duplicateGroups: number;
    pendingMunicipalities: number;
  };
  getAvailableTeams: () => Team[];
  validateParticipantNames: (names: string[]) => { valid: boolean; errors: string[] };
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      regions: initialRegions,
      municipalities: initialMunicipalities,
      teams: initialTeams,
      
      currentSession: null,
      participants: [],
      assignments: [],
      bracket: null,
      matches: [],
      qualifiedPlayers: [],
      completedMunicipalResults: [],
      teamReassignments: [],

      setCurrentSession: (session) => set({ currentSession: session }),
      createMunicipalSession: (municipalityId, regionId) => {
        const id = crypto.randomUUID();
        const session: DrawSession = {
          id,
          stage: 'municipal',
          status: 'ready_for_draw',
          municipality_id: municipalityId,
          region_id: regionId,
          name: `Sorteo Municipal`,
          participant_min: 8,
          participant_max: 32,
          allow_duplicate_teams: false,
          created_by: null,
          started_at: null,
          completed_at: null,
          locked_at: null,
          deleted_at: null,
          created_at: new Date().toISOString()
        };
        set({ currentSession: session, participants: [], assignments: [], bracket: null, matches: [] });
        return session;
      },
      createRegionalSession: (regionId) => {
        const region = get().getRegionById(regionId);
        if (!region) throw new Error("Región no encontrada");
        const readiness = get().getRegionReadiness(regionId);
        if (!readiness.isReady) throw new Error("La región no está lista para bracket");

        const activeQps = get().qualifiedPlayers.filter(qp => qp.region_id === regionId && qp.is_active);
        if (activeQps.length < 2 || activeQps.length > 32) throw new Error("Debe haber entre 2 y 32 clasificados");
        
        const uniqueTeams = new Set(activeQps.map(qp => qp.team_id));
        if (uniqueTeams.size !== activeQps.length) throw new Error("Aún hay selecciones duplicadas");

        const id = crypto.randomUUID();
        const session: DrawSession = {
          id,
          stage: 'regional',
          status: 'draw_completed',
          region_id: regionId,
          municipality_id: null,
          name: `Bracket Regional: ${region.name}`,
          participant_min: 2,
          participant_max: 32,
          allow_duplicate_teams: false,
          created_by: null,
          started_at: new Date().toISOString(),
          completed_at: null,
          locked_at: null,
          deleted_at: null,
          created_at: new Date().toISOString()
        };

        const participants: Participant[] = [];
        const assignments: Assignment[] = [];

        activeQps.forEach(qp => {
          const snapshot = get().completedMunicipalResults.find(r => r.source_session_id === qp.source_session_id);
          let displayName = "Desconocido";
          if (snapshot) {
            displayName = qp.rank === 'champion' ? snapshot.champion_name : snapshot.runner_up_name;
          }

          const participant: Participant = {
            id: crypto.randomUUID(),
            session_id: session.id,
            source_qualified_player_id: qp.id,
            display_name: displayName,
            status: 'assigned',
            sync_status: 'synced',
            turn_order: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null
          };

          const assignment: Assignment = {
            id: crypto.randomUUID(),
            session_id: session.id,
            participant_id: participant.id,
            team_id: qp.team_id,
            source: 'regional_reassignment',
            assigned_at: new Date().toISOString(),
            created_by: null,
            sync_status: 'synced'
          };

          participants.push(participant);
          assignments.push(assignment);
        });

        set({ currentSession: session, participants, assignments, bracket: null, matches: [] });
        return session;
      },
      resetMunicipalSession: () => set({ currentSession: null, participants: [], assignments: [], bracket: null, matches: [] }),
      clearLocalTournamentState: () => set({ currentSession: null, participants: [], assignments: [], bracket: null, matches: [], qualifiedPlayers: [], completedMunicipalResults: [], teamReassignments: [] }),
      
      prepareDraftSessionForDraw: () => {
        const session = get().currentSession;
        if (!session) throw new Error("No hay sesión activa");
        if (session.status !== 'draft') throw new Error("La sesión no está en estado draft");
        const sessionParticipants = get().participants.filter(p => p.session_id === session.id);
        if (sessionParticipants.length < 8 || sessionParticipants.length > 32) {
          throw new Error("El número de participantes de la sesión debe ser entre 8 y 32");
        }
        set({ currentSession: { ...session, status: 'ready_for_draw' } });
      },

      startDraw: () => {
        const session = get().currentSession;
        if (!session) throw new Error("No hay sesión activa");
        if (session.status !== 'ready_for_draw') throw new Error("El sorteo no está en estado ready_for_draw");
        
        const sessionParticipants = get().participants.filter(p => p.session_id === session.id);
        if (sessionParticipants.length < 8 || sessionParticipants.length > 32) {
          throw new Error("El número de participantes de esta sesión debe ser entre 8 y 32");
        }

        const randomized = [...sessionParticipants].sort(() => Math.random() - 0.5);
        const orderedParticipants = randomized.map((p, index) => ({
          ...p,
          turn_order: index + 1
        }));

        set({ 
          currentSession: { ...session, status: 'drawing', started_at: new Date().toISOString() },
          participants: [...get().participants.filter(p => p.session_id !== session.id), ...orderedParticipants]
        });
      },

      assignRandomTeamToParticipant: (participantId: string) => {
        const state = get();
        if (!state.currentSession) throw new Error("No hay sesión activa");
        if (state.currentSession.status !== 'drawing') throw new Error("El sorteo no está activo");
        
        const participant = state.participants.find(p => p.id === participantId);
        if (!participant) throw new Error("Participante no encontrado");
        if (participant.session_id !== state.currentSession.id) throw new Error("Participante no pertenece a la sesión actual");

        const sessionAssignments = state.getAssignmentsForCurrentSession();
        const hasAssignment = sessionAssignments.some(a => a.participant_id === participantId);
        if (hasAssignment) throw new Error("Este participante ya tiene selección asignada.");
        
        const assignedTeamIds = sessionAssignments.map(a => a.team_id);
        const availableTeams = state.teams.filter(t => !assignedTeamIds.includes(t.id));
        if (availableTeams.length === 0) throw new Error("No hay selecciones disponibles");
        
        const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        const newAssignment: Assignment = {
          id: crypto.randomUUID(),
          session_id: state.currentSession.id,
          participant_id: participant.id,
          team_id: randomTeam.id,
          source: 'municipal_draw',
          assigned_at: new Date().toISOString(),
          created_by: null,
          sync_status: 'synced'
        };
        
        const newAssignments = [...state.assignments, newAssignment];
        
        set(s => ({ 
          assignments: newAssignments,
          participants: s.participants.map(p => p.id === participant.id ? { ...p, status: 'assigned', sync_status: 'synced', updated_at: new Date().toISOString() } : p)
        }));
        
        const currentSessionAssignments = newAssignments.filter(a => a.session_id === state.currentSession!.id);
        const currentSessionParticipants = state.participants.filter(p => p.session_id === state.currentSession!.id);

        if (currentSessionAssignments.length === currentSessionParticipants.length) {
          set(s => ({ currentSession: { ...s.currentSession!, status: 'draw_completed', completed_at: new Date().toISOString() } }));
        }
        
        return newAssignment;
      },

      generateMunicipalBracket: () => {
        const session = get().currentSession;
        if (!session) throw new Error("No hay sesión activa");
        if (session.status !== 'draw_completed') throw new Error("El sorteo debe completarse primero");
        
        const participants = get().getOrderedParticipants();
        const assignments = get().getAssignmentsForCurrentSession();
        
        let bracketSize = 32;
        if (participants.length <= 8) bracketSize = 8;
        else if (participants.length <= 16) bracketSize = 16;

        const byeCount = bracketSize - participants.length;
        const bracketId = crypto.randomUUID();

        const newBracket: Bracket = {
          id: bracketId,
          session_id: session.id,
          bracket_size: bracketSize,
          participant_count: participants.length,
          bye_count: byeCount,
          status: 'ready',
          generated_by: null,
          generated_at: new Date().toISOString(),
          locked_at: null
        };

        const rounds32: RoundType[] = ['round_32', 'round_16', 'quarterfinal', 'semifinal', 'final'];
        const startIndex = bracketSize === 32 ? 0 : bracketSize === 16 ? 1 : 2;
        const rounds = rounds32.slice(startIndex);
        
        const allMatches: Match[] = [];
        let currentRoundMatches: Match[] = [];

        for (let r = 0; r < rounds.length; r++) {
          const roundName = rounds[r];
          const matchCount = bracketSize / Math.pow(2, r + 1);
          const roundMatches: Match[] = [];

          for (let i = 0; i < matchCount; i++) {
            roundMatches.push({
              id: crypto.randomUUID(),
              bracket_id: bracketId,
              session_id: session.id,
              round: roundName,
              match_number: i + 1,
              next_match_id: null,
              player_a_id: null, team_a_id: null,
              player_b_id: null, team_b_id: null,
              regular_score_a: null, regular_score_b: null,
              extra_time_played: false, penalties_played: false,
              penalties_score_a: null, penalties_score_b: null,
              winner_id: null, loser_id: null,
              status: 'pending', completed_by: null, completed_at: null,
              locked_at: null, deleted_at: null, created_at: new Date().toISOString()
            });
          }

          if (r > 0) {
            for (let i = 0; i < currentRoundMatches.length; i++) {
              currentRoundMatches[i].next_match_id = roundMatches[Math.floor(i / 2)].id;
            }
          }

          allMatches.push(...roundMatches);
          currentRoundMatches = roundMatches;
        }

        const initialMatches = allMatches.filter(m => m.round === rounds[0]);
        let pIdx = 0;
        for (let i = 0; i < initialMatches.length; i++) {
          const pA = participants[pIdx++];
          initialMatches[i].player_a_id = pA.id;
          initialMatches[i].team_a_id = assignments.find(a => a.participant_id === pA.id)!.team_id;
        }
        for (let i = 0; i < initialMatches.length && pIdx < participants.length; i++) {
          const pB = participants[pIdx++];
          initialMatches[i].player_b_id = pB.id;
          initialMatches[i].team_b_id = assignments.find(a => a.participant_id === pB.id)!.team_id;
          initialMatches[i].status = 'ready';
        }

        set(state => ({
          bracket: newBracket,
          matches: allMatches,
          currentSession: { ...state.currentSession!, status: 'bracket_ready' }
        }));

        for (const match of initialMatches) {
          if (match.player_a_id && !match.player_b_id) get().advanceWinnerToNextMatch(match.id, match.player_a_id);
        }
      },

      generateRegionalBracket: () => {
        const session = get().currentSession;
        if (!session) throw new Error("No hay sesión activa");
        if (session.stage !== 'regional') throw new Error("La sesión no es regional");
        if (session.status !== 'draw_completed') throw new Error("La sesión no está en draw_completed");
        if (get().bracket) throw new Error("El bracket regional ya fue generado.");

        const participants = get().participants.filter(p => p.session_id === session.id);
        const count = participants.length;
        if (count < 2 || count > 32) throw new Error("Debe haber entre 2 y 32 clasificados");

        const bracketSize = Math.pow(2, Math.ceil(Math.log2(count)));
        const byeCount = bracketSize - count;

        const bracket: Bracket = {
          id: crypto.randomUUID(),
          session_id: session.id,
          bracket_size: bracketSize,
          participant_count: count,
          bye_count: byeCount,
          status: 'ready',
          generated_by: null,
          generated_at: new Date().toISOString(),
          locked_at: null
        };

        const roundsMap: Record<number, RoundType> = {
          2: 'final',
          4: 'semifinal',
          8: 'quarterfinal',
          16: 'round_16',
          32: 'round_32'
        };

        const totalRounds = Math.log2(bracketSize);
        const matches: Match[] = [];
        let matchCounter = 1;

        let previousRoundMatches: Match[] = [];

        for (let r = 1; r <= totalRounds; r++) {
          const matchesInRound = bracketSize / Math.pow(2, r);
          const currentRoundMatches: Match[] = [];
          
          let roundName = roundsMap[matchesInRound * 2] || 'round_32';
          if (matchesInRound === 1) roundName = 'final';
          else if (matchesInRound === 2) roundName = 'semifinal';
          else if (matchesInRound === 4) roundName = 'quarterfinal';
          else if (matchesInRound === 8) roundName = 'round_16';
          else if (matchesInRound === 16) roundName = 'round_32';

          for (let m = 0; m < matchesInRound; m++) {
            const match: Match = {
              id: crypto.randomUUID(),
              bracket_id: bracket.id,
              session_id: session.id,
              round: roundName as RoundType,
              match_number: matchCounter++,
              next_match_id: null,
              player_a_id: null,
              player_b_id: null,
              team_a_id: null,
              team_b_id: null,
              regular_score_a: null,
              regular_score_b: null,
              extra_time_played: false,
              penalties_played: false,
              penalties_score_a: null,
              penalties_score_b: null,
              winner_id: null,
              loser_id: null,
              status: 'pending',
              completed_by: null,
              completed_at: null,
              locked_at: null,
              deleted_at: null,
              created_at: new Date().toISOString()
            };
            currentRoundMatches.push(match);
            matches.push(match);
          }

          if (previousRoundMatches.length > 0) {
            for (let i = 0; i < previousRoundMatches.length; i++) {
              previousRoundMatches[i].next_match_id = currentRoundMatches[Math.floor(i / 2)].id;
            }
          }

          previousRoundMatches = currentRoundMatches;
        }

        const initialRoundName = roundsMap[bracketSize] || 'round_32';
        const initialMatches = matches.filter(m => m.round === initialRoundName);

        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        let pIndex = 0;

        for (let i = 0; i < initialMatches.length; i++) {
          if (pIndex < shuffled.length) {
            initialMatches[i].player_a_id = shuffled[pIndex].id;
            const assignment = get().assignments.find(a => a.participant_id === shuffled[pIndex].id);
            initialMatches[i].team_a_id = assignment ? assignment.team_id : null;
            pIndex++;
          }
          if (pIndex < shuffled.length && i >= byeCount) {
            initialMatches[i].player_b_id = shuffled[pIndex].id;
            const assignment = get().assignments.find(a => a.participant_id === shuffled[pIndex].id);
            initialMatches[i].team_b_id = assignment ? assignment.team_id : null;
            initialMatches[i].status = 'ready';
            pIndex++;
          } else if (pIndex >= shuffled.length || i < byeCount) {
            initialMatches[i].status = 'completed';
            initialMatches[i].winner_id = initialMatches[i].player_a_id;
            const nextMatchId = initialMatches[i].next_match_id;
            if (nextMatchId) {
              const nextMatch = matches.find(m => m.id === nextMatchId);
              if (nextMatch) {
                if (!nextMatch.player_a_id) {
                  nextMatch.player_a_id = initialMatches[i].winner_id;
                  nextMatch.team_a_id = initialMatches[i].team_a_id;
                } else {
                  nextMatch.player_b_id = initialMatches[i].winner_id;
                  nextMatch.team_b_id = initialMatches[i].team_a_id;
                  nextMatch.status = 'ready';
                }
              }
            }
          }
        }

        set({ 
          bracket, 
          matches, 
          currentSession: { ...session, status: 'bracket_ready' }
        });
      },

      advanceWinnerToNextMatch: (matchId: string, winnerId: string) => {
        const matches = get().matches;
        const matchIndex = matches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) return;

        const match = matches[matchIndex];
        if (match.status === 'completed' && match.winner_id) return;
        const isBye = !match.player_b_id;
        const loserId = isBye ? null : (winnerId === match.player_a_id ? match.player_b_id : match.player_a_id);
        const winnerTeamId = winnerId === match.player_a_id ? match.team_a_id : match.team_b_id;

        const updatedMatch: Match = { ...match, winner_id: winnerId, loser_id: loserId, status: 'completed', completed_at: new Date().toISOString() };
        const newMatches = [...matches];
        newMatches[matchIndex] = updatedMatch;

        let sessionCompleted = false;

        if (updatedMatch.next_match_id) {
          const nextMatchIndex = newMatches.findIndex(m => m.id === updatedMatch.next_match_id);
          if (nextMatchIndex !== -1) {
            const nextMatch = { ...newMatches[nextMatchIndex] };
            const isPlayerA = (updatedMatch.match_number % 2) !== 0;

            if (isPlayerA && nextMatch.player_a_id && nextMatch.player_a_id !== winnerId) throw new Error("Slot A destino ya está ocupado por otro participante.");
            if (!isPlayerA && nextMatch.player_b_id && nextMatch.player_b_id !== winnerId) throw new Error("Slot B destino ya está ocupado por otro participante.");

            if (isPlayerA) { nextMatch.player_a_id = winnerId; nextMatch.team_a_id = winnerTeamId; }
            else { nextMatch.player_b_id = winnerId; nextMatch.team_b_id = winnerTeamId; }
            if (nextMatch.player_a_id && nextMatch.player_b_id) nextMatch.status = 'ready';
            newMatches[nextMatchIndex] = nextMatch;
          }
        } else { sessionCompleted = true; }

        const currentSession = get().currentSession;
        let nextStatus = currentSession?.status;
        if (!isBye && currentSession?.status === 'bracket_ready') nextStatus = 'bracket_active';
        if (sessionCompleted) nextStatus = 'completed';

        set(state => ({
          matches: newMatches,
          participants: state.participants.map(p => {
            if (sessionCompleted) {
              if (p.id === winnerId) return { ...p, status: 'champion' };
              if (p.id === loserId) return { ...p, status: 'runner_up' };
            } else if (p.id === loserId) return { ...p, status: 'eliminated' };
            return p;
          }),
          currentSession: currentSession ? { ...currentSession, status: nextStatus as any, completed_at: sessionCompleted ? new Date().toISOString() : currentSession.completed_at } : null
        }));

        if (sessionCompleted) {
          get().createMunicipalQualifiedPlayers();
          get().createCompletedMunicipalResult();
        }
      },

      submitMatchResult: (input) => {
        const { matchId, regularScoreA, regularScoreB, extraTimePlayed, penaltiesPlayed, penaltiesScoreA, penaltiesScoreB, winnerId } = input;
        const match = get().matches.find(m => m.id === matchId);
        if (!match) throw new Error("Partido no encontrado");
        if (match.status !== 'ready') throw new Error("El partido no está listo para capturar marcador");
        if (!match.player_a_id || !match.player_b_id) throw new Error("El partido no tiene rivales asignados");
        if (regularScoreA < 0 || regularScoreB < 0) throw new Error("Los marcadores no pueden ser negativos");
        if (winnerId !== match.player_a_id && winnerId !== match.player_b_id) throw new Error("Ganador inválido");

        if (regularScoreA !== regularScoreB) {
          if (winnerId !== (regularScoreA > regularScoreB ? match.player_a_id : match.player_b_id)) throw new Error("Ganador no coincide con marcador regular");
        } else {
          if (!extraTimePlayed) throw new Error("Empate requiere tiempo extra");
          if (penaltiesPlayed) {
            if (penaltiesScoreA == null || penaltiesScoreB == null) throw new Error("Faltan penales");
            if (penaltiesScoreA < 0 || penaltiesScoreB < 0) throw new Error("Los penales no pueden ser negativos");
            if (penaltiesScoreA === penaltiesScoreB) throw new Error("Los penales no pueden terminar en empate");
            if (winnerId !== (penaltiesScoreA > penaltiesScoreB ? match.player_a_id : match.player_b_id)) throw new Error("Ganador no coincide con marcador de penales");
          }
        }
        
        // Modificamos el match pero guardando status temporal (NO avanza a state.matches directamente para evitar avance asíncrono roto)
        // advanceWinnerToNextMatch hará el guardado final.
        const matches = get().matches;
        const matchIndex = matches.findIndex(m => m.id === matchId);
        const newMatches = [...matches];
        newMatches[matchIndex] = { ...match, regular_score_a: regularScoreA, regular_score_b: regularScoreB, extra_time_played: extraTimePlayed, penalties_played: penaltiesPlayed, penalties_score_a: penaltiesScoreA ?? null, penalties_score_b: penaltiesScoreB ?? null };
        set({ matches: newMatches });
        
        get().advanceWinnerToNextMatch(matchId, winnerId);
      },

      createMunicipalQualifiedPlayers: () => {
        const session = get().currentSession;
        if (!session || session.stage !== 'municipal' || session.status !== 'completed') return;
        if (get().qualifiedPlayers.some(qp => qp.source_session_id === session.id)) return;
        const { champion, runnerUp } = get().getChampionAndRunnerUp();
        if (!champion || !runnerUp) return;
        const championAssignment = get().getParticipantAssignment(champion.id);
        const runnerUpAssignment = get().getParticipantAssignment(runnerUp.id);
        if (!championAssignment || !runnerUpAssignment) return;
        const newQPs: QualifiedPlayer[] = [
          { id: crypto.randomUUID(), source_session_id: session.id, target_stage: 'regional', participant_id: champion.id, municipality_id: session.municipality_id, region_id: session.region_id, team_id: championAssignment.team_id, rank: 'champion', is_active: true, created_at: new Date().toISOString() },
          { id: crypto.randomUUID(), source_session_id: session.id, target_stage: 'regional', participant_id: runnerUp.id, municipality_id: session.municipality_id, region_id: session.region_id, team_id: runnerUpAssignment.team_id, rank: 'runner_up', is_active: true, created_at: new Date().toISOString() }
        ];
        set(state => ({ qualifiedPlayers: [...state.qualifiedPlayers, ...newQPs] }));
      },

      createCompletedMunicipalResult: () => {
        const session = get().currentSession;
        if (!session || session.stage !== 'municipal' || session.status !== 'completed') return;
        
        if (get().completedMunicipalResults.some(r => r.source_session_id === session.id)) return;
        
        const { champion, runnerUp } = get().getChampionAndRunnerUp();
        if (!champion || !runnerUp) return;
        
        const championAssignment = get().getParticipantAssignment(champion.id);
        const runnerUpAssignment = get().getParticipantAssignment(runnerUp.id);
        if (!championAssignment || !runnerUpAssignment) return;
        
        const championTeam = get().getTeamById(championAssignment.team_id);
        const runnerUpTeam = get().getTeamById(runnerUpAssignment.team_id);
        if (!championTeam || !runnerUpTeam) return;

        const municipality = get().getMunicipalityById(session.municipality_id!);
        const region = get().getRegionById(session.region_id!);
        if (!municipality || !region) return;

        const bracket = get().bracket;
        if (!bracket) return;

        const finalMatch = get().matches.find(m => m.round === 'final');
        if (!finalMatch) return;

        let decisionMethod: CompletedMunicipalResult['final_decision_method'] = 'unknown';
        if (!finalMatch.player_b_id) decisionMethod = 'bye';
        else if (finalMatch.penalties_played) decisionMethod = 'penalties';
        else if (finalMatch.extra_time_played) decisionMethod = 'extra_time';
        else if (finalMatch.regular_score_a != null && finalMatch.regular_score_b != null) decisionMethod = 'regular';

        const result: CompletedMunicipalResult = {
          id: crypto.randomUUID(),
          source_session_id: session.id,
          municipality_id: municipality.id,
          municipality_name: municipality.name,
          region_id: region.id,
          region_name: region.name,
          completed_at: session.completed_at || new Date().toISOString(),
          participant_count: bracket.participant_count,
          bracket_size: bracket.bracket_size,
          bye_count: bracket.bye_count,
          champion_participant_id: champion.id,
          champion_name: champion.display_name,
          champion_team_id: championTeam.id,
          champion_team_name: championTeam.name,
          runner_up_participant_id: runnerUp.id,
          runner_up_name: runnerUp.display_name,
          runner_up_team_id: runnerUpTeam.id,
          runner_up_team_name: runnerUpTeam.name,
          final_match_id: finalMatch.id,
          final_regular_score_champion: finalMatch.winner_id === finalMatch.player_a_id ? finalMatch.regular_score_a : finalMatch.regular_score_b,
          final_regular_score_runner_up: finalMatch.loser_id === finalMatch.player_a_id ? finalMatch.regular_score_a : finalMatch.regular_score_b,
          final_extra_time_played: finalMatch.extra_time_played,
          final_penalties_played: finalMatch.penalties_played,
          final_penalties_score_champion: finalMatch.winner_id === finalMatch.player_a_id ? finalMatch.penalties_score_a : finalMatch.penalties_score_b,
          final_penalties_score_runner_up: finalMatch.loser_id === finalMatch.player_a_id ? finalMatch.penalties_score_a : finalMatch.penalties_score_b,
          final_decision_method: decisionMethod
        };

        set(state => ({ completedMunicipalResults: [...state.completedMunicipalResults, result] }));
      },

      resolveDuplicateTeam: (input) => {
        const { qualifiedPlayerId, newTeamId, keptByQualifiedPlayerId, reason } = input;
        const qp = get().qualifiedPlayers.find(q => q.id === qualifiedPlayerId);
        
        if (!qp) throw new Error("Jugador clasificado no encontrado.");
        if (!qp.is_active) throw new Error("El jugador clasificado no está activo.");
        if (!qp.region_id) throw new Error("El jugador no tiene región asignada.");
        if (!newTeamId) throw new Error("El newTeamId es requerido.");
        if (qp.team_id === newTeamId) throw new Error("La nueva selección no puede ser igual a la anterior.");
        
        const availableTeams = get().getAvailableTeamsForRegion(qp.region_id);
        if (!availableTeams.some(t => t.id === newTeamId)) {
          throw new Error("La selección elegida ya está ocupada por otro clasificado activo en esta región.");
        }

        const previousTeamId = qp.team_id;
        
        set(state => ({
          qualifiedPlayers: state.qualifiedPlayers.map(q => 
            q.id === qualifiedPlayerId ? { ...q, team_id: newTeamId } : q
          )
        }));

        const reassignment: TeamReassignment = {
          id: crypto.randomUUID(),
          stage: 'regional',
          session_id: null,
          qualified_player_id: qualifiedPlayerId,
          previous_team_id: previousTeamId,
          new_team_id: newTeamId,
          kept_by_qualified_player_id: keptByQualifiedPlayerId,
          reason,
          resolved_by: null,
          resolved_at: new Date().toISOString()
        };

        set(state => ({
          teamReassignments: [...state.teamReassignments, reassignment]
        }));
      },

      setParticipants: (participants) => set({ participants }),
      addParticipant: (participant) => set((state) => ({ participants: [...state.participants, participant] })),
      updateParticipant: (id, data) => set((state) => ({ participants: state.participants.map(p => p.id === id ? { ...p, ...data } : p) })),
      removeParticipant: (id) => set((state) => ({ participants: state.participants.filter(p => p.id !== id) })),
      setParticipantsFromNames: (names, sessionId) => {
        const newParticipants: Participant[] = names.map((name) => ({ id: crypto.randomUUID(), session_id: sessionId, source_qualified_player_id: null, display_name: name, turn_order: null, status: 'registered', sync_status: 'synced', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }));
        set({ participants: newParticipants });
      },
      
      setAssignments: (assignments) => set({ assignments }),
      addAssignment: (assignment) => set((state) => ({ assignments: [...state.assignments, assignment] })),
      setBracket: (bracket) => set({ bracket }),
      setMatches: (matches) => set({ matches }),
      updateMatch: (id, data) => set((state) => ({ matches: state.matches.map(m => m.id === id ? { ...m, ...data } : m) })),

      getMunicipalityById: (id) => get().municipalities.find(m => m.id === id),
      getRegionById: (id) => get().regions.find(r => r.id === id),
      getTeamById: (id) => get().teams.find(t => t.id === id),
      getMatchById: (matchId) => get().matches.find(m => m.id === matchId),
      getParticipantAssignment: (participantId) => get().assignments.find(a => a.participant_id === participantId),
      getParticipantTeam: (participantId) => {
        const assignment = get().assignments.find(a => a.participant_id === participantId);
        return assignment ? get().teams.find(t => t.id === assignment.team_id) : undefined;
      },
      getMatchesByRound: () => {
        const matches = get().matches;
        return matches.reduce((acc, match) => {
          if (!acc[match.round]) acc[match.round] = [];
          acc[match.round].push(match);
          return acc;
        }, {} as Record<string, Match[]>);
      },
      getChampionAndRunnerUp: () => {
        const p = get().participants;
        return { champion: p.find(p => p.status === 'champion'), runnerUp: p.find(p => p.status === 'runner_up') };
      },
      getAssignmentsForCurrentSession: () => {
        const session = get().currentSession;
        return session ? get().assignments.filter(a => a.session_id === session.id) : [];
      },
      getOrderedParticipants: () => {
        return [...get().participants].sort((a, b) => {
          if (a.turn_order === null && b.turn_order === null) return 0;
          if (a.turn_order === null) return 1;
          if (b.turn_order === null) return -1;
          return a.turn_order - b.turn_order;
        });
      },
      getPendingParticipants: () => {
        const session = get().currentSession;
        if (!session) return [];
        const assignedIds = get().getAssignmentsForCurrentSession().map(a => a.participant_id);
        return get().getOrderedParticipants().filter(p => p.session_id === session.id && !assignedIds.includes(p.id));
      },

      getQualifiedPlayersForCurrentSession: () => {
        const session = get().currentSession;
        if (!session) return [];
        return get().qualifiedPlayers.filter(qp => qp.source_session_id === session.id);
      },

      getQualifiedPlayersByRegion: (regionId) => {
        return get().qualifiedPlayers.filter(qp => qp.region_id === regionId);
      },

      getAllCompletedMunicipalResults: () => get().completedMunicipalResults,
      
      getCompletedMunicipalResultsByRegion: (regionId) => get().completedMunicipalResults.filter(r => r.region_id === regionId),
      
      getDuplicateTeamsByRegion: (regionId) => {
        const activeQps = get().qualifiedPlayers.filter(qp => qp.region_id === regionId && qp.is_active);
        const map = new Map<string, Array<{ qualified_player_id: string; municipality_id: string; municipality_name: string; participant_name: string; rank: 'champion' | 'runner_up'; team_id: string; team_name: string }>>();
        
        activeQps.forEach(qp => {
          const team = get().getTeamById(qp.team_id);
          const municipality = get().getMunicipalityById(qp.municipality_id!);
          const snapshot = get().completedMunicipalResults.find(r => r.source_session_id === qp.source_session_id);
          let participantName = "Desconocido";
          if (snapshot) {
            participantName = qp.rank === 'champion' ? snapshot.champion_name : snapshot.runner_up_name;
          }

          if (team && municipality) {
            const list = map.get(team.id) || [];
            list.push({
              qualified_player_id: qp.id,
              municipality_id: municipality.id,
              municipality_name: municipality.name,
              participant_name: participantName,
              rank: qp.rank as 'champion' | 'runner_up',
              team_id: team.id,
              team_name: team.name
            });
            map.set(team.id, list);
          }
        });

        const duplicates: ReturnType<TournamentState['getDuplicateTeamsByRegion']> = [];
        map.forEach((occurrences, teamId) => {
          if (occurrences.length > 1) {
            const team = get().getTeamById(teamId);
            if (team) {
              duplicates.push({ team_id: team.id, team_name: team.name, occurrences });
            }
          }
        });
        return duplicates;
      },
      
      getAvailableTeamsForRegion: (regionId) => {
        const activeQps = get().qualifiedPlayers.filter(qp => qp.region_id === regionId && qp.is_active);
        const usedTeamIds = activeQps.map(qp => qp.team_id);
        return get().teams.filter(t => t.is_active !== false && !usedTeamIds.includes(t.id));
      },

      getRegionReadiness: (regionId) => {
        const totalMunicipalities = get().municipalities.filter(m => m.region_id === regionId).length;
        const completedMunicipalities = get().completedMunicipalResults.filter(r => r.region_id === regionId).length;
        const expectedQualifiedPlayers = completedMunicipalities * 2;
        const actualQualifiedPlayers = get().qualifiedPlayers.filter(qp => qp.region_id === regionId && qp.is_active).length;
        const duplicateGroups = get().getDuplicateTeamsByRegion(regionId).length;
        const pendingMunicipalities = totalMunicipalities - completedMunicipalities;

        return {
          isReady: completedMunicipalities > 0 && completedMunicipalities === totalMunicipalities && duplicateGroups === 0,
          totalMunicipalities,
          completedMunicipalities,
          expectedQualifiedPlayers,
          actualQualifiedPlayers,
          duplicateGroups,
          pendingMunicipalities
        };
      },
      
      getAvailableTeams: () => {
        const session = get().currentSession;
        if (!session) return get().teams;
        const assignments = get().getAssignmentsForCurrentSession();
        return get().teams.filter(t => !assignments.some(a => a.team_id === t.id));
      },

      validateParticipantNames: (names) => {
        const errors: string[] = [];
        if (names.length < 8) errors.push('Mínimo 8 participantes requeridos.');
        if (names.length > 32) errors.push('Máximo 32 participantes permitidos.');
        
        const uniqueNames = new Set(names);
        if (uniqueNames.size !== names.length) {
          errors.push('Existen nombres duplicados exactos en la lista.');
        }
        
        const hasEmpty = names.some(n => n.trim() === '');
        if (hasEmpty) {
          errors.push('Existen nombres vacíos en la lista.');
        }

        return { valid: errors.length === 0, errors };
      }
    }),
    {
      name: 'mundial-fc26-tournament-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentSession: state.currentSession,
        participants: state.participants,
        assignments: state.assignments,
        bracket: state.bracket,
        matches: state.matches,
        qualifiedPlayers: state.qualifiedPlayers,
        completedMunicipalResults: state.completedMunicipalResults,
        teamReassignments: state.teamReassignments
      }),
    }
  )
);
