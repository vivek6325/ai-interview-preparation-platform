import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import InterviewSetup from './pages/InterviewSetup/InterviewSetup';
import Interview from './pages/Interview/Interview';
import Results from './pages/Results/Results';
import History from './pages/History/History';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { ToastProvider } from './components/Toast/ToastContext';

/**
 * App Component
 * 
 * Root component of the application.
 * Configures the router, global layout container, shared Navbar, and pages routes.
 */
function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app-container">
          {/* Global Navigation Header shared across all views */}
          <Navbar />

          {/* Main Content Router Viewport */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/interview-setup" element={
              <ProtectedRoute>
                <InterviewSetup />
              </ProtectedRoute>
            } />
            <Route path="/interview/:id" element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            } />
            <Route path="/interview" element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            } />
            <Route path="/results/:id" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;

