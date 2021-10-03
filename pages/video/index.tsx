import React, {useState, useEffect, useCallback} from "react";
import { useRouter } from "next/dist/client/router";
import Link from "next/dist/client/link";
import { db, auth } from "../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import EmbedVideo from "../../components/EmbedVideo";
import Layout from "../../components/Layout";
import { FormControl, FormLabel, FormControlLabel, RadioGroup, Radio, Chip, InputLabel, Input, TextField, Drawer } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import Button from "../../components/Button"
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import GetAppIcon from '@material-ui/icons/GetApp';
import useUserStatus from '../../hooks/useUserStatus';

interface Tags {
  value: string,
  videoIds: string[]
}

const useMediaQuery = (width: number) => {
  const [targetReached, setTargetReached] = useState(false);
  const updateTarget = useCallback((e) => {
    if(e.matches) {
      setTargetReached(true)
    } else {
      setTargetReached(false)
    }
  }, [])
  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${width}px)`)
    media.addEventListener('change', e => updateTarget(e))
    if(media.matches) {
      setTargetReached(true)
    }

    return () => media.removeEventListener('change', e => updateTarget(e))
  }, [])
  return targetReached
}

const Video = () => {
  const isBreakPoint = useMediaQuery(768)
  const router = useRouter()
  const [user, userLoading, userError] = useAuthState(auth)
  const userStatus = useUserStatus(user);
  const collectionRef = db.collection('videos')
  const [condition, setCondition] = useState('')
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [drawerState, setDrawerState] = useState(false)
  const [query, setQuery] = useState(collectionRef.limit(50))
  const [videos, loading, error] = useCollection(
    query, {}
  )
  let tags: Array<Tags> = []
  const [tagsCollection, tagsCollectionLoading, tagsCollectionError] = useCollection(
    db.collection('tags'), {}
  )

  if(tagsCollection) {
    tagsCollection.docs.map((doc) => {
      tags.push({value: doc.data().value, videoIds: doc.data().videoIds})
    })
  }

  const toggleDrawer = (open: boolean) => {
    setDrawerState(open)
  }

  const onMouseOver = (e: React.MouseEvent<Element>) => {
    (e.target as HTMLVideoElement).play()
  }

  const handleConditionValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCondition(event.target.value)
    if(currentTags.length > 0) {
      if(event.target.value === 'new') {
        setQuery(collectionRef.where('tags', 'array-contains-any', currentTags).orderBy('createdAt', 'desc').limit(50))
      } else if (event.target.value === 'download') {
        setQuery(collectionRef.where('tags', 'array-contains-any', currentTags).orderBy('downloadCount', 'desc').limit(50))
      } else {
        setQuery(collectionRef.where('tags', 'array-contains-any', currentTags).limit(50))
      }
    } else {
      if(event.target.value === 'new') {
        setQuery(collectionRef.orderBy('createdAt', 'desc').limit(50))
      } else if (event.target.value === 'download') {
        setQuery(collectionRef.orderBy('downloadCount', 'desc').limit(50))
      } else {
        setQuery(collectionRef.limit(50))
      }
    }
  }

  const handleTagValues = (event: React.ChangeEvent<{}>, values: string[]) => {
    setCurrentTags(values)
    if(values.length > 0) {
      if(condition === 'new') {
        setQuery(collectionRef.where('tags', 'array-contains-any', values).orderBy('createdAt', 'desc').limit(50))
      } else if (condition === 'download') {
        setQuery(collectionRef.where('tags', 'array-contains-any', values).orderBy('downloadCount', 'desc').limit(50))
      } else {
        setQuery(collectionRef.where('tags', 'array-contains-any', values).limit(50))
      }
    } else {
      if(condition === 'new') {
        setQuery(collectionRef.orderBy('createdAt', 'desc').limit(50))
      } else if (condition === 'download') {
        setQuery(collectionRef.orderBy('downloadCount', 'desc').limit(50))
      } else {
        setQuery(collectionRef.limit(50))
      }
    }
  }

  const downloadVideo = async (e: React.MouseEvent<HTMLElement>) => {

    const docData = JSON.parse((e.currentTarget.dataset.doc as string))
    const id = e.currentTarget.dataset.id

    if(!user) {
      router.push('/signup')
      return
    } else if(!userStatus || userStatus == 'free') {
      router.push('/signup')
      return
    }

    if(docData) {
      const url = `https://firebasestorage.googleapis.com/v0/b/my-react-project-db288.appspot.com/o/${encodeURIComponent(docData.filename)}?alt=media`;

      const data = await fetch(url, {
          mode: 'cors'
        });
      const blob = await data.blob()
      saveAs(blob)
      db.doc('/videos/' + id).update({
        downloadCount: docData.downloadCount + 1
      })
    }
    console.log('downloaded!')
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="">
          <Button onClick={() => toggleDrawer(true)} className="md:hidden">条件<ArrowRightIcon /></Button>
          <Drawer anchor='left' open={(isBreakPoint) ? true : drawerState} onClose={() => toggleDrawer(false)} variant={(isBreakPoint) ? 'persistent' : 'temporary'} classes={{paper: 'p-4 md:top-20 md:h-3/4 w-72 md:w-1/5'}}>
            <Button className="absolute top-2 right-2 z-50 md:hidden" onClick={() => toggleDrawer(false)}><ArrowLeftIcon /></Button>
            <FormControl component="fieldset">
              <FormLabel>条件</FormLabel>
              <RadioGroup aria-label="condition" name="condition" value={condition} onChange={handleConditionValue} >
                <FormControlLabel value="new" control={<Radio />} label="新しい順" />
                <FormControlLabel value="download" control={<Radio />} label="ダウンロード数" />
              </RadioGroup>
            </FormControl>
            <Autocomplete 
                multiple
                options={tags.map((option) => option.value)}
                freeSolo
                onChange={handleTagValues}
                renderTags={(value: string[], getTagProps) => 
                  value.map((option: string, index: number) => (
                    <Chip key={index} variant="outlined" label={option} {...getTagProps({index})} />
                  ))
                }
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    variant="filled" 
                    label="タグ"
                  />
                )}
              />
          </Drawer>
        </div>
        <div className="md:w-4/5 md:pl-4 ml-auto">
          {loading && <p>Loading...</p>}
          {!loading && videos && 
            <>
            <h2 className="p-4 text-xl font-bold">Videos</h2>
            <div id="videoIndex"  className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {error && <strong>Error: {JSON.stringify(error)}</strong>}
              {loading && <span>Loading...</span>}
              {videos && (
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
                            <EmbedVideo filename={doc.data().filename} onMouseOver={e => onMouseOver(e)} onMouseLeave={e => (e.target as HTMLVideoElement).pause()} />
                          </a>
                        </Link>
                        <div className="absolute bottom-0 px-3 bg-black bg-opacity-60 w-full text-right text-white">00:{Math.floor(doc.data().duration)}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            </>
          }
        </div>
      </div>
    </Layout>
  )
}

export default Video