import React, { useState } from 'react';
import { Coins, Vote, Rocket, GitCompare, TrendingUp, Activity, Shield, ArrowUpRight } from 'lucide-react';

interface Web3DeFiViewsProps {
  isDarkMode: boolean;
  subRoute: string; // 'staking' | 'dao' | 'launchpad' | 'bridge' | 'oracle' | 'perpetuals' | 'options'
}

export const Web3DeFiViews: React.FC<Web3DeFiViewsProps> = ({ isDarkMode, subRoute }) => {
  const [stakedAmount, setStakedAmount] = useState('1,250 $CAFM');
  const [votePower, setVotePower] = useState('12,500 VOTES');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  if (subRoute === 'staking') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">STAKING DE TOKENS CAFM</h2>
          <p className={`text-xs ${subText}`}>Verrouillez vos jetons de gouvernance CAFM pour percevoir les rendements d'efficacité énergétique</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${cardBg} p-6 rounded-2xl border space-y-2`}>
            <div className="text-xs font-bold text-orange-400">APR % ESTIMÉ</div>
            <div className="text-3xl font-black text-emerald-400">24.8%</div>
            <div className={`text-[10px] ${subText}`}>Récompense quotidienne en $CAFM</div>
          </div>

          <div className={`${cardBg} p-6 rounded-2xl border space-y-2`}>
            <div className="text-xs font-bold text-orange-400">MONTANT STAKÉ</div>
            <div className="text-3xl font-black">{stakedAmount}</div>
            <div className={`text-[10px] ${subText}`}>Valeur estimée: 4,875.00 USDT</div>
          </div>

          <div className={`${cardBg} p-6 rounded-2xl border space-y-2`}>
            <div className="text-xs font-bold text-orange-400">RÉCOMPENSES À RÉCOLTER</div>
            <div className="text-3xl font-black text-orange-400">84.20 $CAFM</div>
            <button
              onClick={() => alert("Récompenses $CAFM récoltées avec succès dans votre portefeuille.")}
              className="w-full py-2 rounded-xl btn-gradient-orange text-white font-bold text-xs mt-2 cursor-pointer"
            >
              RÉCOLTER (CLAIM)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (subRoute === 'dao') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">GOUVERNANCE DAO DE L'ECOSYSTÈME CAFM</h2>
          <p className={`text-xs ${subText}`}>VOTEZ sur les améliorations du protocole, l'allocation des trésoreries et les modèles IA</p>
        </div>

        <div className="space-y-4">
          {[
            { id: 'PROP-24', title: 'Déploiement du modèle de prédiction IA v2.1 sur le réseau principal', status: 'VOTE EN COURS', votesYes: '88%', votesNo: '12%' },
            { id: 'PROP-23', title: 'Partenariat d\'intégration directe avec Schneider Electric IoT Smart Grid', status: 'ADOPTÉ', votesYes: '96%', votesNo: '4%' },
          ].map((p) => (
            <div key={p.id} className={`${cardBg} p-5 rounded-2xl border space-y-3`}>
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-orange-400">{p.id}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">{p.status}</span>
              </div>
              <h4 className="text-sm font-bold">{p.title}</h4>
              <div className="flex items-center gap-3">
                <button onClick={() => alert(`Vote OUI enregistré pour ${p.id}`)} className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs hover:bg-emerald-500 hover:text-white cursor-pointer">
                  VOTER OUI ({p.votesYes})
                </button>
                <button onClick={() => alert(`Vote NON enregistré pour ${p.id}`)} className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-xs hover:bg-rose-500 hover:text-white cursor-pointer">
                  VOTER NON ({p.votesNo})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (subRoute === 'launchpad') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">IDO LAUNCHPAD — PROJETS ÉNERGIE VERTE</h2>
          <p className={`text-xs ${subText}`}>Inkubator et levées de fonds décentralisées pour l'autonomie énergétique des bâtiments</p>
        </div>

        <div className={`${cardBg} p-6 rounded-3xl border space-y-4 max-w-lg`}>
          <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 text-[10px] font-bold">IDO EN COURS</span>
          <h3 className="text-base font-black">SOLAR-GRID BUILDINGS PROTOCOL</h3>
          <p className={`text-xs ${subText}`}>Financement participatif tokenisé pour l'installation de 5,000m² de panneaux photovoltaïques intelligents.</p>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold">
              <span>Objectif Softcap: 500,000 USDC</span>
              <span className="text-emerald-400">82% Rempli</span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500" style={{ width: '82%' }} />
            </div>
          </div>

          <button
            onClick={() => alert("Participation IDO initiée avec succès.")}
            className="w-full py-3 rounded-xl btn-gradient-orange text-white font-bold text-xs shadow-md cursor-pointer"
          >
            CONTRIBUER (USDC)
          </button>
        </div>
      </div>
    );
  }

  if (subRoute === 'bridge') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">CROSS-CHAIN BRIDGE DE FI</h2>
          <p className={`text-xs ${subText}`}>Transfert inter-blockchains sécurisé (Ethereum, Polygon, Arbitrum, BNB Chain)</p>
        </div>

        <div className={`${cardBg} p-6 rounded-3xl border space-y-4 max-w-md`}>
          <div className="space-y-2 text-xs">
            <div>
              <label className="block font-bold mb-1">RESEAU SOURCE</label>
              <select className="w-full bg-black/20 border border-slate-500/30 rounded-xl p-2.5 text-white">
                <option>Ethereum Mainnet</option>
                <option>Polygon POS</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">RÉSEAU DESTINATION</label>
              <select className="w-full bg-black/20 border border-slate-500/30 rounded-xl p-2.5 text-white">
                <option>Arbitrum One</option>
                <option>BNB Chain</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => alert("Transfert Cross-Chain initié.")}
            className="w-full py-3 rounded-xl btn-gradient-orange text-white font-bold text-xs shadow-md cursor-pointer"
          >
            EXÉCUTER BRIDGE
          </button>
        </div>
      </div>
    );
  }

  // Default for Oracle, Perpetuals, Options
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black uppercase text-orange-500">WEB3 & DEFI: {subRoute.toUpperCase()}</h2>
        <p className={`text-xs ${subText}`}>Module de marché financier décentralisé et flux oracles en temps réel</p>
      </div>

      <div className={`${cardBg} p-8 rounded-3xl border text-center space-y-3`}>
        <TrendingUp className="w-12 h-12 text-orange-500 mx-auto animate-pulse" />
        <h3 className="text-base font-black uppercase">MARCHÉ DEFI ACTIF</h3>
        <p className="text-xs text-slate-400">Flux de prix Oracles Chainlink interconnectés aux actifs réels RWA du bâtiment.</p>
      </div>
    </div>
  );
};
