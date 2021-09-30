import { useState, useEffect } from "react";
import firebase from "../firebase/clientApp";
import isUserPersonal from "./isUserPersonal";

export default function usePersonalStatus(user: firebase.User | null | undefined) {
  const [personalStatus, setPersonalStatus] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      const checkPersonalStatus = async function () {
        setPersonalStatus(await isUserPersonal());
      };
      checkPersonalStatus();
    }
  }, [user]);

  return personalStatus;
}