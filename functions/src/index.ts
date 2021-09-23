import * as functions from "firebase-functions";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.getUser = functions.https.onCall((data, context) => {
  return {data: data, auth: context.auth}
})

const admin = require("firebase-admin");
admin.initializeApp();
// const auth = admin.auth();
const db = admin.firestore();

// auth.useEmulator("http://localhost:9099");
if(process.env.NEXT_PUBLIC_ENV=== 'local')
db.settings({
  host: "localhost:8080",
  ssl: false
})

export const createUserDocument = functions.auth.user().onCreate((user, context) => {
  if(!user.displayName) {
    const str = "0123456789";
    const len = 6
    let userName = "user_";
    for(let i = 0; i < len; i++){
      userName += str.charAt(Math.floor(Math.random() * str.length));
    }
    user.displayName = userName
  }
  if(!user.photoURL) {
    user.photoURL = 'https://akiblog10.com/wp-content/uploads/2021/09/no-avatar.png';
  }
  console.log(user);
  db.collection("users")
    .doc(user.uid)
    .set(JSON.parse(JSON.stringify(user)));
});

export const createVideoDocument = functions.storage.object().onFinalize((object, context) => {
  const uid = object.metadata?.uid
  console.log(uid);
  if(uid) {
    if(object.contentType?.startsWith('video')) {
      db.collection("videos")
      .add({
        uid: uid,
        filename: object.name,
        title: object.metadata?.title,
        description: object.metadata?.description,
        createdAt: object.timeCreated,
        size: object.size,
        downloadCount: 0,
        tags: object.metadata?.tags
      })
    } else {
      console.log("This file is not a video file")
    }
  } else {
    console.log("Could not find uid")
  }
})