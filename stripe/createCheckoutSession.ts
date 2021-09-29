import {db} from "../firebase/clientApp";
import getStripe from "./initializeStripe";

export async function createCheckoutSession(uid: string) {

  // Create a new checkout session in the subollection inside this users document
  const checkoutSessionRef = await db
    .collection("users")
    .doc(uid)
    .collection("checkout_sessions")
    .add({
      // replace the price_XXX value with the correct value from your product in stripe.
      price: "price_1Jf0NqFH1KGSZSz1vSEQYeP4",
      success_url: window.location.origin,
      cancel_url: window.location.origin,
    });

  // Wait for the CheckoutSession to get attached by the extension
  checkoutSessionRef.onSnapshot(async (snap) => {
    const { sessionId } = snap.data() as any;
    if (sessionId) {
      // We have a session, let's redirect to Checkout
      // Init Stripe
      console.log(sessionId)
      const stripe = await getStripe();
      stripe?.redirectToCheckout(sessionId);
    }
  });
}