import * as functions from "firebase-functions";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

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

export const createUserDocument = functions.region('asia-northeast1').auth.user().onCreate((user, context) => {
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
    user.photoURL = 'https://firebasestorage.googleapis.com/v0/b/my-react-project-db288.appspot.com/o/no-avatar.png?alt=media&token=d6885cd9-c468-4c24-860b-70f3a482e23e';
  }
  console.log(user);
  db.collection("users")
    .doc(user.uid)
    .set(JSON.parse(JSON.stringify(user)));
});

export const createVideoDocument = functions.region('asia-northeast1').storage.object().onFinalize((object, context) => {
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