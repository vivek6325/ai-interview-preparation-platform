import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { ToastProvider } from './components/Toast/ToastContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import GlobalLoading from './components/Loading/GlobalLoading';

// Code Splitting with React.lazy
const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const InterviewSetup = lazy(() => import('./pages/InterviewSetup/InterviewSetup'));
const Interview = lazy(() => import('./pages/Interview/Interview'));
const Results = lazy(() => import('./pages/Results/Results'));
const History = lazy(() => import('./pages/History/History'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const InterviewSession = lazy(() => import('./pages/InterviewSession/InterviewSession'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

/**
 * App Component
 * Root component of the application.
 * Configures ErrorBoundary, code-splitted routes with Suspense fallback, and Toast notifications.
 */
function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <div className="app-container">
            <Navbar />

            <Suspense fallback={<GlobalLoading message="Loading view module..." />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/interview-setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
                <Route path="/interview/:id" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
                <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
                <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
                <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/interview-session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />

                {/* 404 Catch-All Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
