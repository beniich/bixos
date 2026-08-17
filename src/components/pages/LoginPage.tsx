import React, { useEffect, useState } from 'react';
import type { PageId, Language, BrandVariant } from '../../types';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../auth/AuthLayout';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
  brand: BrandVariant;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'verify';

// â”€â”€â”€ Password strength â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getStrength(pw: string): 'weak' | 'medium' | 'strong' | null {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 2) return 'weak';
  if (s <= 3) return 'medium';
  return 'strong';
}

// â”€â”€â”€ Social SVG icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const GoogleIcon = () => (
  <svg className="auth-social-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GithubIcon = () => (
  <svg className="auth-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 6.8c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 4.624-5.479 4.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { profile, loading, hasActiveSubscription, signIn, signUp, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');

  const strength = getStrength(password);

  // Redirect if already logged in
  useEffect(() => {
    if (loading || !profile) return;
    if (hasActiveSubscription) {
      onNavigate('dashboard');
    } else {
      onNavigate('pricing' as PageId);
    }
  }, [profile, loading, hasActiveSubscription, onNavigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#141414' }}>
        <span className="auth-spinner auth-spinner-light" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const clearErrors = () => { setError(null); setSuccessMsg(null); };

  // â”€â”€ Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      // redirect handled by useEffect
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.includes('Invalid credentials') || msg.includes('401')) {
        setError('Email ou mot de passe incorrect.');
      } else if (msg.includes('SUSPENDED')) {
        setError('Compte suspendu. Contactez le support.');
      } else if (msg.includes('INACTIVE')) {
        setError('Compte non activÃ©. Contactez votre administrateur.');
      } else if (msg.includes('429') || msg.includes('too-many')) {
        setError('Trop de tentatives. RÃ©essayez dans quelques minutes.');
      } else {
        setError('Erreur de connexion. VÃ©rifiez votre rÃ©seau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // â”€â”€ Register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (password.length < 8) { setError('Mot de passe trop court (min. 8 caractÃ¨res).'); return; }
    setSubmitting(true);
    try {
      await signUp(email.trim().toLowerCase(), password, displayName.trim());
      setPendingEmail(email.trim().toLowerCase());
      setMode('verify');
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.includes('EMAIL_TAKEN') || msg.includes('409')) {
        setError('Cet email est dÃ©jÃ  utilisÃ©. Connectez-vous Ã  la place.');
      } else if (msg.includes('400')) {
        setError('DonnÃ©es invalides. VÃ©rifiez votre email et mot de passe.');
      } else {
        setError('Erreur lors de la crÃ©ation du compte. RÃ©essayez.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // â”€â”€ Google OAuth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleGoogle = async () => {
    clearErrors();
    setLoadingOAuth('google');
    try {
      await signInWithGoogle();
    } catch {
      setError('Connexion Google indisponible pour l\'instant.');
    } finally {
      setLoadingOAuth(null);
    }
  };

  // â”€â”€ Forgot password (placeholder) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setSubmitting(true);
    // Simulated â€” replace with real API call
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setSuccessMsg(`Un lien de rÃ©initialisation a Ã©tÃ© envoyÃ© Ã  ${email}.`);
  };

  // â”€â”€ Layout props shared â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const layoutProps = {
    onNavigateHome: () => onNavigate('home'),
    onNavigateSignup: () => { clearErrors(); setMode('register'); },
    onNavigateSignin: () => { clearErrors(); setMode('login'); },
    onMarketingCta: () => { clearErrors(); setMode('register'); },
  };

  // â”€â”€ VERIFY EMAIL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (mode === 'verify') {
    return (
      <AuthLayout
        {...layoutProps}
        showSignupBtn={false}
        showSigninBtn
        marketingTag="VÃ©rification requise"
        marketingHeadline="VÃ©rifiez votre boÃ®te mail."
        marketingMeta="Un lien d'activation a Ã©tÃ© envoyÃ©."
        marketingCtaText="Retour Ã  la connexion"
        onMarketingCta={() => setMode('login')}
      >
        <div>
          <div className="auth-verify-icon">âœ‰ï¸</div>
          <h1 className="auth-verify-title">VÃ©rifiez votre email</h1>
          <p className="auth-verify-text">
            Un email de confirmation a Ã©tÃ© envoyÃ© Ã {' '}
            <strong>{pendingEmail || email}</strong>.<br />
            Cliquez sur le lien pour activer votre compte.
          </p>
          <button
            className="auth-button-primary"
            type="button"
            onClick={() => { clearErrors(); setMode('login'); }}
          >
            Retour Ã  la connexion
            <span className="auth-button-arrow">â†’</span>
          </button>
          <div className="auth-text-center" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="auth-link"
              onClick={() => { clearErrors(); setMode('register'); }}
            >
              Utiliser un autre email
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // â”€â”€ FORGOT PASSWORD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (mode === 'forgot') {
    return (
      <AuthLayout
        {...layoutProps}
        showSignupBtn={false}
        showSigninBtn
        marketingHeadline="RÃ©initialisez votre mot de passe."
        marketingMeta="Un lien vous sera envoyÃ© par email."
        marketingCtaText="Retour Ã  la connexion"
        onMarketingCta={() => setMode('login')}
      >
        <button
          type="button"
          className="auth-back-link"
          onClick={() => { clearErrors(); setMode('login'); }}
        >
          â† Retour
        </button>

        <h1 className="auth-form-title">Mot de passe oubliÃ©</h1>
        <p className="auth-form-subtitle">
          Entrez votre email pour recevoir un lien de rÃ©initialisation.
        </p>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="auth-success-banner">
            âœ“ {successMsg}
          </div>
        )}

        <form onSubmit={handleForgot}>
          <div className="auth-input-group">
            <label className="auth-input-label" htmlFor="forgot-email">Email</label>
            <div className="auth-input-wrapper">
              <input
                id="forgot-email"
                className="auth-input"
                type="email"
                placeholder="vous@entreprise.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-button-primary"
            disabled={submitting || !email}
            style={{ marginTop: 8 }}
          >
            {submitting ? <span className="auth-spinner" /> : null}
            {submitting ? 'Envoi en cours...' : 'Envoyer le lien'}
            {!submitting && <span className="auth-button-arrow">â†’</span>}
          </button>
        </form>
      </AuthLayout>
    );
  }

  // â”€â”€ REGISTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (mode === 'register') {
    return (
      <AuthLayout
        {...layoutProps}
        showSignupBtn={false}
        showSigninBtn
        marketingHeadline="DÃ©marrez votre essai gratuit."
        marketingMeta="14 jours inclus Â· Sans carte bancaire Â· Annulable Ã  tout moment"
        marketingCtaText="DÃ©jÃ  un compte ?"
        onMarketingCta={() => setMode('login')}
        legalText={
          <>
            En crÃ©ant un compte, j'accepte les{' '}
            <a href="#" onClick={e => e.preventDefault()}>conditions d'utilisation</a> et la{' '}
            <a href="#" onClick={e => e.preventDefault()}>politique de confidentialitÃ©</a> de BizOS.
          </>
        }
      >
        <h1 className="auth-form-title">CrÃ©er un compte</h1>
        <p className="auth-form-subtitle">Essai gratuit de 14 jours â€” sans carte bancaire.</p>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        {/* OAuth */}
        <div className="auth-social-buttons">
          <button
            type="button"
            className="auth-social-button"
            onClick={handleGoogle}
            disabled={!!loadingOAuth || submitting}
          >
            {loadingOAuth === 'google'
              ? <span className="auth-spinner" />
              : <GoogleIcon />
            }
            <span>Continuer avec Google</span>
          </button>
        </div>

        <div className="auth-divider">ou avec votre email</div>

        <form onSubmit={handleRegister}>
          <div className="auth-input-group">
            <label className="auth-input-label" htmlFor="reg-name">Nom complet</label>
            <div className="auth-input-wrapper">
              <input
                id="reg-name"
                className="auth-input"
                type="text"
                placeholder="Jean Dupont"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                disabled={submitting}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-input-label" htmlFor="reg-email">Email professionnel</label>
            <div className="auth-input-wrapper">
              <input
                id="reg-email"
                className="auth-input"
                type="email"
                placeholder="vous@entreprise.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-input-label" htmlFor="reg-password">Mot de passe</label>
            <div className="auth-input-wrapper">
              <input
                id="reg-password"
                className={`auth-input auth-input-with-icon${strength && password ? (strength === 'weak' ? ' error' : '') : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 caractÃ¨res"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={submitting}
              />
              <button
                type="button"
                className="auth-input-icon-btn"
                onClick={() => setShowPassword(p => !p)}
                tabIndex={-1}
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && strength && (
              <div className="auth-password-strength">
                <div className={`auth-password-strength-fill ${strength}`} />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-button-primary"
            disabled={submitting || !email || !password || !displayName}
            style={{ marginTop: 8 }}
          >
            {submitting ? <span className="auth-spinner" /> : null}
            {submitting ? 'CrÃ©ation...' : 'CrÃ©er mon compte'}
            {!submitting && <span className="auth-button-arrow">â†’</span>}
          </button>
        </form>

        <div className="auth-text-center">
          DÃ©jÃ  un compte ?{' '}
          <button type="button" className="auth-link" onClick={() => { clearErrors(); setMode('login'); }}>
            Se connecter
          </button>
        </div>
      </AuthLayout>
    );
  }

  // â”€â”€ LOGIN (default) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <AuthLayout
      {...layoutProps}
      legalText={
        <>
          En cliquant sur Continuer, j'accepte les{' '}
          <a href="#" onClick={e => e.preventDefault()}>conditions</a>,
          la <a href="#" onClick={e => e.preventDefault()}>politique de confidentialitÃ©</a> et la{' '}
          <a href="#" onClick={e => e.preventDefault()}>politique cookies</a> de BizOS.
        </>
      }
    >
      <h1 className="auth-form-title">Connectez-vous Ã  BizOS</h1>
      <p className="auth-form-subtitle">
        AccÃ©dez Ã  votre espace de travail GMAO & EcoAsset.
      </p>

      {error && (
        <div className="auth-error-banner">
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      {/* OAuth */}
      <div className="auth-social-buttons">
        <button
          type="button"
          className="auth-social-button"
          onClick={handleGoogle}
          disabled={!!loadingOAuth || submitting}
        >
          {loadingOAuth === 'google'
            ? <span className="auth-spinner" />
            : <GoogleIcon />
          }
          <span>Continuer avec Google</span>
        </button>

        <button
          type="button"
          className="auth-social-button"
          disabled
          title="GitHub OAuth â€” bientÃ´t disponible"
        >
          <GithubIcon />
          <span>Continuer avec GitHub</span>
          <span className="auth-social-last-used">BientÃ´t</span>
        </button>
      </div>

      <div className="auth-divider">ou avec votre email</div>

      <form onSubmit={handleLogin}>
        <div className="auth-input-group">
          <label className="auth-input-label" htmlFor="login-email">Email</label>
          <div className="auth-input-wrapper">
            <input
              id="login-email"
              className="auth-input"
              type="email"
              placeholder="vous@entreprise.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="auth-input-group">
          <label className="auth-input-label" htmlFor="login-password">Mot de passe</label>
          <div className="auth-input-wrapper">
            <input
              id="login-password"
              className="auth-input auth-input-with-icon"
              type={showPassword ? 'text' : 'password'}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={submitting}
            />
            <button
              type="button"
              className="auth-input-icon-btn"
              onClick={() => setShowPassword(p => !p)}
              tabIndex={-1}
              aria-label={showPassword ? 'Masquer' : 'Afficher'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="auth-inline-row">
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              className="auth-checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            Se souvenir de moi
          </label>
          <button
            type="button"
            className="auth-link"
            onClick={() => { clearErrors(); setMode('forgot'); }}
          >
            Mot de passe oubliÃ© ?
          </button>
        </div>

        <button
          type="submit"
          className="auth-button-primary"
          disabled={submitting || !email || !password}
        >
          {submitting ? <span className="auth-spinner" /> : null}
          {submitting ? 'Connexion...' : 'Se connecter'}
          {!submitting && <span className="auth-button-arrow">â†’</span>}
        </button>
      </form>

      <div className="auth-text-center">
        Pas encore de compte ?{' '}
        <button type="button" className="auth-link" onClick={() => { clearErrors(); setMode('register'); }}>
          Essai gratuit 14 jours
        </button>
      </div>
    </AuthLayout>
  );
};

