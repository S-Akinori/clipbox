import React, {useState} from "react";
import { useRouter } from "next/dist/client/router";
import Layout from "../components/Layout";
import { auth } from "../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import Button from "../components/Button"
import CircularProgress from '@material-ui/core/CircularProgress';
import { createCheckoutSession } from "../stripe/createCheckoutSession";

const ViewPricing = () => {
  const router = useRouter()
  const [user, loading, error] = useAuthState(auth)
  const [isLoading, setIsLoading] = useState(false)
  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.target as HTMLButtonElement
    if(user) {
      el.disabled = true
      createCheckoutSession(user.uid)
      setIsLoading(true)
    } else {
      router.push('/signup')
    }
  }

  const logout = () => {
    auth.signOut().then(() => {
      router.push('/')
    }).catch((error) => {
      alert('エラーが発生しました。')
    })
  }

  return (
    <Layout>
      <div className="p-4">
        {user && 
          <>
            <div className="flex justify-center items-center">
              <img className="rounded-full w-16 h-16 object-cover mr-4" loading="lazy" src={user?.photoURL as string} alt={user?.displayName as string} width="60" height="60" />
              <span>{user.displayName}</span>
            </div>
            <p className="text-center">決済が完了していません。</p>
          </>
        }
        <div className="md:flex justify-center py-8">
          <div className="bg-white shadow-md rounded p-4 my-4 mx-4 md:w-1/3">
            <div className="text-center">
              <span className="block text-sm">個人プラン</span>
              <span className="text-3xl font-bold">1,000<span className="text-sm">円/月</span></span>
            </div>
            <table className="my-6 w-full">
              <tbody>
                <tr className="border-b-2">
                  <td className="py-4">ダウンロード数</td>
                  <td className="py-4">無制限</td>
                </tr>
                <tr>
                  <td className="py-4">ユーザー数</td>
                  <td className="py-4">1人</td>
                </tr>
              </tbody>
            </table>
            <div className="text-center">
              <Button className="rounded-full" onClick={onClick}>このプランで始める</Button>
              {isLoading && 
                <CircularProgress />
              }
            </div>
          </div>
        </div>
        {user && 
          <div className="text-center">
            <Button color="red" onClick={() => logout()}>ログアウト</Button>
          </div>
        }
      </div>
    </Layout>
  )
}

export default ViewPricing