import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSocSection } from '../components/soc/HeroSocSection';
import { LiveSecurityStatus } from '../components/soc/LiveSecurityStatus';
import { PreventionLayerSection } from '../components/soc/PreventionLayerSection';
import { CyberThreatDashboardPreview } from '../components/soc/CyberThreatDashboardPreview';
import { AiDetectionEngineSection } from '../components/soc/AiDetectionEngineSection';
import { ThreatIntelligenceCatalog } from '../components/soc/ThreatIntelligenceCatalog';
import { AiConfidencePanel } from '../components/soc/AiConfidencePanel';
import { NetworkTopologySection } from '../components/soc/NetworkTopologySection';
import { SecurityAnalyticsSection } from '../components/soc/SecurityAnalyticsSection';
import { WhyCyvoraCards } from '../components/soc/WhyCyvoraCards';
import { SecurityArchitectureDiagram } from '../components/soc/SecurityArchitectureDiagram';
import { ProductInterfaceNav } from '../components/soc/ProductInterfaceNav';
import { AlertCenterSection } from '../components/soc/AlertCenterSection';
import { EnterpriseFooter } from '../components/soc/EnterpriseFooter';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    switch (tabId) {
      case 'live-monitor':
        navigate('/live-detection');
        break;
      case 'threat-intelligence':
        navigate('/attack-intelligence');
        break;
      case 'analytics':
        navigate('/threat-analytics');
        break;
      case 'ai-models':
        navigate('/model-intelligence');
        break;
      case 'alerts':
        navigate('/system-health');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        setActiveTab('overview');
        break;
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-8">
      {/* 11. PRODUCT INTERFACE TOOLBAR */}
      <ProductInterfaceNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 1. HERO SECTION */}
      <HeroSocSection
        onLaunchDashboard={() => {
          const el = document.getElementById('cyber-threat-monitor');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreEngine={() => {
          const el = document.getElementById('ai-detection-engine');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. LIVE SECURITY STATUS */}
      <LiveSecurityStatus />

      {/* DEDICATED PREVENTION LAYER SECTION */}
      <div id="prevention-layer">
        <PreventionLayerSection />
      </div>

      {/* 3. CYBER THREAT DASHBOARD */}
      <div id="cyber-threat-monitor">
        <CyberThreatDashboardPreview />
      </div>

      {/* 4. AI DETECTION ENGINE ARCHITECTURE */}
      <div id="ai-detection-engine">
        <AiDetectionEngineSection />
      </div>

      {/* 5. THREAT INTELLIGENCE CATALOG */}
      <div id="threat-intelligence">
        <ThreatIntelligenceCatalog />
      </div>

      {/* 6. AI CONFIDENCE VISUALIZATION */}
      <AiConfidencePanel />

      {/* 7. NETWORK TOPOLOGY VISUALIZATION */}
      <NetworkTopologySection />

      {/* 8. SECURITY ANALYTICS */}
      <SecurityAnalyticsSection />

      {/* 9. WHY CYVORA */}
      <WhyCyvoraCards />

      {/* 10. SECURITY ARCHITECTURE */}
      <SecurityArchitectureDiagram />

      {/* 12. ALERT CENTER */}
      <div id="alert-center">
        <AlertCenterSection />
      </div>

      {/* 13. ENTERPRISE FOOTER */}
      <EnterpriseFooter />
    </div>
  );
};

export default Dashboard;
