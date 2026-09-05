import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import '../../styles/auth.css';

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8,           label: '8 caractÃ¨res min.' },
  { test: (p: string) => /[A-Z]/.test(p),          label: '1 majuscule' },
  { test: (p: string) => /[a-z]/.test(p),          label: '1 minuscule' },
  { test: (p: string) => /[0-9]/.test(p),          label: '1 chiffre' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p),  label: '1 caractÃ¨re spÃ©cial' },
];

interface Props {
  onSuccess: () => void;
  onGoLogin: () => void;
}

export const RegisterForm: React.FC<Props> = ({ onSuccess, onGoLogin }) => {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const ruleStatus = PASSWORD_RULES.map(r => ({ label: r.label, ok: r.test(password) }));
  const strengthScore = ruleStatus.filter(r => r.ok).length;
  const strengthLabel = strengthScore <= 2 ? 'weak' : strengthScore <= 3 ? 'medium' : 'strong';
  const pwMismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const canSubmit = !loading && name && email && password && !pwMismatch && strengthScore >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pwMismatch) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (strengthScore < 4) { setError('Le mot de passe ne respecte pas les critÃ¨res.'); return; }

    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim());
      setRegistered(true);
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('EMAIL_TAKEN') || msg.includes('409')) {
        setError('Un compte avec cet email existe dÃ©jÃ .');
      } else if (msg.includes('400')) {
        setError('DonnÃ©es invalides. VÃ©rifiez votre email et mot de passe.');
      } else if (msg.includes('429')) {
        setError('Trop de tentatives. RÃ©essayez dans 1h.');
      } else {
        setError('Une erreur est survenue. RÃ©essayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  // â”€â”€ Success state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (registered) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="auth-verify-icon">âœ…</div>
        <h2 className="auth-verify-title">Compte crÃ©Ã© !</h2>
        <p className="auth-verify-text">
          Un email de vÃ©rification a Ã©tÃ© envoyÃ© Ã  <strong>{email}</strong>.<br />
          Cliquez sur le lien pour activer votre compte.
        </p>
        <button className="auth-button-primary" type="button" onClick={onGoLogin}>
          Aller Ã  la connexion <span className="auth-button-arrow">â†’</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="auth-form-title" style={{ fontSize: 22, marginBottom: 4 }}>CrÃ©er un compte</h2>
      <p className="auth-form-subtitle">Rejoignez la plateforme de gestion BizOS</p>

      {error && (
        <div className="auth-error-banner">
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Nom */}
        <div className="auth-input-group">
          <label className="auth-input-label" htmlFor="rf-name">Nom complet</label>
          <div className="auth-input-wrapper">
            <input
              id="rf-name"
              className="auth-input"
              type="text"
              placeholder="Jean Dupont"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="auth-input-group">
          <label className="auth-input-label" htmlFor="rf-email">Email</label>
          <div className="auth-input-wrapper">
            <input
              id="rf-email"
              className="auth-input"
              type="email"
              placeholder="vous@entreprise.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="auth-input-group">
          <label className="auth-input-label" htmlFor="rf-password">Mot de passe</label>
          <div className="auth-input-wrapper">
            <input
              id="rf-password"
              className="auth-input auth-input-with-icon"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 8 caractÃ¨res"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              disabled={loading}
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

          {/* Strength bar */}
          {password.length > 0 && (
            <>
              <div className="auth-password-strength" style={{ marginTop: 8 }}>
                <div className={`auth-password-strength-fill ${strengthLabel}`} />
              </div>
              {/* Rules checklist */}
              <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                {ruleStatus.map((r, i) => (
                  <li key={i} style={{ fontSize: 11, color: r.ok ? 'var(--auth-success)' : 'var(--auth-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {r.ok ? 'âœ“' : 'â—‹'} {r.label}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Confirm */}
        <div className="auth-input-group">
          <label className="auth-input-label" htmlFor="rf-confirm">Confirmer le mot de passe</label>
          <div className="auth-input-wrapper">
            <input
              id="rf-confirm"
              className={`auth-input auth-input-with-icon${pwMismatch ? ' error' : ''}`}
              type={showConfirm ? 'text' : 'password'}
              placeholder="RÃ©pÃ©tez le mot de passe"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="auth-input-icon-btn"
              onClick={() => setShowConfirm(p => !p)}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwMismatch && (
            <span className="auth-input-error">Les mots de passe ne correspondent pas</span>
          )}
        </div>

        <button
          type="submit"
          className="auth-button-primary"
          disabled={!canSubmit}
          style={{ marginTop: 8 }}
        >
          {loading ? <span className="auth-spinner" /> : null}
          {loading ? 'Création en cours...' : 'Créer mon compte'}
          {!loading && <span className="auth-button-arrow">→</span>}
        </button>
      </form>

      {onGoLogin && (
        <div className="auth-text-center">
          Déjà un compte ?{' '}
          <button type="button" className="auth-link" onClick={onGoLogin}>
            Se connecter
          </button>
        </div>
      )}
    </div>
  );
};

