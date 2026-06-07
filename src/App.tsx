import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import EstatalDashboard from './features/dashboard/EstatalDashboard';
import MunicipalSetup from './features/setup/MunicipalSetup';
import ParticipantsRegistry from './features/setup/ParticipantsRegistry';
import RouletteScreen from './features/draw/RouletteScreen';
import AssignmentsBoard from './features/draw/AssignmentsBoard';
import MunicipalBracket from './features/bracket/MunicipalBracket';
import MatchScoreCapture from './features/bracket/MatchScoreCapture';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/estatal/dashboard" replace />} />
        
        <Route element={<Layout />}>
          <Route path="/estatal/dashboard" element={<EstatalDashboard />} />
          
          <Route path="/municipal/:id" element={<MunicipalSetup />} />
          <Route path="/municipal/:id/registro" element={<ParticipantsRegistry />} />
          <Route path="/municipal/:id/ruleta" element={<RouletteScreen />} />
          <Route path="/municipal/:id/asignaciones" element={<AssignmentsBoard />} />
          <Route path="/municipal/:id/bracket" element={<MunicipalBracket />} />
          <Route path="/municipal/:id/partido/:matchId" element={<MatchScoreCapture />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
