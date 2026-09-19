import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { LiveDetection } from './pages/LiveDetection';
import { ThreatAnalytics } from './pages/ThreatAnalytics';
import { AttackIntelligence } from './pages/AttackIntelligence';
import { RareAttacks } from './pages/RareAttacks';
import { AiPrediction } from './pages/AiPrediction';
import { ModelIntelligence } from './pages/ModelIntelligence';
import { ApiMonitor } from './pages/ApiMonitor';
import { SystemHealth } from './pages/SystemHealth';
import { Settings } from './pages/Settings';
import { DemoModeProvider } from './hooks/useDemoMode';

export const App: React.FC = () => {
  return (
    <DemoModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="live-detection" element={<LiveDetection />} />
            <Route path="threat-analytics" element={<ThreatAnalytics />} />
            <Route path="attack-intelligence" element={<AttackIntelligence />} />
            <Route path="rare-attacks" element={<RareAttacks />} />
            <Route path="ai-prediction" element={<AiPrediction />} />
            <Route path="model-intelligence" element={<ModelIntelligence />} />
            <Route path="api-monitor" element={<ApiMonitor />} />
            <Route path="system-health" element={<SystemHealth />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DemoModeProvider>
  );
};

export default App;
