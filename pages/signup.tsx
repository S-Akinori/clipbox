import React from 'react';
import Link from 'next/link'
import SignInForm from '../components/auth/SignInForm.tsx'
import { auth } from '../firebase/clientApp';
import { useAuthState } from 'react-firebase-hooks/auth'
import Layout from '../components/Layout';

const SignUpPage = () => {
  const [user, loading, error] = useAuthState(auth)

  return (
    <Layout>
      <div className="flex">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center mt-24">
            <h2 className="text-center text-3xl leading-9 font-extrabold text-gray-900">Sign up</h2>
              <p className="mt-2 text-center text-md text-gray-600">
                already have an account?{' '}
                <Link href="/login">
                  <a href="#" className="text-blue-500">Log in</a>
                </Link>
              </p>
          </div>
          
          <SignInForm />
        </div>
      </div>
    </Layout>
  );
}

export default SignUpPage;