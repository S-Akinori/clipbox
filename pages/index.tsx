import styles from '../styles/Home.module.css'
import Link from "next/dist/client/link";
import Image from 'next/dist/client/image';
import {auth} from '../firebase/clientApp'
import { useAuthState } from 'react-firebase-hooks/auth'
import Auth from '../components/auth/SignInForm.tsx'
import Layout from '../components/Layout'
import Button from '../components/Button'
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CropIcon from '@material-ui/icons/Crop';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { createCheckoutSession } from "../stripe/createCheckoutSession";
import usePersonalStatus from '../hooks/useUserStatus';


const Home = () => {
  const [user, userLoading] = useAuthState(auth);
  const userIsPersonal = usePersonalStatus(user);
  return (
    <Layout>
      <div className="relative">
        <div className=" md:h-96">
          <video src="top.mp4" className="object-cover w-full h-full" autoPlay loop muted playsInline></video>
        </div>
        <div className="absolute top-1/4 w-full text-center">
          <h1 className="text-lg md:text-3xl text-white font-bold">動画編集者にコミットした動画サイト</h1>
          <div className="text-center py-8">
            <Button href="#plan" color="yellow">プランを見る</Button>
          </div>
        </div>
      </div>
      <div className="py-8">
        <section className="md:px-16 px-4 py-8">
          <h2 className={`${styles.title_h2} text-xl md:text-3xl font-bold text-center py-4`}>なんでClipboxを使うべき？</h2>
          <div>
            <div className="md:flex py-6">
              <div className="md:w-1/2">
                <h3 className="text-lg font-bold text-center py-4">ナレーションに使える動画が見つかる</h3>
                <p className="text-center">ナレーション動画で汎用性のある動画をすぐに見つけることができます。</p>
                <ul className="py-4 w-3/4 mx-auto">
                  <li className="py-2"><PlayArrowIcon className="p-1 bg-indigo-200 rounded-full text-white text-4xl" /> 5～15秒程度の短いもの</li>
                  <li className="py-2"><CropIcon className="p-1 bg-indigo-200 rounded-full text-white text-4xl" /> 日常の動作を切り取ったもの</li>
                  <li className="py-2"><PersonOutlineIcon className="p-1 bg-indigo-200 rounded-full text-white text-4xl" /> 人物の顔が映っていないもの</li>
                </ul>
                <div className="text-center">
                  <Button href="#howToUse" color="blue">素材の使用例を見る</Button>
                </div>
              </div>
              <div className="md:w-1/2 text-center py-4">
                <Image src="/mac-editor.png" alt="動画編集" width={400} height={260} />
              </div>
            </div>
            <div className="md:flex py-6 flex-row-reverse">
              <div className="md:w-1/2">
                <h3 className="text-lg font-bold text-center py-4">日本語で調べられる</h3>
                <p>ナレーション用の素材を探す場合こんなデメリットが...</p>
                <ul className="py-2">
                  <li className="py-2"><CheckCircleIcon className="text-red-300" /> 日本語サイトでは素材が不十分</li>
                  <li className="py-2"><CheckCircleIcon className="text-red-300" /> 海外サイトでは英語を使わないといけない</li>
                </ul>
                <p>Clipboxは日本で作られたものなので安心して利用できます</p>
              </div>
              <div className="md:w-1/2 text-center py-4">
                <Image src="/search.jpg" alt="動画編集" width={400} height={133} />
              </div>
            </div>
          </div>
        </section>
        <section className={`${styles.background_skew} py-16 px-4 relative z-10 text-white`}>
          <h2 id="howToUse" className={`${styles.title_h2} ${styles.title_h2__white}  text-xl md:text-3xl font-bold text-center py-4`}>Clipboxの素材はこう使えます</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-xl text-center">解説動画の中で、話の内容に合った素材を入れられます！</p>
            <div className="py-12">
              <p className="font-bold">例) 健康系の動画で「たったこれだけで疲れにくい体を作れます」と訴えたいときに...</p>
              <div className="md:flex items-center py-8">
                <div className="md:w-1/2 px-4">
                  「疲れにくい体」なので、激しい動きをしている動画をダウンロードする
                </div>
                <div className="md:w-1/2 px-4">
                  <video src="Boy - 21827.mp4" width="320" height="180" autoPlay loop muted playsInline></video>
                </div>
              </div>
              <div className="md:flex items-center py-8">
                <div className="md:w-1/2 px-4">
                  あとは使いたい部分を切り取って<br />
                  テロップや音声を入れるだけ！
                </div>
                <div className="md:w-1/2 px-4">
                  <Image src="/edit-man-video.png" alt="Clipboxの素材の使い方" width={330} height={192} />
                </div>
              </div>
              <p className="font-bold text-2xl text-center">簡単に手早く高品質な動画を作ることができます</p>
              <div className="py-6">
                <p className="text-center">動画の参考例</p>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe className="max-w-full h-full" width="560" height="360" src="https://www.youtube.com/embed/cN9_ilAAdgw" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 px-4">
          <h2 className={`${styles.title_h2} text-xl md:text-3xl font-bold text-center py-4`}>例えばこんな動画があります</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <video src="Cat - 66004.mp4" autoPlay loop muted playsInline></video>
            </div>
            <div>
              <video src="Coffee - 26846.mp4" autoPlay loop muted playsInline></video>
            </div>
            <div>
              <video src="Chromakey - 11285.mp4" autoPlay loop muted playsInline></video>
            </div>
          </div>
          <div className="text-center py-8">
            <Button href="#plan">さっそく利用する</Button>
          </div>
        </section>
        <section className="py-12 px-4">
          <h2 id="plan" className={`${styles.title_h2} text-xl md:text-3xl font-bold text-center py-4`}>ご利用プラン</h2>
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
                  {/* <Button className="rounded-full" onClick={() => createCheckoutSession(user.uid)}>このプランで始める</Button> */}
                  <Button href="signup" className="rounded-full">このプランで始める</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default Home
