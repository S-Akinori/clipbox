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

if(process.env.NEXT_PUBLIC_ANALYTICS_ID === 'local') {
  auth.useEmulator("http://localhost:9099");
  // db.useEmulator("http://localhost", 8080);
  db.settings({
    host: "localhost:8080",
    ssl: false
  });
  firebase.functions().useEmulator("localhost", 5001);
  storage.useEmulator("localhost", 9199);
  console.log('Local Dev')
}

export {auth, db, storage}
export default firebase