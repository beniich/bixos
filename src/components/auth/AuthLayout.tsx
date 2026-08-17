import type { ReactNode } from 'react'
import ParticleMap from './ParticleMap'
import '../../styles/auth.css'

interface AuthLayoutProps {
  children: ReactNode
  onNavigateHome?: () => void
  onNavigateSignup?: () => void
  onNavigateSignin?: () => void
  showSignupBtn?: boolean
  showSigninBtn?: boolean
  legalText?: ReactNode
  marketingTag?: string
  marketingHeadline?: string
  marketingMeta?: string
  marketingCtaText?: string
  onMarketingCta?: () => void
}

export default function AuthLayout({
  children,
  onNavigateHome,
  onNavigateSignup,
  onNavigateSignin,
  showSignupBtn = true,
  showSigninBtn = false,
  legalText,
  marketingTag = 'BizOS Platform · 2026',
  marketingHeadline = 'Là où les bâtisseurs d\'opérations se connectent.',
  marketingMeta = 'GMAO · EcoAsset · Ticketing · Multisite · Sans frais cachés',
  marketingCtaText = 'Créer un compte',
  onMarketingCta,
}: AuthLayoutProps) {
  return (
    <div className="auth-page">
      {/* LEFT — Form */}
      <div className="auth-page-form">
        <div className="auth-form-header">
          <button
            className="auth-logo"
            onClick={onNavigateHome}
            type="button"
          >
            <span className="auth-logo-icon">⚡</span>
            <span>BizOS</span>
          </button>

          <div className="auth-header-actions">
            <button className="auth-lang-switch" type="button">
              🌐 FR ▾
            </button>
            {showSignupBtn && (
              <button
                className="auth-signup-btn"
                type="button"
                onClick={onNavigateSignup}
              >
                S'inscrire
              </button>
            )}
            {showSigninBtn && (
              <button
                className="auth-signup-btn"
                type="button"
                onClick={onNavigateSignin}
              >
                Se connecter
              </button>
            )}
          </div>
        </div>

        <div className="auth-form-body">
          {children}
        </div>

        {legalText && (
          <div className="auth-legal">{legalText}</div>
        )}
      </div>

      {/* RIGHT — Marketing */}
      <div className="auth-page-marketing">
        <ParticleMap />

        <div className="auth-marketing-top">
          <div className="auth-marketing-tag">{marketingTag}</div>
          <div className="auth-marketing-headline">{marketingHeadline}</div>
        </div>

        <div className="auth-marketing-middle">
          {marketingMeta && (
            <div className="auth-marketing-meta">{marketingMeta}</div>
          )}
          <button
            className="auth-marketing-cta"
            type="button"
            onClick={onMarketingCta || onNavigateSignup}
          >
            ↗ {marketingCtaText}
          </button>
        </div>

        <div className="auth-marketing-footer">
          <span>© 2026 BizOS</span>
          <span>Powered by EcoAsset</span>
        </div>
      </div>
    </div>
  )
}
