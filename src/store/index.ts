import { create } from 'zustand';
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
  startDraw: () => void;
  assignRandomTeamToParticipant: (participantId: string) => Assignment;
  
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
  getAssignmentsForCurrentSession: () => Assignment[];
  getOrderedParticipants: () => Participant[];
  getPendingParticipants: () => Participant[];
  getAvailableTeams: () => Team[];
  validateParticipantNames: (names: string[]) => { valid: boolean; errors: string[] };
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
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
  
  getAssignmentsForCurrentSession: () => {
    const session = get().currentSession;
    if (!session) return [];
    return get().assignments.filter(a => a.session_id === session.id);
  },
  
  getOrderedParticipants: () => {
    return [...get().participants].sort((a, b) => (a.turn_order || 0) - (b.turn_order || 0));
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
}));
