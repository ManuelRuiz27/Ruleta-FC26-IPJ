import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  Region, Municipality, Team, DrawSession, Participant, Assignment, 
  Bracket, Match 
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
        let initialRound = 'round_32';
        if (participants.length <= 8) {
          bracketSize = 8;
          initialRound = 'quarterfinal';
        } else if (participants.length <= 16) {
          bracketSize = 16;
          initialRound = 'round_16';
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

        const matchesCount = bracketSize / 2;
        const newMatches: Match[] = [];
        
        // Asignación simple de BYEs
        // Primero llenamos player_a en todos los matches, luego llenamos player_b con los restantes.
        let pIdx = 0;
        
        // Crear los matches vacíos o con player A
        for (let i = 0; i < matchesCount; i++) {
          const pA = participants[pIdx++];
          const assignmentA = assignments.find(a => a.participant_id === pA.id);
          
          newMatches.push({
            id: crypto.randomUUID(),
            bracket_id: bracketId,
            session_id: session.id,
            round: initialRound as any, // casting to bypass generic round type checking if needed
            match_number: i + 1,
            next_match_id: null,
            player_a_id: pA.id,
            team_a_id: assignmentA!.team_id,
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
            status: 'pending', // actualizaremos esto en la siguiente fase
            completed_by: null,
            completed_at: null,
            locked_at: null,
            deleted_at: null,
            created_at: new Date().toISOString()
          });
        }
        
        // Asignar player B a los matches que correspondan
        for (let i = 0; i < matchesCount && pIdx < participants.length; i++) {
          const pB = participants[pIdx++];
          const assignmentB = assignments.find(a => a.participant_id === pB.id);
          
          newMatches[i].player_b_id = pB.id;
          newMatches[i].team_b_id = assignmentB!.team_id;
          newMatches[i].status = 'ready';
        }

        set(state => ({
          bracket: newBracket,
          matches: newMatches,
          currentSession: { ...state.currentSession!, status: 'bracket_ready' }
        }));
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
