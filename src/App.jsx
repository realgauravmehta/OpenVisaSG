import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/Layout/Landing';
import CaptureFlow from './components/Camera/CaptureFlow';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-teal-500 selection:text-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/capture" element={<CaptureFlow />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
