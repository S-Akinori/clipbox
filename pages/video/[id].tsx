import React, {useEffect, useState} from "react";
import { useRouter } from "next/dist/client/router";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import firebase, { db, auth } from "../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { saveAs } from "file-saver";
import GetAppIcon from '@material-ui/icons/GetApp';
import EmbedVideo from "../../components/EmbedVideo";
import Layout from "../../components/Layout";
import User from "../../components/User";
import Button from "../../components/Button";
import Link from "next/dist/client/link";
import useUserStatus from '../../hooks/useUserStatus';

interface Errors {
  download: string
}

// export const getStaticPaths: GetStaticPaths = async () => {
//   return {
//     paths: [],
//     fallback: true
//   }
// }
// export const getStaticProps: GetStaticProps = async (context: GetStaticPropsContext) => {
//   const videoId = context.params?.id
//   const video = await db.collection('videos').doc(videoId as string).get()
//   // const url = await storage.ref().child(video?.data()?.filename).getDownloadURL()
//   return {
//     props: {
//       videoId
//     }
//   }
// }
const ShowVideoPage = () => {
  const router = useRouter()
  const {id} = router.query
  const [user, authLoading, authError] = useAuthState(auth)
  const [errors, setErrors] = useState<Errors>({download: ''});
  const userStatus = useUserStatus(user);
  const [query, setQuery] = useState(db.collection('videos').limit(50))
  const [value, loading, err] = useDocument(
    db.doc('/videos/' + id),
    {}
  )
  const [videos, videosLoading, videosError] = useCollection(
    query, {}
  )

  useEffect(() => {
    if(value) {
      setQuery(db.collection('videos').where('tags', 'array-contains-any', value.data()?.tags))
    }
  }, [value])

  const downloadVideo = async () => {
    if(!user) {
      setErrors({download: 'ログインしてください'})
      return
    } else if(!userStatus || userStatus == 'free') {
      setErrors({download: '決済が完了していません'})
      return
    }

    if(value) {
      const url = `https://firebasestorage.googleapis.com/v0/b/my-react-project-db288.appspot.com/o/${encodeURIComponent(value.data()?.filename)}?alt=media`;

      const data = await fetch(url, {
        mode: 'cors'
      });
      const blob = await data.blob()
      saveAs(blob)
      db.doc('/videos/' + id).update({
        downloadCount: value?.data()?.downloadCount + 1
      })

      db.doc('/users/' + user.uid).update({
        downloadedVideos: firebase.firestore.FieldValue.arrayUnion({'id': id, 'filename': value.data()?.filename})
      })
    }
  }
  
  return(
    <Layout>
      <div className="p-4">
        {loading && <span>Loading</span>}
        {value && 
          <>          
            <div className="grid md:grid-cols-2 gap-4">
              <EmbedVideo filename={value.data()?.filename} control/>
              <div>
                <div>
                  <h1 className="py-4 text-xl font-semibold">{value.data()?.title}</h1>
                  <p>{value.data()?.description}</p>
                  <ul className="flex py-2">
                    {value.data()?.tags.map((tag: string, index: number) => {
                      return <li key={index} className="py-1 px-2 mx-1 rounded-full bg-gray-200">{tag}</li>
                    })}
                  </ul>
                </div>
                <div>
                  <Button id="downloadLink" color="yellow" onClick={() => downloadVideo()}>ダウンロード{Math.round(value.data()?.size / 1000000 * 100) / 100}MB</Button>
                  <span className="pl-4"><GetAppIcon /> {value.data()?.downloadCount}</span>
                </div>
                {errors.download && <span className="block mt-2 text-xs text-red-600">{errors.download}</span>}
                <div className="py-4">
                  <User id={value.data()?.uid} />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">関連動画</h3>
              <div id="videoIndex"  className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {videosLoading && <span>Loading...</span>}
                {videos && !videosLoading &&
                  <>
                  {videos.docs.map((doc, index) => (
                    <div key={doc.id}>
                      <div className="relative">
                        <button className="absolute top-8 right-2 bg-black bg-opacity-80 text-white duration-300 focus:outline-none hover:bg-opacity-100 z-10" onClick={downloadVideo} data-doc={JSON.stringify(doc.data())} data-id={doc.id}>
                          <GetAppIcon />
                        </button>
                        <Link href={`video/${doc.id}`}>
                          <a>
                            {doc.data().title}
                            <EmbedVideo filename={doc.data().filename} onMouseOver={e => (e.target as HTMLVideoElement).play()} onMouseLeave={e => (e.target as HTMLVideoElement).pause()} />
                          </a>
                        </Link>
                        <div className="absolute bottom-0 px-3 bg-black bg-opacity-60 w-full text-right text-white">00:{Math.floor(doc.data().duration)}</div>
                      </div>
                    </div>
                  ))}
                </>
                }
              </div>
            </div>
          </>
        }
      </div>
    </Layout>
  )
}

export default ShowVideoPage