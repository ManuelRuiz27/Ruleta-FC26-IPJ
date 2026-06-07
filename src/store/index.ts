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
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (id: string, data: Partial<Participant>) => void;
  removeParticipant: (id: string) => void;
  
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;

  setBracket: (bracket: Bracket | null) => void;
  setMatches: (matches: Match[]) => void;
  updateMatch: (id: string, data: Partial<Match>) => void;
}

export const useTournamentStore = create<TournamentState>((set) => ({
  regions: initialRegions,
  municipalities: initialMunicipalities,
  teams: initialTeams,
  
  currentSession: null,
  participants: [],
  assignments: [],
  bracket: null,
  matches: [],

  setCurrentSession: (session) => set({ currentSession: session }),
  
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) => set((state) => ({ participants: [...state.participants, participant] })),
  updateParticipant: (id, data) => set((state) => ({
    participants: state.participants.map(p => p.id === id ? { ...p, ...data } : p)
  })),
  removeParticipant: (id) => set((state) => ({
    participants: state.participants.filter(p => p.id !== id)
  })),

  setAssignments: (assignments) => set({ assignments }),
  addAssignment: (assignment) => set((state) => ({ assignments: [...state.assignments, assignment] })),

  setBracket: (bracket) => set({ bracket }),
  setMatches: (matches) => set({ matches }),
  updateMatch: (id, data) => set((state) => ({
    matches: state.matches.map(m => m.id === id ? { ...m, ...data } : m)
  })),
}));
