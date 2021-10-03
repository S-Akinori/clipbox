import {auth} from "../firebase/clientApp";

export default async function fetchUserStatus(): Promise<string | undefined> {
  await auth.currentUser?.getIdToken(true);
  const decodedToken = await auth.currentUser?.getIdTokenResult();
  return decodedToken?.claims?.stripeRole;
}