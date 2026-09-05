/**
 * Configuration PayPal Client & SDK
 * Application : bizos
 */

export const PAYPAL_CONFIG = {
  appName: 'bizos',
  clientId: (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || 'BAAd4qjSxz7BLyZM95yOWEO0G7s2OUm_qDWLGEgwpeUEG1NNH6_02kGPlhmr8OK98lbscHbMVIin7NGhdc',
  currency: 'EUR',
  intent: 'capture' as const,
};

/**
 * Helper pour charger dynamiquement le script PayPal SDK
 */
let paypalPromise: Promise<any> | null = null;

export function loadPayPalSdk(clientId = PAYPAL_CONFIG.clientId, currency = PAYPAL_CONFIG.currency): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).paypal) return Promise.resolve((window as any).paypal);

  if (!paypalPromise) {
    paypalPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
      script.async = true;
      script.onload = () => resolve((window as any).paypal);
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }

  return paypalPromise;
}
