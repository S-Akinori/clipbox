import { Stripe, loadStripe } from "@stripe/stripe-js";

let stripePromise: Stripe | null;

const initializeStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe((process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string));
  }
  return stripePromise;
};
export default initializeStripe;