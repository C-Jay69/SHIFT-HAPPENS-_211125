import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Reservations from './pages/Reservations';
import AIAgent from './pages/AIAgent';
import KDS from './pages/KDS';
import { Menu } from 'lucide-react';

const MobileHeader = ({ onOpen }: { onOpen: () => void }) => (
  <div className="md:hidden flex items-center justify-between p-4 bg-shift-dark text-white sticky top-0 z-30 shadow-md">
    <h1 className="font-bold font-mono text-lg">SHIFT<span className="text-shift-blue">HAPPENS</span></h1>
    <button onClick={onOpen} className="p-2 hover:bg-gray-800 rounded-lg"><Menu /></button>
  </div>
);

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AppProvider>
      <HashRouter>
        <div className="flex min-h-screen bg-[#F5F5F5]">
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <div className="flex-1 flex flex-col w-full overflow-hidden">
            <MobileHeader onOpen={() => setIsMobileMenuOpen(true)} />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden scroll-smooth">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/agent" element={<AIAgent />} />
                <Route path="/kds" element={<KDS />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
