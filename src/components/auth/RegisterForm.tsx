import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Politique de mot de passe — miroir côté client
const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 12, label: '12 caractères minimum' },
  { test: (p: string) => /[A-Z]/.test(p), label: '1 majuscule' },
  { test: (p: string) => /[a-z]/.test(p), label: '1 minuscule' },
  { test: (p: string) => /[0-9]/.test(p), label: '1 chiffre' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: '1 caractère spécial' },
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
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const passwordRuleStatus = PASSWORD_RULES.map(r => ({
    label: r.label,
    ok: r.test(password),
  }));

  const passwordStrength = passwordRuleStatus.filter(r => r.ok).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    const allRulesOk = passwordRuleStatus.every(r => r.ok);
    if (!allRulesOk) {
      setError('Votre mot de passe ne respecte pas tous les critères.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      setRegistered(true);
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('EMAIL_TAKEN') || msg.includes('409')) {
        setError('Un compte avec cet email existe déjà.');
      } else if (msg.includes('400')) {
        setError('Mot de passe insuffisant ou données invalides.');
      } else if (msg.includes('429')) {
        setError('Trop de créations de compte depuis cette adresse IP. Réessayez dans 1h.');
      } else {
        setError('Une erreur est survenue. Réessayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✅</div>
          <h1 className="auth-title">Compte créé !</h1>
          <p className="auth-subtitle">
            Un email de vérification a été envoyé à <strong>{email}</strong>.
            Cliquez sur le lien dans l'email pour activer votre compte.
          </p>
        </div>
        <button className="btn-primary" onClick={onGoLogin}>
          Aller à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">⚡ BizOS</div>
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Rejoignez la plateforme de gestion intelligente</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Nom complet</label>
          <input
            id="reg-name"
            type="text"
            className="form-input"
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

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            className="form-input"
            placeholder="vous@entreprise.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Mot de passe</label>
          <input
            id="reg-password"
            type="password"
            className="form-input"
            placeholder="Minimum 12 caractères"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={loading}
          />

          {/* Indicateur de force */}
          {password.length > 0 && (
            <div className="password-strength">
              <div className="password-strength-bar">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`password-strength-segment ${
                      i < passwordStrength
                        ? passwordStrength <= 2 ? 'weak'
                        : passwordStrength <= 3 ? 'fair'
                        : 'strong'
                        : ''
                    }`}
                  />
                ))}
              </div>
              <ul className="password-rules">
                {passwordRuleStatus.map((rule, i) => (
                  <li key={i} className={rule.ok ? 'rule-ok' : 'rule-fail'}>
                    {rule.ok ? '✓' : '✗'} {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-confirm">Confirmer le mot de passe</label>
          <input
            id="reg-confirm"
            type="password"
            className="form-input"
            placeholder="Répétez le mot de passe"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={loading}
          />
          {confirmPassword.length > 0 && confirmPassword !== password && (
            <p className="form-hint form-hint-error">Les mots de passe ne correspondent pas.</p>
          )}
        </div>

        {(error || fieldErrors.length > 0) && (
          <div className="form-error" role="alert">
            <span className="form-error-icon">⚠</span> {error}
            {fieldErrors.length > 0 && (
              <ul className="form-error-list">
                {fieldErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || passwordStrength < 5 || password !== confirmPassword}
        >
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="auth-footer">
        Déjà un compte ?{' '}
        <button className="form-link" onClick={onGoLogin}>Se connecter</button>
      </p>
    </div>
  );
};
