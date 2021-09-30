import {auth} from "../firebase/clientApp";

export default async function isUserPersonal(): Promise<boolean> {
  await auth.currentUser?.getIdToken(true);
  const decodedToken = await auth.currentUser?.getIdTokenResult();

  return decodedToken?.claims?.stripeRole ? true : false;
}