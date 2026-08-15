import React, { useState } from 'react';
import { PageId, Language, PricingPlan } from '../../types';
import { PRICING_PLANS, FAQ_ITEMS } from '../../data/mockData';
import { useTranslation } from '../../hooks/useTranslation';
import { Check, Shield, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface PricingPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, language: propLang }) => {
  const { t, language } = useTranslation(propLang);
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [subscribedMessage, setSubscribedMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const monthlyLabels: Record<Language, string> = {
    FR: 'Mensuel',
    EN: 'Monthly',
    DE: 'Monatlich',
    ES: 'Mensual',
  };

  const yearlyLabels: Record<Language, string> = {
    FR: 'Annuel',
    EN: 'Annual',
    DE: 'Jährlich',
    ES: 'Anual',
  };

  const handleSubscribe = (plan: PricingPlan) => {
    setSelectedPlan(plan);
  };

  const confirmSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribedMessage(`Successfully subscribed to ${selectedPlan?.name} plan!`);
    setTimeout(() => {
      setSubscribedMessage('');
      setSelectedPlan(null);
    }, 2500);
  };

  // Splitting the title to apply gradient to the last word as in BizOS mockup
  const titleWords = t('pricingHeaderTitle', language).split(' ');
  const lastWord = titleWords.pop();
  const firstPart = titleWords.join(' ');

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-4 sm:px-8 font-sans text-[#e1e3e4] animate-fade-in" style={{ backgroundColor: '#180f22' }}>
      <style>{`
        .biz-glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .biz-ambient-glow {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(255, 170, 247, 0.15) 0%, rgba(24, 15, 34, 0) 70%);
            border-radius: 50%;
            z-index: 0;
            pointer-events: none;
        }
        .biz-primary-gradient {
            background: linear-gradient(135deg, #ffaaf7 0%, #ffb95a 100%);
        }
        .biz-text-gradient {
            background: linear-gradient(135deg, #ffaaf7 0%, #ffb95a 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Ambient Glows */}
      <div className="biz-ambient-glow top-0 left-1/4"></div>
      <div className="biz-ambient-glow bottom-0 right-1/4"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-light mb-6 tracking-tight">
            {firstPart} <span className="biz-text-gradient font-normal">{lastWord}</span>
          </h1>
          <p className="text-base md:text-lg text-[#d5c1cf] mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            {t('pricingHeaderSubtitle', language)}
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 biz-glass-card rounded-full text-xs font-medium tracking-wide text-[#ffb95a]">
              <Shield className="w-4 h-4" />
              14-Day Guarantee. No Credit Card Required.
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-2">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-[#ffb95a]' : 'text-[#d5c1cf]'}`}>
                {monthlyLabels[language]}
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-14 h-8 rounded-full biz-glass-card p-1 border border-[#ffaaf7]/30 transition-colors relative cursor-pointer"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-[#ffaaf7] transition-transform transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-0'
                  }`}
                  style={{ boxShadow: '0 0 10px rgba(255, 170, 247, 0.5)' }}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isAnnual ? 'text-[#ffb95a]' : 'text-[#d5c1cf]'}`}>
                  {yearlyLabels[language]}
                </span>
                <span className="text-[10px] font-bold text-[#180f22] bg-[#ffb95a] px-2 py-0.5 rounded-full">
                  SAVE 20%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {PRICING_PLANS.map((plan) => {
            const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
            const isPopular = plan.popular;
            
            return (
              <div
                key={plan.id}
                className={`biz-glass-card rounded-xl p-8 flex flex-col hover:scale-[1.03] transition-transform duration-300 relative overflow-hidden ${
                  isPopular ? 'border-[#ffaaf7]' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-[#ffaaf7] text-[#5a005d] px-3 py-1 rounded-bl-lg text-xs font-semibold tracking-wide">
                    {plan.badge || 'Populaire'}
                  </div>
                )}
                
                <h3 className="text-xl font-normal mb-2 text-[#e1e3e4]">{plan.name}</h3>
                <p className="text-sm text-[#d5c1cf] mb-6 min-h-[40px] font-light leading-relaxed">
                  {plan.description}
                </p>
                
                <div className="mb-6 flex items-end gap-1">
                  <span className={`text-5xl font-light ${isPopular ? 'text-[#ffb95a]' : 'text-[#ffaaf7]'}`}>
                    {price}€
                  </span>
                  <span className="text-[#d5c1cf] mb-1">/mo</span>
                </div>
                
                <ul className="flex-grow space-y-4 mb-8">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#e1e3e4] text-sm font-light">
                      <Check className="text-[#ffb95a] w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full py-3 rounded-lg transition-all duration-300 ${
                    isPopular
                      ? 'biz-primary-gradient text-[#5a005d] hover:opacity-90 font-semibold shadow-[0_0_15px_rgba(255,170,247,0.3)]'
                      : 'border border-[#ffaaf7]/40 text-[#ffaaf7] hover:bg-[#ffaaf7]/10 font-medium'
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            );
          })}
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-light text-center mb-10 text-[#e1e3e4]">
            {language === 'FR' ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.slice(0, 4).map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="biz-glass-card rounded-lg p-6 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-normal text-[#e1e3e4] pr-8">
                      {faq.question[language] || faq.question['EN']}
                    </h4>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#ffaaf7] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#d5c1cf] flex-shrink-0" />
                    )}
                  </div>
                  {isOpen && (
                    <p className="mt-4 text-[#d5c1cf] font-light leading-relaxed animate-fade-in text-sm md:text-base">
                      {faq.answer[language] || faq.answer['EN']}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Subscription Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#180f22]/90 backdrop-blur-md animate-fade-in">
          <div className="biz-glass-card w-full max-w-lg rounded-2xl p-8 border border-[#ffaaf7]/50 shadow-[0_0_40px_rgba(255,170,247,0.2)] relative space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#ffb95a]" />
                <h3 className="text-xl font-normal text-white">Subscribe to {selectedPlan.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-[#d5c1cf] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {subscribedMessage ? (
              <div className="p-6 text-center space-y-3 bg-[#ffaaf7]/10 border border-[#ffaaf7]/30 rounded-xl">
                <CheckCircle2 className="w-12 h-12 text-[#ffaaf7] mx-auto" />
                <p className="text-base font-medium text-white">{subscribedMessage}</p>
                <p className="text-sm text-[#d5c1cf] font-light">Provisioning your sovereign cloud cluster...</p>
              </div>
            ) : (
              <form onSubmit={confirmSubscription} className="space-y-5">
                <div className="bg-black/20 p-5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{selectedPlan.name} Plan</div>
                    <div className="text-xs text-[#d5c1cf] font-light">Billed {isAnnual ? 'Annually' : 'Monthly'}</div>
                  </div>
                  <div className="text-2xl font-light text-[#ffb95a]">
                    {isAnnual ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}€ <span className="text-sm text-[#d5c1cf]">/ mo</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#d5c1cf] mb-1.5 font-light tracking-wide">Company / Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Acme Corp / Jane Doe"
                    className="w-full bg-black/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffaaf7] border border-white/10 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#d5c1cf] mb-1.5 font-light tracking-wide">Work Email</label>
                  <input
                    required
                    type="email"
                    placeholder="jane@acme.com"
                    className="w-full bg-black/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffaaf7] border border-white/10 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full biz-primary-gradient text-[#5a005d] py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity mt-4 shadow-[0_0_15px_rgba(255,170,247,0.3)]"
                >
                  Confirm & Start Trial
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
