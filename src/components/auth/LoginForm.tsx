import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

interface LoginFormProps {
  onSuccess: () => void;
  onGoRegister?: () => void;
  redirectReason?: string | null;
}

export function LoginForm({ onSuccess, onGoRegister, redirectReason }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email.trim().toLowerCase(), password);
      onSuccess();
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.includes('Invalid credentials') || msg.includes('401')) {
        setError('Email ou mot de passe incorrect');
      } else if (msg.includes('SUSPENDED')) {
        setError('Compte suspendu. Contactez le support.');
      } else if (msg.includes('INACTIVE')) {
        setError("Votre compte n'est pas encore activÃ©.");
      } else if (msg.includes('429') || msg.includes('too-many')) {
        setError('Trop de tentatives. RÃ©essayez dans quelques minutes.');
      } else {
        setError('Erreur de connexion. VÃ©rifiez votre rÃ©seau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="auth-form-title" style={{ fontSize: 22, marginBottom: 4 }}>
        Connexion BizOS
      </h2>
      <p className="auth-form-subtitle">AccÃ©dez Ã  votre espace de travail</p>

      {/* Reason banner */}
      {redirectReason === 'subscription_required' && (
        <div className="auth-error-banner" style={{ background: 'rgba(250,174,64,0.08)', borderColor: 'rgba(250,174,64,0.35)', color: '#faae40' }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          Un abonnement actif est requis pour accÃ©der Ã  cette fonctionnalitÃ©.
        </div>
      )}

      {error && (
        <div className="auth-error-banner">
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-input-group">
          <label className="auth-input-label" htmlFor="lf-email">Email professionnel</label>
          <div className="auth-input-wrapper">
            <input
              id="lf-email"
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={submitting}
              placeholder="vous@entreprise.com"
            />
          </div>
        </div>

        <div className="auth-input-group">
          <label className="auth-input-label" htmlFor="lf-password">Mot de passe</label>
          <div className="auth-input-wrapper">
            <input
              id="lf-password"
              className="auth-input auth-input-with-icon"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={submitting}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            />
            <button
              type="button"
              className="auth-input-icon-btn"
              onClick={() => setShowPassword(p => !p)}
              tabIndex={-1}
              aria-label={showPassword ? 'Masquer' : 'Afficher'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="auth-button-primary"
          disabled={submitting || !email || !password}
          style={{ marginTop: 8 }}
        >
          {submitting ? <span className="auth-spinner" /> : null}
          {submitting ? 'Connexion...' : 'Se connecter'}
          {!submitting && <span className="auth-button-arrow">â†’</span>}
        </button>
      </form>

      {onGoRegister && (
        <div className="auth-text-center">
          Pas encore de compte ?{' '}
          <button type="button" className="auth-link" onClick={onGoRegister}>
            Démarrer un essai gratuit
          </button>
        </div>
      )}
    </div>
  );
};

