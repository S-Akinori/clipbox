import { useState, useEffect } from "react";
import firebase from "../firebase/clientApp";
import fetchUserStatus from "./fetchUserStatus";

export default function useUserStatus(user: firebase.User | null | undefined) {
  const [userStatus, setUserStatus] = useState<string | undefined>('');

  useEffect(() => {
    if (user) {
      const checkUserStatus = async function () {
        setUserStatus(await fetchUserStatus());
      };
      checkUserStatus();
    }
  }, [user]);

  return userStatus;
}