import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { SidebarLeft } from './components/layout/SidebarLeft';
import { DashboardView } from './components/views/DashboardView';
import { DataStudioView } from './components/views/DataStudioView';
import { Editor3DView } from './components/views/Editor3DView';
import { CollaborateView } from './components/views/CollaborateView';
import { TemplatesBrowserView } from './components/views/TemplatesBrowserView';
import { AssetLibraryView } from './components/views/AssetLibraryView';
import { ProjectSettingsView } from './components/views/ProjectSettingsView';
import { MessagingView } from './components/views/MessagingView';
import { DataQualityReportView } from './components/views/DataQualityReportView';
import { DataDistributionAnalysisView } from './components/views/DataDistributionAnalysisView';
import { LoginView } from './components/views/LoginView';
import { Toast } from './components/Toast';
import { useAppStore } from './store/useAppStore';

function App() {
  const { token } = useAppStore();

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="bg-background text-on-surface font-body overflow-hidden h-screen w-screen flex flex-col">
        <Header />
        <Toast />
        
        <div className="flex flex-1 pt-16 h-full overflow-hidden">
          <SidebarLeft />
          
          {/* Main Content Area */}
          <main className="ml-64 flex-1 relative bg-surface-container-lowest overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/datastudio" element={<DataStudioView />} />
              <Route path="/editor3d" element={<Editor3DView />} />
              <Route path="/collaborate" element={<CollaborateView />} />
              <Route path="/messaging" element={<MessagingView />} />
              <Route path="/templates" element={<TemplatesBrowserView />} />
              <Route path="/library" element={<AssetLibraryView />} />
              <Route path="/settings" element={<ProjectSettingsView />} />
              <Route path="/quality-report" element={<DataQualityReportView />} />
              <Route path="/distribution-analysis" element={<DataDistributionAnalysisView />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
