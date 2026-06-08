import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import NotFound from './components/NotFound';
import EstatalDashboard from './features/dashboard/EstatalDashboard';
import MunicipalSetup from './features/setup/MunicipalSetup';
import ParticipantsRegistry from './features/setup/ParticipantsRegistry';
import RouletteScreen from './features/draw/RouletteScreen';
import AssignmentsBoard from './features/draw/AssignmentsBoard';
import MunicipalBracket from './features/bracket/MunicipalBracket';
import MatchScoreCapture from './features/bracket/MatchScoreCapture';
import RegionalDashboard from './features/dashboard/RegionalDashboard';
import RegionalResolution from './features/dashboard/RegionalResolution';
import RegionalBracket from './features/bracket/RegionalBracket';
import StateBracket from './features/bracket/StateBracket';
import StateResolution from './features/dashboard/StateResolution';
import AccessGate from './components/AccessGate';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/estatal/dashboard" replace />} />
        
        <Route element={<Layout />}>
          <Route path="/estatal/dashboard" element={<AccessGate scope="state"><EstatalDashboard /></AccessGate>} />
          <Route path="/estatal/resolucion" element={<AccessGate scope="state"><StateResolution /></AccessGate>} />
          <Route path="/estatal/bracket" element={<AccessGate scope="state"><StateBracket /></AccessGate>} />
          <Route path="/estatal/partido/:matchId" element={<AccessGate scope="state"><MatchScoreCapture /></AccessGate>} />
          <Route path="/regional/:regionId" element={<AccessGate scope="regional"><RegionalDashboard /></AccessGate>} />
          <Route path="/regional/:regionId/resolucion" element={<AccessGate scope="regional"><RegionalResolution /></AccessGate>} />
          <Route path="/regional/:regionId/bracket" element={<AccessGate scope="regional"><RegionalBracket /></AccessGate>} />
          <Route path="/regional/:regionId/partido/:matchId" element={<AccessGate scope="regional"><MatchScoreCapture /></AccessGate>} />
          
          <Route path="/municipal/:id" element={<AccessGate scope="municipal"><MunicipalSetup /></AccessGate>} />
          <Route path="/municipal/:id/registro" element={<AccessGate scope="municipal"><ParticipantsRegistry /></AccessGate>} />
          <Route path="/municipal/:id/ruleta" element={<AccessGate scope="municipal"><RouletteScreen /></AccessGate>} />
          <Route path="/municipal/:id/asignaciones" element={<AccessGate scope="municipal"><AssignmentsBoard /></AccessGate>} />
          <Route path="/municipal/:id/bracket" element={<AccessGate scope="municipal"><MunicipalBracket /></AccessGate>} />
          <Route path="/municipal/:id/partido/:matchId" element={<AccessGate scope="municipal"><MatchScoreCapture /></AccessGate>} />
          <Route path="/municipal/:id/evento/:eventId/registro" element={<AccessGate scope="municipal"><ParticipantsRegistry /></AccessGate>} />
          <Route path="/municipal/:id/evento/:eventId/ruleta" element={<AccessGate scope="municipal"><RouletteScreen /></AccessGate>} />
          <Route path="/municipal/:id/evento/:eventId/asignaciones" element={<AccessGate scope="municipal"><AssignmentsBoard /></AccessGate>} />
          <Route path="/municipal/:id/evento/:eventId/bracket" element={<AccessGate scope="municipal"><MunicipalBracket /></AccessGate>} />
          <Route path="/municipal/:id/evento/:eventId/partido/:matchId" element={<AccessGate scope="municipal"><MatchScoreCapture /></AccessGate>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
