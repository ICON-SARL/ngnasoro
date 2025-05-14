import React from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import MobileRouter from '@/components/mobile/routes/MobileRouter';

// Export MobileRouter for use in MobileFlowPage
export { MobileRouter };
