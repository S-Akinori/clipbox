import React from "react";
// import Image from "next/dist/client/image";
import User from "./User";
import Link from "next/dist/client/link";
import { auth } from "../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";

const Header = () => {
  const [user, loading, error] = useAuthState(auth)

  return (
    <header className="sticky top-0 left-0 shadow-md z-50 w-full bg-white">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-2xl"><Link href="/">Clipbox</Link></h1>
        <ul className="flex">
          <li className="px-4"><Link href="/video">Videos</Link></li>
          <li><Link href="/video/create">Create</Link></li>
        </ul>
        {user &&
          <Link href={`/user/${user?.uid}`}>
            <a className="flex items-center">
              <img className="rounded-full w-16 h-16 object-cover" loading="lazy" src={user?.photoURL as string} alt={user?.displayName as string} width="60" height="60" />
            </a>
          </Link>
        }
        {!user && <Link href="/login">Login</Link>}
      </div>
      
    </header>
  )
}

export default Header