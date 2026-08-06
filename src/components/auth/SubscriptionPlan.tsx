import React, { useState } from 'react';
import { Check, Zap, Building2, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SubscriptionPlan: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      onNavigate('login');
      return;
    }
    
    setLoadingPlan(planId);
    try {
      // In a real integration, this would call our backend to create a Stripe Checkout session
      const response = await fetch('/api/subscription/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ planId })
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert('Failed to initiate checkout.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // For demo purposes, if API isn't ready:
      alert('Subscription API is currently being setup. Please try again later.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$49',
      period: '/mo',
      description: 'Perfect for small coworking spaces getting started.',
      features: ['Up to 50 members', 'Basic booking system', 'Email support', '1 Location'],
      icon: <Zap className="h-6 w-6 text-blue-400" />
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$149',
      period: '/mo',
      description: 'Advanced tools for growing and multi-location spaces.',
      features: ['Unlimited members', 'Advanced analytics', '24/7 Priority support', 'Up to 3 Locations', 'Custom branding'],
      icon: <Building2 className="h-6 w-6 text-purple-400" />,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Dedicated infrastructure and tailored features.',
      features: ['Unlimited everything', 'Dedicated account manager', 'SLA guarantee', 'Custom integrations', 'API access'],
      icon: <Shield className="h-6 w-6 text-emerald-400" />
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">Choose Your BizOS Plan</h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Scale your coworking space operations with our flexible pricing plans designed for every stage of your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative rounded-3xl p-8 backdrop-blur-xl border ${plan.popular ? 'bg-white/10 border-purple-500 shadow-2xl shadow-purple-500/20 transform md:-translate-y-4' : 'bg-white/5 border-white/10 hover:bg-white/10'} transition-all duration-300 flex flex-col group`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                {plan.icon}
              </div>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">{plan.price}</span>
              <span className="text-slate-400 font-medium ml-2">{plan.period}</span>
            </div>
            
            <p className="text-slate-400 mb-8 h-12">{plan.description}</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan === plan.id}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all duration-300 ${
                plan.popular 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {loadingPlan === plan.id ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'} 
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
