import React, {useEffect, useState} from "react";
import { useRouter } from "next/dist/client/router";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { db, storage, auth, functions } from "../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDownloadURL } from "react-firebase-hooks/storage";
import { saveAs } from "file-saver";
import GetAppIcon from '@material-ui/icons/GetApp';
import EmbedVideo from "../../components/EmbedVideo";
import Layout from "../../components/Layout";
import User from "../../components/User";
import Button from "../../components/Button";
import Link from "next/dist/client/link";
import { GetStaticPaths, GetServerSideProps, GetStaticProps, GetStaticPropsContext } from "next";

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

  const downloadVideo = () => {
    if(!user) {
      setErrors({download: 'ログインしてください'})
      return
    }

    // const downloadVideo = functions.httpsCallable('downloadVideo')
    // if(value) {
    //   downloadVideo({filename: value.data()?.filename})
    //   .then(response => {
    //     console.log(response)
    //     console.log(response.data)
    //     // const blob = response.data.blob()
    //     // saveAs(blob)
    //   })
    // }
    // if(value) {
    //   downloadVideo({filename: value.data()?.filename})
    //   .then(response => {
    //     console.log(response)
    //     console.log(response.data)
    //     saveAs(response.data)
    //   }).catch((error) => {
    //     console.log(error.code);
    //     console.log( error.message);
    //     console.log( error.details);
    //   });
    // }
    storage.ref().child(value?.data()?.filename).getDownloadURL()
    .then( async (url) => {
      console.log(url)
      const data = await fetch(url, {
        mode: 'cors'
      });
      const blob = await data.blob()
      saveAs(url);
      db.doc('/videos/' + id).update({
        downloadCount: value?.data()?.downloadCount + 1
      })
    })
    .catch((error) => {
      console.log('Error: ', error);
    })
  }
  
  return(
    <Layout>
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
                    <Link href={`video/${doc.id}`}><a>
                      {doc.data().title}
                      <EmbedVideo filename={doc.data().filename} onMouseOver={e => (e.target as HTMLVideoElement).play()} onMouseLeave={e => (e.target as HTMLVideoElement).pause()} />
                      </a></Link>
                  </div>
                ))}
              </>
              }
            </div>
          </div>
        </>
      }
    </Layout>
  )
}

export default ShowVideoPage