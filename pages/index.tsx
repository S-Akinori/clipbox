import styles from '../styles/Home.module.css'
import Link from "next/dist/client/link";
import {auth} from '../firebase/clientApp'
import { useAuthState } from 'react-firebase-hooks/auth'
import Auth from '../components/auth/SignInForm.tsx'
import Layout from '../components/Layout'
import User from '../components/User'
import { Button } from '@material-ui/core';

const Home = () => {
  const [user, loading, error] = useAuthState(auth)
  
  console.log("Loading:", loading, "|", "Current user:", user)
  return (
    <Layout>
      <h1 className={styles.title}>
        Welcome to Clipbox!!
      </h1>

      {loading && <h4>Loadng...</h4>}
      {!user && <div className="text-center"><Link href="/signup">Sign Up</Link></div>}
      {user && (
        <div className="flex justify-center py-4">
          <User id={user.uid} />
        </div>
      )}
    </Layout>
  )
}

export default Home
