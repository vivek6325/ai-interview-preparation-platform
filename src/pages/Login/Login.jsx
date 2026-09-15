import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/Input';
import './Login.css';

/**
 * Login Component (UI Audit Upgrade)
 * Uses Vercel UI components for consistent design tokens & accessibility.
 */
function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user is already authenticated, redirect to Dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      await login({
        email: email.trim(),
        password,
      });

      addToast('Signed in successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login action failed:', err);
      setError(err.message || 'Invalid email or password.');
      addToast(err.message || 'Sign in failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-glow-orb purple-orb"></div>
      <div className="login-glow-orb indigo-orb"></div>

      <Card className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to continue your interview prep journey</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error-message">{error}</div>}

          <TextInput
            label="Email Address"
            type="email"
            id="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            icon={Mail}
            required
          />

          <TextInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            icon={Lock}
            rightIcon={showPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowPassword(!showPassword)}
            required
          />

          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={loading}
            rightIcon={LogIn}
            className="w-100 mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="login-footer mt-4">
          <p>Don't have an account? <Link to="/register" className="mock-link">Sign up</Link></p>
        </div>
      </Card>
    </div>
  );
}

export default Login;
