import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage"

const clientCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

if(!firebase.apps.length) {
  firebase.initializeApp(clientCredentials);
}

//local設定

const app = firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const functions = firebase.functions()

if(process.env.NODE_ENV === 'development' && typeof window !== "undefined") {
    auth.useEmulator("http://localhost:9099");
    db.useEmulator("localhost", 8080)
    functions.useEmulator("localhost", 5001);
    storage.useEmulator("localhost", 9199);
    console.log('Local Dev')
}

export {auth, db, storage, functions}
export default firebase