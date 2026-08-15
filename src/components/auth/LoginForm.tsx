import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageId } from '../../types';

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
      console.error('[LOGIN]', err);
      const msg: string = err?.message ?? '';
      if (msg.includes('Invalid credentials') || msg.includes('401')) {
        setError('Email ou mot de passe incorrect');
      } else if (msg.includes('SUSPENDED')) {
        setError('Compte suspendu. Contactez le support.');
      } else if (msg.includes('INACTIVE')) {
        setError('Votre compte n\'est pas encore activé. Contactez votre administrateur.');
      } else if (msg.includes('429') || msg.includes('too-many')) {
        setError('Trop de tentatives. Réessayez dans quelques minutes.');
      } else {
        setError('Erreur de connexion. Vérifiez votre réseau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-violet-500/20 rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 mb-4 shadow-lg shadow-violet-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            BizOS GMAO
          </h1>
          <p className="text-gray-400 text-sm mt-1">Connectez-vous à votre espace de travail</p>
        </div>

        {/* Reason banner */}
        {redirectReason === 'subscription_required' && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>Vous devez disposer d'un abonnement actif pour accéder à cette fonctionnalité.</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
              <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-violet-500 focus:ring-violet-500 focus:ring-offset-slate-900" />
              <span>Se souvenir</span>
            </label>
            <button type="button" className="text-violet-400 hover:text-violet-300 transition-colors">
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25 text-white mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer */}
        {onGoRegister && (
          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-sm text-gray-400">
              Pas encore de compte ?{' '}
              <button onClick={onGoRegister} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Démarrer un essai gratuit
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Security badges */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-500">
        <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
          <Shield className="w-3.5 h-3.5 text-green-400" /> Chiffré TLS
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
          <Lock className="w-3.5 h-3.5 text-blue-400" /> RGPD Compliant
        </span>
      </div>
    </div>
  );
}
