import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Views from './jsx/Views.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={<Views.Dashboard />} />
        <Route path={'/subscribe'} element={<Views.Subscribe />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

reportWebVitals()
