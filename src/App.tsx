/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OllamaProvider, useOllama } from './context/OllamaContext';
import { Header } from './components/header/Header';
import { ChatInterface } from './components/chat/ChatInterface';
import { ModelDashboard } from './components/models/ModelDashboard';
import { TerminalWindow } from './components/terminal/TerminalWindow';
import { TelemetryDrawer } from './components/telemetry/TelemetryDrawer';

const AppContent: React.FC = () => {
  const { activeTab, theme } = useOllama();

  return (
    <div
      data-theme={theme}
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none antialiased transition-colors duration-200 ${
        theme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#090b10] text-slate-100'
      }`}
    >
      {/* Header with Ollama Brand, Model Selector, Colab Indicators, Theme Toggle, Telemetry toggle */}
      <Header />

      {/* Main Workspace + Expandable Telemetry Side Window */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Dynamic Main View */}
        <main className="flex-1 flex overflow-hidden relative">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'models' && <ModelDashboard />}
          {activeTab === 'terminal' && <TerminalWindow />}
        </main>

        {/* Dedicated Expandable Side Window for Logs, Error Tracking & Performance Telemetry */}
        <TelemetryDrawer />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <OllamaProvider>
      <AppContent />
    </OllamaProvider>
  );
}
