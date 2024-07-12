import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import View from './View';
import Registration from './Registration';
import './index.css';
import '@fontsource/poppins'; // Default weight (400)
import '@fontsource/poppins/700.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/home" element={<App />} />
        <Route path="/view" element={<View />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

// use "/" to make starting screen default
