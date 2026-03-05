import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PetDashboard } from './pages/PetDashboard';
import { VetDashboard } from './pages/VetDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/pet-dashboard"
            element={
              <ProtectedRoute allowedRoles={['PET']}>
                <PetDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vet-dashboard"
            element={
              <ProtectedRoute allowedRoles={['VET']}>
                <VetDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
