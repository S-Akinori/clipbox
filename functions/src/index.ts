import * as functions from "firebase-functions";
import { UserRecord } from "firebase-functions/v1/auth";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
import * as admin from 'firebase-admin'
import fetch from 'node-fetch'

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();
// const storage = admin.storage()

// if local, use emulators
if(process.env.NODE_ENV === 'development') {
  db.settings({
    host: "localhost:8080",
    ssl: false
  })
}

/**
 * create the user document if a new user signs up
 */
export const createUserDocument = functions.region('asia-northeast1').auth.user().onCreate((user, context) => {
  let displayName = user.displayName
  let photoURL = user.photoURL
  if(!displayName) { // when email auth
    const str = "0123456789";
    const len = 6
    let userName = "user_";
    for(let i = 0; i < len; i++){
      userName += str.charAt(Math.floor(Math.random() * str.length));
    }
    displayName = userName
  }
  if(!photoURL) { // when email auth
    photoURL = 'https://firebasestorage.googleapis.com/v0/b/my-react-project-db288.appspot.com/o/no-avatar.png?alt=media&token=d6885cd9-c468-4c24-860b-70f3a482e23e';
  }

  auth.updateUser(user.uid, {
    displayName: displayName,
    photoURL: photoURL
  }).then((userRecord: UserRecord) => {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully updated user', userRecord.toJSON());
    db.collection("users")
      .doc(userRecord.uid)
      .set(JSON.parse(JSON.stringify(userRecord)));
  })
});

/**
 * create tag document when a video is uploaded
 * this doc is used for text fields with auto-complete
 */
export const createTagDocument = functions.region('asia-northeast1').firestore.document('videos/{videoId}').onCreate((snap, context) => {
  const tags: string[] = snap.data().tags
  if(tags) {
    console.log(tags)
    tags.forEach((tag, index) => {
      db.collection("tags").where('value', '==', tag).get().then((snapshot) => {
        if(!snapshot.empty) { // if the tag already exists, add the video Id to the tag doc
          snapshot.docs.forEach(doc => {
            console.log(doc.data().videoIds)
            const videoIds: string[] = doc.data().videoIds
            videoIds.push(snap.id)
            db.collection('tags').doc(doc.id).update({
              videoIds: videoIds
            })
          })
        } else { // if not, create a new tag document
          db.collection('tags').add({
            value: tag,
            videoIds: [snap.id]
          })
        }
      })
      
    })
  }
  // const uid = object.metadata?.uid
  // console.log(uid);
  // if(uid) {
  //   if(object.contentType?.startsWith('video')) {
  //     db.collection("videos")
  //     .add({
  //       uid: uid,
  //       filename: object.name,
  //       title: object.metadata?.title,
  //       description: object.metadata?.description,
  //       createdAt: object.timeCreated,
  //       size: object.size,
  //       downloadCount: 0,
  //       tags: object.metadata?.tags
  //     })
  //   } else {
  //     console.log("This file is not a video file")
  //   }
  // } else {
  //   console.log("Could not find uid")
  // }
})

export const downloadVideo = functions.https.onCall(async (data, context) => {
  // const bucket = storage.bucket()
  // const [url] = await bucket.file(data.filename).getSignedUrl({
    //   action: 'read',
    //   expires: '12-31-3020'
    // })

  const buketName = 'default-bucket'

  const url = `http://localhost:9199/v0/b/${buketName}/o/${encodeURIComponent(data.filename)}?alt=media`;
  console.log('url: ', url)

  if(!url) {
    console.log('url is not found')
    throw new functions.https.HttpsError('invalid-argument', 'url is not found', data)
  }

  const videoData = await fetch(url)
  // console.log('videoData: ', videoData.json())
  // const blob = await videoData.blob()
  // console.log('videoDataBlob: ', blob)
  
  return {videoData: videoData.blob()};
})