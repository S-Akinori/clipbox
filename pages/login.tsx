import React, {useEffect} from "react";
import Link from "next/dist/client/link";
import { useRouter } from "next/dist/client/router";
import Auth from "../components/auth/SignInForm.tsx"
import { auth } from "../firebase/clientApp";
import { useAuthState } from 'react-firebase-hooks/auth'
import Layout from "../components/Layout";

const Login = () => {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth)

  useEffect(() => {
    if(user && !loading) {
      router.push('/')
    }
  })

  return (
    <Layout>
      <div className="flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mt-24">
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Log in</h2>
            <p className="mt-2 text-center text-md text-gray-600">
              {"Don't have an account?"}
              <Link href="/signup">
                <a href="#" className="text-blue-500">Sign Up</a>
              </Link>
            </p>
          </div>
          
          {loading && <h4>Loadng...</h4>}
          {!user && <Auth />}
        </div>
      </div>
    </Layout>
  )
}

export default Login;