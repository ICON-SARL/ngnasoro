
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';
import { MobileRouter } from '../components/Router';

const MobileFlowPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="pb-20"> {/* Add padding at the bottom for the navigation bar */}
        <MobileRouter />
      </div>
      <MobileNavigation />
    </div>
  );
};

export default MobileFlowPage;
