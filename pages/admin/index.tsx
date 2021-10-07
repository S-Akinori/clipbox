import React, {useState} from "react";
import { useRouter } from "next/dist/client/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/clientApp";
import useUserStatus from '../../hooks/useUserStatus';

const AdminPage = () => {
  const router = useRouter()
  const [user, userLoading, userError] = useAuthState(auth)
  const userStatus = useUserStatus(user)
  const [isAdmin, setIsAdmin] = useState(false)

  if(user) {
    user.getIdTokenResult().then((idTokenResult) => {
      if(idTokenResult.claims.role === 'admin') {
        setIsAdmin(true)
      }
    })
  }

  if(!userLoading && !isAdmin) {
    router.push('/');
  }

  return (
    <p>Hellow admin!!</p>
  )
}

export default AdminPage