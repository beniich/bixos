// src/components/eco_auth/EcoLoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// Remarque: L'application principale utilise un routeur interne (App.tsx),
// nous remplaçons react-router-dom par un simple callback.

interface EcoLoginFormProps {
  onSuccess?: () => void;
  onNavigateToRegister?: () => void;
}

const EcoLoginForm: React.FC<EcoLoginFormProps> = ({ onSuccess, onNavigateToRegister }) => {
  const { signIn, signInWithGoogle, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'Aucun compte associé à cet email',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/invalid-email': 'Email invalide',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
        'auth/user-disabled': 'Ce compte a été désactivé'
      };
      setError(errorMessages[err.code] || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      setError('Erreur de connexion Google');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Veuillez saisir votre email');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      setError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="bizos-auth-container">
        <div className="bizos-auth-card">
          <h2>Mot de passe oublié</h2>

          {resetSent ? (
            <div className="bizos-alert bizos-alert-success">
              ✓ Un email de réinitialisation a été envoyé à {email}
            </div>
          ) : (
            <>
              <p className="bizos-auth-subtitle">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>

              <div className="bizos-field">
                <label>Email</label>
                <input
                  type="email"
                  className="bizos-field-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </div>

              {error && <div className="bizos-alert bizos-alert-error">{error}</div>}

              <button
                className="bizos-btn bizos-btn-primary bizos-btn-full"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>

              <button
                type="button"
                className="bizos-btn bizos-btn-ghost bizos-btn-full"
                onClick={() => setShowForgotPassword(false)}
              >
                ← Retour
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bizos-auth-container">
      <div className="bizos-auth-card">
        <div className="bizos-auth-header">
          <div className="bizos-logo-mark">E</div>
          <h1>Connexion</h1>
          <p className="bizos-auth-subtitle">Accédez à votre espace ECOASSET</p>
        </div>

        <button
          type="button"
          className="bizos-btn bizos-btn-google bizos-btn-full"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="..." />
          </svg>
          Continuer avec Google
        </button>

        <div className="bizos-divider">
          <span>ou</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bizos-field">
            <label>Email</label>
            <input
              type="email"
              className="bizos-field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="bizos-field">
            <label>Mot de passe</label>
            <input
              type="password"
              className="bizos-field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="bizos-auth-options">
            <label className="bizos-checkbox">
              <input type="checkbox" />
              <span>Se souvenir de moi</span>
            </label>
            <button
              type="button"
              className="bizos-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Mot de passe oublié ?
            </button>
          </div>

          {error && <div className="bizos-alert bizos-alert-error">{error}</div>}

          <button
            type="submit"
            className="bizos-btn bizos-btn-primary bizos-btn-full"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="bizos-auth-footer">
          Pas encore de compte ?{' '}
          <button type="button" className="bizos-link" onClick={onNavigateToRegister}>
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  );
};

export default EcoLoginForm;
