import React, { useEffect, useState } from 'react';
import { PageId, Language, BrandVariant } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from '../auth/LoginForm';
import { Loader2, User, Mail, Lock, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { getDeviceId } from '../../lib/device-id';

interface LoginPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
  brand: BrandVariant;
}

type Mode = 'login' | 'register';

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { profile, loading, hasActiveSubscription, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim());
      onNavigate('dashboard');
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('EMAIL_TAKEN') || msg.includes('409')) {
        setError('Cet email est déjà utilisé. Connectez-vous à la place.');
      } else if (msg.includes('Invalid input') || msg.includes('400')) {
        setError('Informations invalides. Vérifiez votre email et mot de passe (min 8 caractères).');
      } else {
        setError('Erreur lors de la création du compte. Réessayez.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 animate-fade-in flex items-center justify-center">
      {mode === 'login' ? (
        <LoginForm
          onSuccess={() => onNavigate('dashboard')}
          onGoRegister={() => setMode('register')}
        />
      ) : (
        <div className="w-full max-w-md mx-auto">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-violet-500/20 rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 mb-4 shadow-lg shadow-violet-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Créer un compte BizOS
              </h1>
              <p className="text-gray-400 text-sm mt-1">Essai gratuit de 14 jours, sans carte bancaire</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={submitting}
                    placeholder="Jean Dupont"
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none disabled:opacity-50 transition-all text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email professionnel</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={submitting}
                    placeholder="vous@entreprise.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none disabled:opacity-50 transition-all text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe (min. 8 caractères)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={submitting}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none disabled:opacity-50 transition-all text-white placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !email || !password || !name}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25 text-white mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  'Créer mon compte gratuitement'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
              <p className="text-sm text-gray-400">
                Déjà un compte ?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <Shield className="w-3.5 h-3.5 text-green-400" /> Chiffré TLS
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <Lock className="w-3.5 h-3.5 text-blue-400" /> RGPD Compliant
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
