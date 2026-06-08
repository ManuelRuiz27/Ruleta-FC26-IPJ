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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/estatal/dashboard" replace />} />
        
        <Route element={<Layout />}>
          <Route path="/estatal/dashboard" element={<EstatalDashboard />} />
          <Route path="/regional/:regionId" element={<RegionalDashboard />} />
          <Route path="/regional/:regionId/resolucion" element={<RegionalResolution />} />
          <Route path="/regional/:regionId/bracket" element={<RegionalBracket />} />
          <Route path="/regional/:regionId/partido/:matchId" element={<MatchScoreCapture />} />
          
          <Route path="/municipal/:id" element={<MunicipalSetup />} />
          <Route path="/municipal/:id/registro" element={<ParticipantsRegistry />} />
          <Route path="/municipal/:id/ruleta" element={<RouletteScreen />} />
          <Route path="/municipal/:id/asignaciones" element={<AssignmentsBoard />} />
          <Route path="/municipal/:id/bracket" element={<MunicipalBracket />} />
          <Route path="/municipal/:id/partido/:matchId" element={<MatchScoreCapture />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
