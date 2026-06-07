import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  Region, Municipality, Team, DrawSession, Participant, Assignment, 
  Bracket, Match, RoundType, QualifiedPlayer 
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
  resetMunicipalSession: () => void;
  clearLocalTournamentState: () => void;
  qualifiedPlayers: QualifiedPlayer[];

  startDraw: () => void;
  assignRandomTeamToParticipant: (participantId: string) => Assignment;
  generateMunicipalBracket: () => void;
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

      setCurrentSession: (session) => set({ currentSession: session }),
      createMunicipalSession: (municipalityId, regionId) => {
        const id = crypto.randomUUID();
        const session: DrawSession = {
          id,
          stage: 'municipal',
          status: 'draft',
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
        set({ currentSession: session, participants: [], assignments: [], bracket: null, matches: [], qualifiedPlayers: [] });
        return session;
      },
      resetMunicipalSession: () => set({ currentSession: null, participants: [], assignments: [], bracket: null, matches: [], qualifiedPlayers: [] }),
      clearLocalTournamentState: () => set({ currentSession: null, participants: [], assignments: [], bracket: null, matches: [], qualifiedPlayers: [] }),
      
      startDraw: () => {
        const session = get().currentSession;
        if (!session) throw new Error("No hay sesión activa");
        set({ 
          currentSession: { ...session, status: 'drawing', started_at: new Date().toISOString() }
        });
      },

      assignRandomTeamToParticipant: (participantId) => {
        const state = get();
        if (!state.currentSession) throw new Error("No hay sesión activa");
        if (state.currentSession.status !== 'drawing') throw new Error("El sorteo no está activo");
        
        const participant = state.participants.find(p => p.id === participantId);
        if (!participant) throw new Error("Participante no encontrado");
        
        const assignedTeamIds = state.assignments.map(a => a.team_id);
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
          sync_status: 'pending_sync'
        };
        
        const newAssignments = [...state.assignments, newAssignment];
        set({ assignments: newAssignments });
        
        if (newAssignments.length === state.participants.length) {
          set(s => ({ currentSession: { ...s.currentSession!, status: 'draw_completed' } }));
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

      advanceWinnerToNextMatch: (matchId: string, winnerId: string) => {
        const matches = get().matches;
        const matchIndex = matches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) return;

        const match = matches[matchIndex];
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

        if (sessionCompleted) get().createMunicipalQualifiedPlayers();
      },

      submitMatchResult: (input) => {
        const { matchId, regularScoreA, regularScoreB, extraTimePlayed, penaltiesPlayed, penaltiesScoreA, penaltiesScoreB, winnerId } = input;
        const match = get().matches.find(m => m.id === matchId);
        if (!match) throw new Error("Partido no encontrado");
        if (regularScoreA !== regularScoreB) {
          if (winnerId !== (regularScoreA > regularScoreB ? match.player_a_id : match.player_b_id)) throw new Error("Ganador no coincide");
        } else {
          if (!extraTimePlayed) throw new Error("Empate requiere tiempo extra");
          if (penaltiesPlayed) {
            if (penaltiesScoreA == null || penaltiesScoreB == null) throw new Error("Faltan penales");
            if (winnerId !== (penaltiesScoreA > penaltiesScoreB ? match.player_a_id : match.player_b_id)) throw new Error("Ganador no coincide");
          }
        }
        const matches = get().matches;
        const matchIndex = matches.findIndex(m => m.id === matchId);
        const newMatches = [...matches];
        newMatches[matchIndex] = { ...match, regular_score_a: regularScoreA, regular_score_b: regularScoreB, extra_time_played: extraTimePlayed, penalties_played: penaltiesPlayed, penalties_score_a: penaltiesScoreA ?? null, penalties_score_b: penaltiesScoreB ?? null, status: 'completed' };
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

      setParticipants: (participants) => set({ participants }),
      addParticipant: (participant) => set((state) => ({ participants: [...state.participants, participant] })),
      updateParticipant: (id, data) => set((state) => ({ participants: state.participants.map(p => p.id === id ? { ...p, ...data } : p) })),
      removeParticipant: (id) => set((state) => ({ participants: state.participants.filter(p => p.id !== id) })),
      setParticipantsFromNames: (names, sessionId) => {
        const newParticipants: Participant[] = names.map((name) => ({ id: crypto.randomUUID(), session_id: sessionId, source_qualified_player_id: null, display_name: name, turn_order: null, status: 'registered', sync_status: 'pending_sync', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }));
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
        return get().participants.filter(p => !assignedIds.includes(p.id));
      },

      getQualifiedPlayersForCurrentSession: () => {
        const session = get().currentSession;
        if (!session) return [];
        return get().qualifiedPlayers.filter(qp => qp.source_session_id === session.id);
      },

      getQualifiedPlayersByRegion: (regionId) => {
        return get().qualifiedPlayers.filter(qp => qp.region_id === regionId);
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
        qualifiedPlayers: state.qualifiedPlayers
      }),
    }
  )
);
