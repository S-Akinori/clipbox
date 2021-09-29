import { Stripe, loadStripe } from "@stripe/stripe-js";

let stripePromise: Stripe | null;

const initializeStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe(
      "pk_test_51JexzTFH1KGSZSz1G4WyFjY3LqG77gqrPWiJmMZd19Ywa3sVmYhOISv0ETnNLLH1TSZvXd9EPPMmFADyW9MKzY1J00OLgtl3JL"
    );
  }
  return stripePromise;
};
export default initializeStripe;