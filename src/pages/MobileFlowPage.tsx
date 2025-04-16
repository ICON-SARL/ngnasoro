
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const MobileFlowPage = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Accueil Mobile</div>} />
      <Route path="/main" element={<div>Tableau de bord principal</div>} />
      <Route path="/loans" element={<div>Mes prêts</div>} />
      <Route path="/profile" element={<div>Mon profil</div>} />
      <Route path="*" element={<div>Page mobile non trouvée</div>} />
    </Routes>
  );
};

export default MobileFlowPage;
