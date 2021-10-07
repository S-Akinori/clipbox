import { useRouter } from "next/dist/client/router";
import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase, { db } from "../../firebase/clientApp";
import { createCheckoutSession } from "../../stripe/createCheckoutSession";

const uiConfig = {
  signInSuccessUrl: "/video",
  signInFlow: 'popup',
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false
    },
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    signInSuccessWithAuthResult: (authResult: firebase.auth.UserCredential, redirectUrl = '/video') => {
      if(!authResult.additionalUserInfo?.isNewUser) {
        return true
      } else {
        const user = authResult.user
        let photoURL = user?.photoURL
        let displayName = user?.displayName
        if(user) {
          db.collection('users').doc(user.uid).set(JSON.parse(JSON.stringify(user)))
          if(!photoURL || !displayName) {
            if(!photoURL) {
              photoURL = 'https://firebasestorage.googleapis.com/v0/b/my-react-project-db288.appspot.com/o/no-avatar.png?alt=media&token=d6885cd9-c468-4c24-860b-70f3a482e23e'
            }
            if(!displayName) {
                const str = "0123456789";
                const len = 6
                let userName = "user_";
                for(let i = 0; i < len; i++){
                  userName += str.charAt(Math.floor(Math.random() * str.length));
                }
                displayName = userName
            }
            user.updateProfile({
              displayName: displayName,
              photoURL: photoURL
            }).then(() => {
              db.collection('users').doc(user.uid).update({
                photoURL: photoURL,
                displayName: displayName
              })
            })
          }
          createCheckoutSession(user.uid)
          return false
        }
      }
    }
  }
}

const SignInScreen = () => {
  return (
    <div>
      <StyledFirebaseAuth uiConfig={uiConfig as any} firebaseAuth={firebase.auth()} />
    </div>
  )
}

export default SignInScreen;