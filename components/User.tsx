import React, {ReactElement} from "react";
// import Image from "next/dist/client/image";
import Link from "next/dist/client/link";
import {db} from "../firebase/clientApp";
import {useDocument} from "react-firebase-hooks/firestore";

interface Prop {
  id: string,
  isImage?: boolean,
  isName?: boolean
}

function User({id, isImage = true, isName = true}: Prop): ReactElement {
  const [value, loading, error] = useDocument(
    db.doc(`users/${id}`)
  );

  if(error) {
    return <p>No User</p>
  }

  return (
    <div>
      {value && 
        <Link href={`/user/${id}`}>
          <a className="flex items-center">
            {isImage && <img className="rounded-full w-16 h-16 object-cover" loading="lazy" src={value.data()?.photoURL} alt={value?.data()?.displayName} width="60" height="60" />}
            {isName && <p className="ml-2">{value?.data()?.displayName}</p>}
          </a>
        </Link>
      }
    </div>
  );
}

export default User;