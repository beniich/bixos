import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSuccess: () => void;
  onGoRegister: () => void;
}

export const LoginForm: React.FC<Props> = ({ onSuccess, onGoRegister }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState<{ until: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, {
      rememberMe,
      twoFactorCode: requiresTwoFactor ? twoFactorCode : undefined,
    });

    setLoading(false);

    if (result.success) {
      onSuccess();
      return;
    }

    if (result.requiresTwoFactor) {
      setRequiresTwoFactor(true);
      return;
    }

    switch (result.error) {
      case 'ACCOUNT_LOCKED':
        setLocked({ until: 'quelques minutes' });
        setError('Compte temporairement verrouillé suite à trop de tentatives. Réessayez plus tard.');
        break;
      case 'EMAIL_NOT_VERIFIED':
        setError('Votre email n\'est pas encore vérifié. Consultez votre boîte de réception.');
        break;
      case 'INVALID_CREDENTIALS':
        setError('Email ou mot de passe incorrect.');
        break;
      case 'INVALID_2FA_CODE':
        setError('Code 2FA invalide. Vérifiez votre application d\'authentification.');
        break;
      case 'TOO_MANY_REQUESTS':
        setError('Trop de tentatives. Attendez 15 minutes avant de réessayer.');
        break;
      default:
        setError('Une erreur est survenue. Réessayez.');
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">⚡ BizOS</div>
        <h1 className="auth-title">
          {requiresTwoFactor ? 'Vérification 2FA' : 'Connexion'}
        </h1>
        <p className="auth-subtitle">
          {requiresTwoFactor
            ? 'Entrez le code de votre application d\'authentification'
            : 'Accédez à votre espace de travail sécurisé'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>

        {!requiresTwoFactor ? (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
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
              <label className="form-label" htmlFor="login-password">Mot de passe</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Votre mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group form-checkbox-row">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Se souvenir de moi (30 jours)</span>
              </label>
              <button type="button" className="form-link" onClick={() => {}}>
                Mot de passe oublié ?
              </button>
            </div>
          </>
        ) : (
          <div className="form-group">
            <label className="form-label" htmlFor="totp-code">Code 2FA (6 chiffres)</label>
            <input
              id="totp-code"
              type="text"
              className="form-input form-input-otp"
              placeholder="000000"
              value={twoFactorCode}
              onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoFocus
              required
              disabled={loading}
            />
            <p className="form-hint">
              Code de votre application (Google Authenticator, Authy…) ou code de secours au format XXXXX-XXXXX.
            </p>
          </div>
        )}

        {error && (
          <div className="form-error" role="alert">
            <span className="form-error-icon">⚠</span> {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || (requiresTwoFactor && twoFactorCode.length < 6)}
        >
          {loading
            ? 'Vérification…'
            : requiresTwoFactor
            ? 'Confirmer'
            : 'Se connecter'}
        </button>

        {requiresTwoFactor && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setRequiresTwoFactor(false); setTwoFactorCode(''); setError(''); }}
          >
            ← Retour
          </button>
        )}
      </form>

      {!requiresTwoFactor && (
        <p className="auth-footer">
          Pas encore de compte ?{' '}
          <button className="form-link" onClick={onGoRegister}>Créer un compte</button>
        </p>
      )}
    </div>
  );
};
