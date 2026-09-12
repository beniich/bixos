import Stripe from 'stripe';
import { stripe } from './stripeClient';
import { syncSubscriptionToFirestore } from './subscriptionSync'; // Todo: adapt to prisma

export async function handleStripeWebhook(c: any) {
  const sig = c.req.header('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET manquant');
    return c.json({ error: 'Webhook secret non configuré' }, 500);
  }

  let event: Stripe.Event;

  try {
    // Hono way to get raw body as string for Stripe signature verification
    const rawBody = await c.req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig || '', webhookSecret);
  } catch (err: any) {
    console.error('[Webhook] Signature invalide:', err.message);
    return c.json({ error: `Webhook invalide: ${err.message}` }, 400);
  }

  console.log(`[Webhook] Événement reçu: ${event.type} — ${event.id}`);
  const prisma = c.get('prisma');

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await syncSubscriptionToFirestore(sub, 'active', session.metadata, prisma);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          const sub = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
          await syncSubscriptionToFirestore(sub, 'active', undefined, prisma);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          const sub = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
          await syncSubscriptionToFirestore(sub, 'past_due', undefined, prisma);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status === 'active' ? 'active'
          : sub.status === 'past_due'  ? 'past_due'
          : sub.status === 'trialing'  ? 'trial'
          : 'suspended';
        await syncSubscriptionToFirestore(sub, status as any, undefined, prisma);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscriptionToFirestore(sub, 'cancelled', undefined, prisma);
        break;
      }
      default:
        console.log(`[Webhook] Événement ignoré: ${event.type}`);
    }
  } catch (err: any) {
    console.error('[Webhook] Erreur traitement:', err);
    return c.json({ error: 'Erreur traitement webhook' }, 500);
  }

  return c.json({ received: true }, 200);
}
