#!/usr/bin/env bash
# ============================================================
# deploy.sh — Déploiement hybride Bixos
#   Frontend → Cloudflare Pages
#   API      → Vercel
# ============================================================
set -e

echo ""
echo "======================================================"
echo "  BIXOS — Déploiement Hybride (CF Pages + Vercel)"
echo "======================================================"
echo ""

# ─── 1. Vérifications préalables ───────────────────────────
command -v node   >/dev/null 2>&1 || { echo "❌  Node.js requis"; exit 1; }
command -v npm    >/dev/null 2>&1 || { echo "❌  npm requis"; exit 1; }
command -v npx    >/dev/null 2>&1 || { echo "❌  npx requis"; exit 1; }

if [ ! -f ".env.production" ]; then
  echo "❌  .env.production manquant — copiez .env.production.example et remplissez les valeurs"
  exit 1
fi

echo "✅  Prérequis OK"
echo ""

# ─── 2. Installation des dépendances ───────────────────────
echo "📦  Installation des dépendances..."
npm ci
echo "✅  Dépendances installées"
echo ""

# ─── 3. Build Vite (Frontend) ──────────────────────────────
echo "🔨  Build du frontend (Vite)..."
npx prisma generate
npm run build
echo "✅  Build terminé → ./dist"
echo ""

# ─── 4. Déploiement Cloudflare Pages (Frontend) ────────────
echo "☁️   Déploiement sur Cloudflare Pages..."
npx wrangler pages publish dist --project-name bixos --branch main
echo "✅  Frontend déployé sur Cloudflare Pages"
echo ""

# ─── 5. Déploiement Vercel (API) ───────────────────────────
echo "🚀  Déploiement de l'API sur Vercel..."
npx vercel --prod --yes
echo "✅  API déployée sur Vercel"
echo ""

echo "======================================================"
echo "  DÉPLOIEMENT TERMINÉ"
echo "  Frontend : https://bixos.pages.dev"
echo "  API      : Voir l'URL affichée par Vercel ci-dessus"
echo "======================================================"
