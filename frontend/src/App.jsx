import { useState } from "react";
import { useSelector } from "react-redux";
import IntakePanel from "./components/IntakePanel";
import RCAForm from "./components/RCAForm";
import AICopilotDrawer from "./components/AICopilotDrawer";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const rca = useSelector((state) => state.rca);

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 print:hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              RCA
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg">
                API Pharmaceutical RCA
              </h1>
              <p className="text-xs text-slate-500">
                Root Cause Analysis &amp; CAPA Module
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Backend: Online
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Open AI Copilot"
            >
              🤖
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold">
              QA
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] print:h-auto overflow-hidden print:overflow-visible">
        {/* Left: Intake Panel (Print me hide ho jayega) */}
        <div className="md:w-80 border-r border-slate-200 bg-white overflow-y-auto p-4 shrink-0 print:hidden hidden-print">
          <IntakePanel />
        </div>

        {/* Center: RCA Form (Print me full width expand hoga) */}
        <div className="flex-1 overflow-y-auto print:overflow-visible p-6 print:p-0">
          <RCAForm />
        </div>
      </div>

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Status Toast */}
      {rca.loading && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-900 text-white shadow-lg print:hidden">
          <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Processing with AI...</span>
        </div>
      )}
    </div>
  );
}