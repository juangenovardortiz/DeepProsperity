import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseConfigured } from '../config/firebase';

export function LoginPage() {
  const { signInWithGoogle, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to home page if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      // Navigation will happen automatically via useEffect when user state updates
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isFirebaseConfigured()) {
    return (
      <div className="login-page">
        <div className="login-container">
          <h1>DeepProsperity</h1>
          <div className="alert alert-warning">
            <p>⚠️ Firebase no está configurado.</p>
            <p>La aplicación funcionará con localStorage, pero tus datos podrían perderse.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
              Consulta el README para configurar Firebase y habilitar la autenticación.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>⬡ DeepProsperity</h1>
          <p className="login-subtitle">Gamifica tu vida!</p>
        </div>

        <div className="login-content">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="google-sign-in-btn"
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                <span>Continuar con Google</span>
              </>
            )}
          </button>

          <div className="login-footer">
            <p className="login-info">
              Al usar DeepProsperity, aceptas que tus datos se almacenarán de forma segura en Firebase.
              Solo tú tienes acceso a tu información personal y progreso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
