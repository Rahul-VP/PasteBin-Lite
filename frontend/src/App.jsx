import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import CreatePaste from './pages/CreatePaste.jsx';
import ViewPaste from './pages/ViewPaste.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="container">
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Pastebin-Lite</h1>
        <div style={{ marginTop: 6 }}>
          <Link to="/">Create</Link>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<CreatePaste />} />
        <Route path="/p/:id" element={<ViewPaste />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
