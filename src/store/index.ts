import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  Region, Municipality, Team, DrawSession, Participant, Assignment, 
  Bracket, Match, RoundType 
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

      setCurrentSession: (session) => set({ currentSession: session }),
      createMunicipalSession: (municipalityId, regionId) => {
        const session: DrawSession = {
          id: crypto.randomUUID(),
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
      resetMunicipalSession: () => set({ currentSession: null, participants: [], assignments: [], bracket: null, matches: [] }),
      clearLocalTournamentState: () => set({ currentSession: null, participants: [], assignments: [], bracket: null, matches: [] }),
      
      startDraw: () => {
        const session = get().currentSession;
        if (!session) throw new Error("No hay sesión activa");
        if (get().participants.length === 0) throw new Error("No hay participantes registrados");
        if (session.status !== 'ready_for_draw') return;

        const randomized = [...get().participants].sort(() => Math.random() - 0.5);
        const orderedParticipants = randomized.map((p, index) => ({
          ...p,
          turn_order: index + 1
        }));

        set({ 
          currentSession: { ...session, status: 'drawing', started_at: new Date().toISOString() },
          participants: orderedParticipants 
        });
      },

      assignRandomTeamToParticipant: (participantId) => {
        const session = get().currentSession;
        if (!session) throw new Error("No hay sesión activa");
        
        // Prevent duplicate assignment for the same participant in current session
        const hasAssignment = get().assignments.some(a => a.participant_id === participantId && a.session_id === session.id);
        if (hasAssignment) {
          throw new Error("Este participante ya tiene selección asignada.");
        }
        
        const availableTeams = get().getAvailableTeams();
        if (availableTeams.length === 0) throw new Error("No hay selecciones disponibles");
        
        const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        
        const newAssignment: Assignment = {
          id: crypto.randomUUID(),
          session_id: session.id,
          participant_id: participantId,
          team_id: randomTeam.id,
          source: 'municipal_draw',
          assigned_at: new Date().toISOString(),
          created_by: null,
          sync_status: 'synced'
        };
        
        const pendingParticipants = get().getPendingParticipants();
        const isLast = pendingParticipants.length === 1 && pendingParticipants[0].id === participantId;
        
        set(state => ({
          assignments: [...state.assignments, newAssignment],
          participants: state.participants.map(p => p.id === participantId ? { ...p, status: 'assigned' } : p),
          currentSession: isLast ? { ...state.currentSession!, status: 'draw_completed', completed_at: new Date().toISOString() } : state.currentSession
        }));
        
        return newAssignment;
      },

      generateMunicipalBracket: () => {
        const session = get().currentSession;
        if (!session) throw new Error("No hay sesión activa");
        if (session.status !== 'draw_completed') throw new Error("El sorteo debe completarse primero");
        
        const participants = get().getOrderedParticipants();
        const assignments = get().getAssignmentsForCurrentSession();
        
        if (participants.length < 8 || participants.length > 32) {
          throw new Error("La cantidad de participantes debe estar entre 8 y 32");
        }
        
        if (assignments.length !== participants.length) {
          throw new Error("Todos los participantes deben tener una selección asignada");
        }

        let bracketSize = 32;
        if (participants.length <= 8) {
          bracketSize = 8;
        } else if (participants.length <= 16) {
          bracketSize = 16;
        }

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

        // Generar estructura completa del bracket
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
              player_a_id: null,
              team_a_id: null,
              player_b_id: null,
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
            });
          }

          // Conectar con ronda previa
          if (r > 0) {
            for (let i = 0; i < currentRoundMatches.length; i++) {
              const prevMatch = currentRoundMatches[i];
              const nextMatchIndex = Math.floor(i / 2);
              prevMatch.next_match_id = roundMatches[nextMatchIndex].id;
            }
          }

          allMatches.push(...roundMatches);
          currentRoundMatches = roundMatches;
        }

        // Poblar la primera ronda con jugadores y byes
        const initialMatches = allMatches.filter(m => m.round === rounds[0]);
        let pIdx = 0;
        
        for (let i = 0; i < initialMatches.length; i++) {
          const pA = participants[pIdx++];
          const assignmentA = assignments.find(a => a.participant_id === pA.id);
          initialMatches[i].player_a_id = pA.id;
          initialMatches[i].team_a_id = assignmentA!.team_id;
        }
        
        for (let i = 0; i < initialMatches.length && pIdx < participants.length; i++) {
          const pB = participants[pIdx++];
          const assignmentB = assignments.find(a => a.participant_id === pB.id);
          initialMatches[i].player_b_id = pB.id;
          initialMatches[i].team_b_id = assignmentB!.team_id;
          initialMatches[i].status = 'ready';
        }

        // Configurar estado inicial
        set(state => ({
          bracket: newBracket,
          matches: allMatches,
          currentSession: { ...state.currentSession!, status: 'bracket_ready' }
        }));

        // Procesar BYEs automáticamente
        for (const match of initialMatches) {
          if (match.player_a_id && !match.player_b_id) {
            get().advanceWinnerToNextMatch(match.id, match.player_a_id);
          }
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

        // Marcar partido actual como completado
        const updatedMatch: Match = {
          ...match,
          winner_id: winnerId,
          loser_id: loserId,
          status: 'completed',
          completed_at: new Date().toISOString()
        };

        const newMatches = [...matches];
        newMatches[matchIndex] = updatedMatch;

        // Actualizar participantes (campeón/subcampeón) si es la final, o simplemente avanzar
        let sessionCompleted = false;

        if (updatedMatch.next_match_id) {
          const nextMatchIndex = newMatches.findIndex(m => m.id === updatedMatch.next_match_id);
          if (nextMatchIndex !== -1) {
            const nextMatch = { ...newMatches[nextMatchIndex] };
            const isPlayerA = (updatedMatch.match_number % 2) !== 0;
            
            if (isPlayerA) {
              nextMatch.player_a_id = winnerId;
              nextMatch.team_a_id = winnerTeamId;
            } else {
              nextMatch.player_b_id = winnerId;
              nextMatch.team_b_id = winnerTeamId;
            }
            
            if (nextMatch.player_a_id && nextMatch.player_b_id) {
              nextMatch.status = 'ready';
            }
            
            newMatches[nextMatchIndex] = nextMatch;
          }
        } else {
          // Es la final
          sessionCompleted = true;
          const participants = get().participants;
          set({
            participants: participants.map(p => {
              if (p.id === winnerId) return { ...p, status: 'champion' };
              if (p.id === loserId) return { ...p, status: 'runner_up' };
              return { ...p, status: 'eliminated' };
            })
          });
        }

        set(state => ({
          matches: newMatches,
          currentSession: sessionCompleted 
            ? { ...state.currentSession!, status: 'completed', completed_at: new Date().toISOString() }
            : state.currentSession
        }));
      },

      submitMatchResult: (input) => {
        const { matchId, regularScoreA, regularScoreB, extraTimePlayed, penaltiesPlayed, penaltiesScoreA, penaltiesScoreB, winnerId } = input;
        
        const match = get().matches.find(m => m.id === matchId);
        if (!match) throw new Error("Partido no encontrado");
        if (!match.player_a_id || !match.player_b_id) throw new Error("El partido no tiene ambos jugadores");
        if (match.status !== 'ready') throw new Error("El partido no está listo para capturar resultado");
        
        if (regularScoreA < 0 || regularScoreB < 0) throw new Error("Los marcadores no pueden ser negativos");
        
        if (regularScoreA !== regularScoreB) {
          const expectedWinnerId = regularScoreA > regularScoreB ? match.player_a_id : match.player_b_id;
          if (winnerId !== expectedWinnerId) throw new Error("El ganador seleccionado no coincide con el marcador regular");
        } else {
          if (!extraTimePlayed) throw new Error("Un empate requiere tiempos extra");
          if (penaltiesPlayed) {
            if (penaltiesScoreA == null || penaltiesScoreB == null) throw new Error("Debe ingresar marcadores de penales");
            if (penaltiesScoreA === penaltiesScoreB) throw new Error("Los penales no pueden terminar en empate");
            const expectedWinnerId = penaltiesScoreA > penaltiesScoreB ? match.player_a_id : match.player_b_id;
            if (winnerId !== expectedWinnerId) throw new Error("El ganador seleccionado no coincide con el marcador de penales");
          }
        }

        const matches = get().matches;
        const matchIndex = matches.findIndex(m => m.id === matchId);
        
        const updatedMatch: Match = {
          ...match,
          regular_score_a: regularScoreA,
          regular_score_b: regularScoreB,
          extra_time_played: extraTimePlayed,
          penalties_played: penaltiesPlayed,
          penalties_score_a: penaltiesScoreA ?? null,
          penalties_score_b: penaltiesScoreB ?? null,
          status: 'completed', // prevent advanceWinnerToNextMatch from double setting status
        };

        const newMatches = [...matches];
        newMatches[matchIndex] = updatedMatch;
        set({ matches: newMatches });

        // Utilizamos la función base para el avance y marcado final
        get().advanceWinnerToNextMatch(matchId, winnerId);
      },

      setParticipants: (participants) => set({ participants }),
      addParticipant: (participant) => set((state) => ({ participants: [...state.participants, participant] })),
      updateParticipant: (id, data) => set((state) => ({
        participants: state.participants.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      removeParticipant: (id) => set((state) => ({
        participants: state.participants.filter(p => p.id !== id)
      })),
      setParticipantsFromNames: (names, sessionId) => {
        const newParticipants: Participant[] = names.map((name) => ({
          id: crypto.randomUUID(),
          session_id: sessionId,
          source_qualified_player_id: null,
          display_name: name,
          turn_order: null,
          status: 'registered',
          sync_status: 'synced',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        }));
        set({ participants: newParticipants });
      },

      setAssignments: (assignments) => set({ assignments }),
      addAssignment: (assignment) => set((state) => ({ assignments: [...state.assignments, assignment] })),

      setBracket: (bracket) => set({ bracket }),
      setMatches: (matches) => set({ matches }),
      updateMatch: (id, data) => set((state) => ({
        matches: state.matches.map(m => m.id === id ? { ...m, ...data } : m)
      })),

      getMunicipalityById: (id) => get().municipalities.find(m => m.id === id),
      getRegionById: (id) => get().regions.find(r => r.id === id),
      getTeamById: (id) => get().teams.find(t => t.id === id),
      getMatchById: (matchId) => get().matches.find(m => m.id === matchId),
      
      getParticipantAssignment: (participantId) => {
        return get().assignments.find(a => a.participant_id === participantId);
      },
      
      getParticipantTeam: (participantId) => {
        const assignment = get().getParticipantAssignment(participantId);
        if (!assignment) return undefined;
        return get().getTeamById(assignment.team_id);
      },
      
      getMatchesByRound: () => {
        const matches = get().matches;
        return matches.reduce((acc, match) => {
          if (!acc[match.round]) {
            acc[match.round] = [];
          }
          acc[match.round].push(match);
          return acc;
        }, {} as Record<string, Match[]>);
      },
      
      getChampionAndRunnerUp: () => {
        const participants = get().participants;
        const champion = participants.find(p => p.status === 'champion');
        const runnerUp = participants.find(p => p.status === 'runner_up');
        return { champion, runnerUp };
      },
      
      getAssignmentsForCurrentSession: () => {
        const session = get().currentSession;
        if (!session) return [];
        return get().assignments.filter(a => a.session_id === session.id);
      },
      
      getOrderedParticipants: () => {
        return [...get().participants].sort((a, b) => {
          if (a.turn_order !== null && b.turn_order !== null) return a.turn_order - b.turn_order;
          if (a.turn_order !== null) return -1;
          if (b.turn_order !== null) return 1;
          return 0;
        });
      },
      
      getPendingParticipants: () => {
        const session = get().currentSession;
        if (!session) return [];
        const assignments = get().getAssignmentsForCurrentSession();
        return get().getOrderedParticipants().filter(p => !assignments.some(a => a.participant_id === p.id));
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
        matches: state.matches
      }),
    }
  )
);
