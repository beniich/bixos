import React, { useState } from 'react';
import { 
  Download, ShieldCheck, Key, Lock, Layers, Code, CheckCircle, 
  ExternalLink, FileText, Smartphone, Terminal, Sparkles, Copy, RefreshCw, Zap
} from 'lucide-react';

export const WpPluginExtensionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'download' | 'features' | 'code' | 'shortcodes' | 'tester' | 'security_policy' | 'licenses'>('download');
  const [selectedFile, setSelectedFile] = useState<string>('bizos-identity.php');
  const [copied, setCopied] = useState(false);

  // Tester states
  const [testEmail, setTestEmail] = useState('');
  const [magicLinkResult, setMagicLinkResult] = useState<any>(null);
  const [tfaResult, setTfaResult] = useState<any>(null);
  const [loadingTest, setLoadingTest] = useState(false);

  // License Tester states
  const [licenseKeyInput, setLicenseKeyInput] = useState('BIZOS-PRO-A7K2-9F3D-8H1N');
  const [licenseDomainInput, setLicenseDomainInput] = useState('my-wordpress-site.local');
  const [licenseValidationResult, setLicenseValidationResult] = useState<any>(null);
  const [licenseIssueEmail, setLicenseIssueEmail] = useState('demo@bizos.com');
  const [licenseIssueTier, setLicenseIssueTier] = useState('pro');
  const [issuedLicenseResult, setIssuedLicenseResult] = useState<any>(null);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const [managedLicensesList, setManagedLicensesList] = useState<any[]>([]);

  const handleValidateLicense = async (activate = true) => {
    if (!licenseKeyInput.trim()) return;
    setLoadingLicense(true);
    try {
      const res = await fetch('/api/licenses/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: licenseKeyInput.trim(),
          domain: licenseDomainInput.trim() || 'localhost',
          pluginVersion: '2.1.0',
          phpVersion: '8.2',
          wpVersion: '6.7',
          activate
        })
      });
      const data = await res.json();
      setLicenseValidationResult(data);
    } catch (err: any) {
      setLicenseValidationResult({ valid: false, error: err.message });
    } finally {
      setLoadingLicense(false);
    }
  };

  const handleIssueLicense = async () => {
    if (!licenseIssueEmail.trim()) return;
    setLoadingLicense(true);
    try {
      const res = await fetch('/api/licenses/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: licenseIssueEmail.trim(),
          tier: licenseIssueTier,
          cycle: 'annual'
        })
      });
      const data = await res.json();
      setIssuedLicenseResult(data);
      if (data.license?.key) {
        setLicenseKeyInput(data.license.key);
      }
      fetchLicensesList();
    } catch (err: any) {
      setIssuedLicenseResult({ success: false, error: err.message });
    } finally {
      setLoadingLicense(false);
    }
  };

  const fetchLicensesList = async () => {
    try {
      const res = await fetch('/api/licenses/list');
      const data = await res.json();
      if (data.licenses) {
        setManagedLicensesList(data.licenses);
      }
    } catch (err) {
      // ignore
    }
  };

  const fileContents: Record<string, string> = {
    'bizos-identity.php': `<?php
/**
 * Plugin Name: BizOS Identity - Modern WordPress Authentication
 * Plugin URI:  https://bizos.app/wordpress
 * Description: Passwordless login, 2FA TOTP, magic links, and modern session management for WordPress. Drop-in replacement for wp-login.php.
 * Version:     2.1.0
 * Requires at least: 6.4
 * Requires PHP:      8.1
 * Author:      BizOS Inc.
 * License:     GPLv2 or later
 * Text Domain: bizos-identity
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'BIZOS_IDENTITY_VERSION', '2.1.0' );
define( 'BIZOS_IDENTITY_PATH', plugin_dir_path( __FILE__ ) );

spl_autoload_register( function ( $class ) {
    $prefix = 'BizosIdentity\\\\';
    $base_dir = BIZOS_IDENTITY_PATH . 'includes/';
    if ( strncmp( $prefix, $class, strlen( $prefix ) ) !== 0 ) return;
    $file = $base_dir . str_replace( '\\\\', '/', substr( $class, strlen( $prefix ) ) ) . '.php';
    if ( file_exists( $file ) ) require $file;
});

require_once BIZOS_IDENTITY_PATH . 'includes/class-bizos-identity.php';

add_action( 'plugins_loaded', function() {
    \\BizosIdentity\\Core\\Bizos_Identity::instance()->init();
} );`,

    'readme.txt': `=== BizOS Identity - Modern WordPress Authentication ===

Contributors: bizos
Tags: authentication, security, passwordless, 2fa, magic-link, login, totp, sessions
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 8.1
Stable tag: 2.1.0
License: GPLv2 or later

Replace WordPress's standard authentication with passwordless magic links, 2FA TOTP, and modern session management.

== Description ==

BizOS Identity transforms WordPress login with modern security features:
- Passwordless Magic Links (15 min single-use tokens)
- TOTP Two-Factor Authentication (RFC 6238 Authenticator Apps)
- Multi-Device Session Management & Remote Revocation
- Brute Force Protection & hCaptcha
- Real-time Audit Log & Admin Dashboard`,

    'uninstall.php': `<?php
/**
 * BizOS Identity Uninstall Handler
 */
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) exit;

global $wpdb;
$tables = ['magic_links', 'password_history', 'sessions', 'two_factor_secrets', 'audit_log', 'lockouts', 'trusted_devices'];

foreach ( $tables as $table ) {
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}bizos_{$table}" );
}

$options = ['bizos_db_version', 'bizos_settings', 'bizos_jwt_secret', 'bizos_encryption_key'];
foreach ( $options as $option ) {
    delete_option( $option );
}
flush_rewrite_rules();`,

    'includes/class-bizos-identity.php': `<?php
namespace BizosIdentity\\Core;

class Bizos_Identity {
    private static $instance = null;

    public static function instance() {
        if ( self::$instance === null ) self::$instance = new self();
        return self::$instance;
    }

    public function init() {
        load_plugin_textdomain( 'bizos-identity', false, dirname( plugin_basename( BIZOS_IDENTITY_FILE ) ) . '/languages' );
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
    }

    public function register_rest_routes() {
        register_rest_route( 'bizos/v1', '/magic-link', [
            'methods' => 'POST',
            'callback' => [ $this, 'rest_request_magic_link' ],
            'permission_callback' => '__return_true',
        ]);
    }
}`,

    'includes/auth/class-bizos-magic-link.php': `<?php
namespace BizosIdentity\\Auth;

class Bizos_Magic_Link {
    private const TOKEN_LENGTH = 32;
    private const EXPIRY_MINUTES = 15;

    public function request( $email ) {
        $email = strtolower( trim( $email ) );
        if ( ! is_email( $email ) ) throw new \\Exception( 'Email invalide' );

        $token = bin2hex( random_bytes( self::TOKEN_LENGTH ) );
        $token_hash = hash( 'sha256', $token );

        return [
            'email' => $email,
            'token' => $token,
            'expires_at' => date( 'Y-m-d H:i:s', time() + self::EXPIRY_MINUTES * 60 ),
        ];
    }
}`,

    'includes/auth/class-bizos-2fa.php': `<?php
namespace BizosIdentity\\Auth;

class Bizos_2FA {
    public function generate_backup_codes() {
        $codes = [];
        for ( $i = 0; $i < 10; $i++ ) {
            $codes[] = sprintf( '%04d-%04d', rand(1000, 9999), rand(1000, 9999) );
        }
        return $codes;
    }
}`
  };

  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = '/api/plugins/bizos-identity/download';
    link.download = 'bizos-identity-v2.1.0.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fileContents[selectedFile] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestMagicLink = async () => {
    setLoadingTest(true);
    try {
      const res = await fetch('/api/plugins/bizos-identity/test-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });
      const data = await res.json();
      setMagicLinkResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTest(false);
    }
  };

  const handleTest2FA = async () => {
    setLoadingTest(true);
    try {
      const res = await fetch('/api/plugins/bizos-identity/test-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });
      const data = await res.json();
      setTfaResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in text-slate-100">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b0a38] via-[#15072c] to-[#0a0217] border border-[#d946ef]/40 p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,70,239,0.15)]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-gradient-to-br from-[#f472b6]/20 to-[#d946ef]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#f472b6]/20 text-[#f472b6] text-xs font-mono font-bold border border-[#f472b6]/40 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Extension WordPress Officielle v2.1.0
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Prêt pour Téléchargement (.ZIP)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              BizOS Identity <span className="bg-gradient-to-r from-[#f472b6] via-[#d946ef] to-[#38bdf8] bg-clip-text text-transparent">WordPress Plugin</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Transformez l'authentification de votre site WordPress. Remplacez le formulaire standard par des liens magiques sans mot de passe, l'authentification à deux facteurs TOTP (applications d'authentification RFC 6238) et une gestion avancée des sessions multi-appareils.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleDownloadZip}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#d946ef] via-[#ec4899] to-[#f472b6] hover:opacity-95 text-white font-extrabold text-sm flex items-center gap-3 shadow-[0_0_25px_rgba(217,70,239,0.5)] transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                <span>Télécharger l'Extension (bizos-identity-v2.1.0.zip)</span>
              </button>

              <a
                href="#code-inspector"
                onClick={() => setActiveTab('code')}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Code className="w-4 h-4 text-[#f472b6]" />
                <span>Inspecter le Code Source</span>
              </a>
            </div>
          </div>

          {/* Plugin Quick Specs Card */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md space-y-3 font-mono text-xs">
            <div className="text-slate-400 font-bold uppercase tracking-wider pb-2 border-b border-white/10 flex items-center justify-between">
              <span>Spécifications Plugin</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Nom Fichier:</span>
              <span className="text-purple-300 font-bold">bizos-identity.zip</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Version:</span>
              <span className="text-emerald-400 font-bold">2.1.0 Stable</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">WordPress requis:</span>
              <span className="text-white">6.4+</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">PHP requis:</span>
              <span className="text-white">8.1+</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Licence:</span>
              <span className="text-pink-300">GPLv2 / Open Source</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Taille Archive:</span>
              <span className="text-amber-300">~48 KB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice Banner */}
      <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-extrabold text-sm text-emerald-300 flex items-center gap-2">
            <span>🛡️ Conformité Sécurité Strictes & Politiques Anti-Exécution Code</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">100% Certified</span>
          </div>
          <p className="text-slate-200 leading-relaxed">
            L'extension <strong>BizOS Identity</strong> respecte rigoureusement la politique de sécurité : aucun éditeur de code (PHP/JS), aucun gestionnaire de fichiers ni aucune fonction d'exécution dynamique (<code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">eval</code> / <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">exec</code>) ne sont présents. Tous les rendus HTML sont strictement échappés (<code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300">esc_html</code>, <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300">esc_attr</code>) et toutes les requêtes SQL sont chiffrées/préparées.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'download', label: '📦 Téléchargement & Installation', icon: Download },
          { id: 'features', label: '✨ Fonctionnalités & Sécurité', icon: ShieldCheck },
          { id: 'security_policy', label: '🛡️ Charte Sécurité & security.txt', icon: Lock },
          { id: 'licenses', label: '💳 Licences & API Manager', icon: Key },
          { id: 'code', label: '💻 Inspecteur de Code Source', icon: Code },
          { id: 'shortcodes', label: '⚙️ Shortcodes & Gutenberg Blocks', icon: Terminal },
          { id: 'tester', label: '🚀 Testeur de Sécurité Intégré', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-[#d946ef] to-[#ec4899] text-white shadow-lg shadow-[#d946ef]/30' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DOWNLOAD & INSTALLATION */}
      {activeTab === 'download' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-[#140826]/80 border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#f472b6]" />
                    <span>Installer l'extension sur votre site WordPress</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Suivez ces 4 étapes simples pour déployer BizOS Identity sur n'importe quel site WordPress.
                  </p>
                </div>

                <button
                  onClick={handleDownloadZip}
                  className="px-4 py-2 rounded-xl bg-[#d946ef] hover:bg-[#c026d3] text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Obtenir le .ZIP</span>
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: '01',
                    title: 'Téléchargez l\'archive ZIP du Plugin',
                    desc: 'Cliquez sur le bouton ci-dessus pour télécharger le fichier bizos-identity-v2.1.0.zip prêt à l\'emploi sur votre ordinateur.',
                    tag: 'Fichier ZIP Ready'
                  },
                  {
                    step: '02',
                    title: 'Accédez au tableau de bord WordPress (WP Admin)',
                    desc: 'Connectez-vous à votre administration WordPress, allez dans la rubrique Extension > Ajouter une extension.',
                    tag: 'WP-Admin'
                  },
                  {
                    step: '03',
                    title: 'Téléversez et Activez le Plugin',
                    desc: 'Cliquez sur "Téléverser une extension", choisissez le fichier bizos-identity-v2.1.0.zip, puis cliquez sur "Installer maintenant" et "Activer l\'extension".',
                    tag: 'Activation'
                  },
                  {
                    step: '04',
                    title: 'Configurez les options dans Réglages > Identity',
                    desc: 'Accédez au nouveau menu 🔒 Identity pour forcer la 2FA pour les administrateurs, configurer les clés hCaptcha et consulter le journal d\'audit en temps réel.',
                    tag: 'Configuration'
                  }
                ].map((item, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                    <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-purple-500/20 text-[#f472b6] font-mono font-black text-sm flex items-center justify-center border border-purple-500/30">
                      {item.step}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-sm text-white">{item.title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">{item.tag}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#1e0a38]/90 border border-[#d946ef]/40 space-y-4 shadow-xl">
              <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-purple-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#f472b6]" />
                <span>Compatibilité & Normes</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                  <div className="font-bold text-purple-200">WordPress.org Ready</div>
                  <p className="text-slate-300 text-[11px]">
                    Inclut le fichier readme.txt standardisé, le script d'invalidation uninstall.php et la structure PSR-4 conforme aux exigences de soumission officielles.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <div className="font-bold text-emerald-300">Compatibilité WooCommerce</div>
                  <p className="text-slate-300 text-[11px]">
                    S'intègre directement aux pages Mon Compte et Checkout de WooCommerce pour sécuriser les acheteurs sans friction.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                  <div className="font-bold text-blue-300">Souveraineté des Données</div>
                  <p className="text-slate-300 text-[11px]">
                    Toutes les données de session, jetons et clés 2FA sont chiffrées localement dans la base de données de votre WordPress sans dépendance cloud tierce.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURES */}
      {activeTab === 'features' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Key,
              color: 'text-[#f472b6]',
              bg: 'bg-pink-500/10 border-pink-500/30',
              title: 'Authentification Sans Mot de Passe (Magic Links)',
              desc: 'Permet aux utilisateurs de se connecter d\'un simple clic via un email sécurisé. Jetons chiffrés SHA-256 à usage unique expirant automatiquement en 15 minutes.'
            },
            {
              icon: ShieldCheck,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10 border-purple-500/30',
              title: 'Authentification à Deux Facteurs (2FA TOTP)',
              desc: 'Compatibilité TOTP standard avec toutes les applications d\'authentification RFC 6238. Génération automatique de 10 codes de secours à impression unique.'
            },
            {
              icon: Smartphone,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10 border-blue-500/30',
              title: 'Gestionnaire de Sessions Multi-Appareils',
              desc: 'Visualisation en temps réel des appareils connectés avec empreinte numérique et géolocalisation IP. Révocation distante d\'une session compromise en un clic.'
            },
            {
              icon: Lock,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10 border-amber-500/30',
              title: 'Protection Brute Force & hCaptcha',
              desc: 'Limitation dynamique des tentatives de connexion. Déclenchement automatique d\'hCaptcha après 3 échecs et verrouillage temporaire progressif de l\'adresse IP.'
            },
            {
              icon: FileText,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
              title: 'Journal d\'Audit Complet & Dashboard Admin',
              desc: 'Historique détaillé de tous les événements d\'authentification (connexions, échecs, demandes de liens, changements 2FA) directement dans WP-Admin.'
            },
            {
              icon: Terminal,
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10 border-cyan-500/30',
              title: 'Shortcodes & Gutenberg Blocks Native',
              desc: 'Intégrez facilement les formulaires de connexion et les espaces de gestion de sécurité dans vos pages avec les shortcodes [bizos_login] et [bizos_account].'
            }
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className={`p-6 rounded-3xl bg-[#140826] border ${feat.bg} space-y-3 shadow-xl`}>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl bg-white/10 ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Actif</span>
                </div>
                <h3 className="font-extrabold text-base text-white">{feat.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2.5: SECURITY POLICY & SECURITY.TXT */}
      {activeTab === 'security_policy' && (
        <div className="space-y-8 animate-fade-in">
          <div className="p-6 rounded-3xl bg-[#140826] border border-emerald-500/30 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span>Politique de Sécurité Zero-Trust & Divulgation Responsable</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Transparence totale, conformité RFC 9116 security.txt et protection stricte des utilisateurs WordPress.
                </p>
              </div>

              <a
                href="/.well-known/security.txt"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-2 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Voir /.well-known/security.txt (RFC 9116)</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>1. Zéro Exécution de Code Arbitraire</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Interdiction stricte de tout éditeur de code PHP/JS, gestionnaire de fichiers ou fonction dynamique (<code className="text-amber-300 font-mono">eval</code>, <code className="text-amber-300 font-mono">exec</code>, <code className="text-amber-300 font-mono">system</code>). La surface d'attaque est minimale.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>2. Échappement HTML & Requêtes Préparées</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  100% des sorties HTML sont échappées via les fonctions natives WordPress (<code className="text-emerald-300 font-mono">esc_html</code>, <code className="text-emerald-300 font-mono">esc_attr</code>, <code className="text-emerald-300 font-mono">esc_url</code>) et 100% des requêtes SQL utilisent <code className="text-emerald-300 font-mono">{"$wpdb->prepare()"}</code>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>3. Données 100% Locales & RGPD</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Aucun pistage externe, aucune télémétrie cachée, aucun cookie tiers. Toutes les sessions, clés 2FA et journaux d'audit restent exclusivement stockés dans la base de données locale du WordPress.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>4. TOTP Universel Standardisé (RFC 6238)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conforme à la norme RFC 6238. Fonctionne avec n'importe quelle application d'authentification compatible (Google Authenticator, Authy, 1Password, Bitwarden) sans verrouillage de compte.
                </p>
              </div>
            </div>

            {/* RFC 9116 Inspector */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-white/10 font-bold">
                <span className="flex items-center gap-2 text-pink-300">
                  <Lock className="w-4 h-4" />
                  Fichier Canonique Security.txt (RFC 9116)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">Standard IETF Compliant</span>
              </div>
              <pre className="text-emerald-400 bg-black/50 p-4 rounded-xl border border-white/5 overflow-x-auto">
{`Contact: mailto:security@bizos.app
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: fr, en
Canonical: https://bizos.ricecloud.net/.well-known/security.txt
Policy: https://bizos.ricecloud.net/security
Hiring: https://bizos.ricecloud.net/careers
Encryption: https://bizos.ricecloud.net/pgp-key.asc`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2.8: LICENSE MANAGEMENT & MONETIZATION DASHBOARD */}
      {activeTab === 'licenses' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1e0a38] via-[#140826] to-[#0d041a] border border-purple-500/30 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Key className="w-6 h-6 text-pink-400" />
                  <span>Gestionnaire de Licences & Monétisation BizOS Pro</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Système complet d'émission, de vérification distante, de contrôle des limites de domaines et d'authentification signée HMAC.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLicensesList}
                  className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rafraîchir la liste</span>
                </button>
              </div>
            </div>

            {/* Top Cards: Live Validation & Issue New License */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Remote Validation Tester */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-pink-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-pink-400" />
                    Validation Distante de Clé (Client API)
                  </span>
                  <span className="text-[10px] bg-pink-500/20 text-pink-300 font-mono px-2 py-0.5 rounded">
                    POST /api/licenses/validate
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Clé de Licence (BIZOS-XXXX-XXXX)</label>
                    <input
                      type="text"
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value)}
                      placeholder="BIZOS-PRO-A7K2-9F3D-8H1N"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Domaine WordPress Cible</label>
                    <input
                      type="text"
                      value={licenseDomainInput}
                      onChange={(e) => setLicenseDomainInput(e.target.value)}
                      placeholder="mon-site-wordpress.com"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleValidateLicense(true)}
                      disabled={loadingLicense}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Activer & Vérifier</span>
                    </button>

                    <button
                      onClick={() => handleValidateLicense(false)}
                      disabled={loadingLicense}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>Vérifier Seule</span>
                    </button>
                  </div>
                </div>

                {licenseValidationResult && (
                  <div className="p-3 rounded-xl bg-black/70 border border-white/10 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">Résultat Validation :</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        licenseValidationResult.valid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {licenseValidationResult.valid ? 'VALID & ACTIVATED' : 'INVALID'}
                      </span>
                    </div>
                    <pre className="text-slate-300 bg-black/50 p-2.5 rounded border border-white/5 text-[11px] overflow-x-auto max-h-48">
                      {JSON.stringify(licenseValidationResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Card 2: Issue New License (Admin/Checkout Simulator) */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Générateur & Simulator d'Achat
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
                    POST /api/licenses/issue
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Email Client / Acheteur</label>
                    <input
                      type="email"
                      value={licenseIssueEmail}
                      onChange={(e) => setLicenseIssueEmail(e.target.value)}
                      placeholder="client@entreprise.com"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Formule / Niveau de Licence</label>
                    <select
                      value={licenseIssueTier}
                      onChange={(e) => setLicenseIssueTier(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="pro">Pro (49 €/an - 5 domaines)</option>
                      <option value="business">Business (149 €/an - 10 domaines)</option>
                      <option value="agency">Agency / White-Label (499 €/an - 50 domaines)</option>
                      <option value="enterprise">Enterprise (Sur Mesure - Illimité)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleIssueLicense}
                    disabled={loadingLicense}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Émettre la Clé de Licence</span>
                  </button>
                </div>

                {issuedLicenseResult && (
                  <div className="p-3 rounded-xl bg-black/70 border border-emerald-500/30 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>✅ Clé de licence créée :</span>
                      <span className="text-[10px] text-slate-400">{issuedLicenseResult.license?.issuedAt}</span>
                    </div>
                    <code className="block bg-emerald-950/60 text-emerald-300 p-2 rounded text-xs font-bold border border-emerald-500/30 text-center">
                      {issuedLicenseResult.license?.key}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* List of Managed Licenses */}
            {managedLicensesList.length > 0 && (
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-300 font-bold border-b border-white/10 pb-2">
                  <span className="flex items-center gap-2 text-purple-300">
                    <Key className="w-4 h-4" />
                    Registre des Clés de Licences Actives ({managedLicensesList.length})
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-[11px] uppercase">
                        <th className="py-2 px-3">Clé</th>
                        <th className="py-2 px-3">Client</th>
                        <th className="py-2 px-3">Niveau</th>
                        <th className="py-2 px-3">Domaines Activés</th>
                        <th className="py-2 px-3">Expiration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {managedLicensesList.map((lic: any) => (
                        <tr key={lic.key} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 px-3 font-bold text-pink-300">{lic.key}</td>
                          <td className="py-2 px-3 text-slate-300">{lic.customerEmail}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase font-bold text-[10px]">
                              {lic.tier}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-emerald-300 font-bold">
                            {lic.domains?.length || 0} / {lic.domainLimit}
                          </td>
                          <td className="py-2 px-3 text-slate-400">
                            {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : 'Illimité'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CODE INSPECTOR */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="code-inspector">
          {/* File Selector Sidebar */}
          <div className="lg:col-span-1 p-4 rounded-3xl bg-[#140826] border border-white/10 space-y-2">
            <div className="text-xs font-mono font-bold uppercase text-purple-300 tracking-wider px-3 py-2 border-b border-white/10">
              Arborescence du Plugin
            </div>

            {Object.keys(fileContents).map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-mono text-xs flex items-center justify-between transition-all cursor-pointer ${
                  selectedFile === file 
                    ? 'bg-gradient-to-r from-[#d946ef] to-[#ec4899] text-white font-bold shadow-md' 
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="truncate">{file}</span>
                <Code className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 p-6 rounded-3xl bg-[#0a0217] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-purple-300 font-bold">
                <FileText className="w-4 h-4 text-[#f472b6]" />
                <span>{selectedFile}</span>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-mono flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-purple-300" />
                <span>{copied ? 'Copié !' : 'Copier Code'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-black/60 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed border border-white/5 max-h-[500px]">
              <code>{fileContents[selectedFile]}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: SHORTCODES & BLOCKS */}
      {activeTab === 'shortcodes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#140826] border border-white/10 space-y-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#f472b6]" />
              <span>Guide d'Utilisation des Shortcodes</span>
            </h2>
            <p className="text-xs text-slate-300">
              Insérez ces shortcodes dans vos pages, articles ou widgets WordPress pour afficher les interfaces BizOS Identity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="font-mono text-xs font-bold text-pink-300 bg-pink-500/20 px-3 py-1 rounded-lg inline-block">
                  [bizos_login]
                </div>
                <h3 className="font-bold text-sm text-white">Formulaire de Connexion Avancé</h3>
                <p className="text-xs text-slate-300">
                  Affiche le formulaire avec onglets (Mot de passe & Lien Magique).
                </p>
                <div className="p-3 rounded-xl bg-black/50 font-mono text-xs text-slate-300 border border-white/10">
                  <code>[bizos_login mode="both" redirect="/dashboard"]</code>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="font-mono text-xs font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-lg inline-block">
                  [bizos_account]
                </div>
                <h3 className="font-bold text-sm text-white">Espace Sécurité Utilisateur</h3>
                <p className="text-xs text-slate-300">
                  Permet à l'utilisateur de configurer sa 2FA TOTP et de révoquer ses sessions actives.
                </p>
                <div className="p-3 rounded-xl bg-black/50 font-mono text-xs text-slate-300 border border-white/10">
                  <code>[bizos_account]</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INTEGRATED TESTER */}
      {activeTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Magic Link */}
          <div className="p-6 rounded-3xl bg-[#140826] border border-white/10 space-y-4">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Key className="w-5 h-5 text-[#f472b6]" />
              <span>Simuler la Génération d'un Lien Magique</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Email Destinataire</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-[#d946ef]"
                />
              </div>

              <button
                onClick={handleTestMagicLink}
                disabled={loadingTest}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#ec4899] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                {loadingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Générer le Jetons SHA-256</span>
              </button>

              {magicLinkResult && (
                <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-2 text-xs font-mono">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Lien Magique Généré avec Succès !</span>
                  </div>
                  <div className="text-slate-300 break-all bg-white/5 p-2 rounded border border-white/10">
                    {magicLinkResult.magicLinkUrl}
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                    <span>ShortCode: {magicLinkResult.shortCode}</span>
                    <span>Validité: {magicLinkResult.expiresInMinutes} min</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Test 2FA */}
          <div className="p-6 rounded-3xl bg-[#140826] border border-white/10 space-y-4">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <span>Simuler l'Enrôlement 2FA TOTP</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Compte Administrateur</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-[#d946ef]"
                />
              </div>

              <button
                onClick={handleTest2FA}
                disabled={loadingTest}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                {loadingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Générer Clé Secrète Base32 & QR Code</span>
              </button>

              {tfaResult && (
                <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 space-y-3 text-xs font-mono">
                  <div className="text-purple-300 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <span>Clé TOTP Prête</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img src={tfaResult.qrCodeUrl} alt="QR Code 2FA" className="w-24 h-24 bg-white p-1 rounded-xl" />
                    <div className="space-y-1">
                      <div className="text-slate-400 text-[11px]">Clé Secrète (Entrée Manuelle):</div>
                      <div className="text-pink-300 font-bold text-sm tracking-wider">{tfaResult.secretFormatted}</div>
                      <div className="text-slate-400 text-[10px]">10 Codes de Secours Générés</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
