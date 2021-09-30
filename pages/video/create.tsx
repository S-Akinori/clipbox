import { useRouter } from "next/dist/client/router";
import React, {ReactElement, useEffect, useState} from "react";
import Layout from "../../components/Layout";
import { useAuthState } from 'react-firebase-hooks/auth'
import { storage, db, auth } from "../../firebase/clientApp";
import { SubmitHandler, useForm } from "react-hook-form";
import { Input, TextField, InputLabel, Chip } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { useCollection } from "react-firebase-hooks/firestore";

interface FormValue {
  title: string,
  description: string,
  video: FileList,
  tags?: string
}

interface Tags {
  value: string,
  videoIds: string[]
}

const CreateVideoPage = () => {

  let tags: Array<Tags> = []
  const [tagsCollection, tagsCollectionLoading, tagsCollectionError] = useCollection(
    db.collection('tags'), {}
  )

  if(tagsCollection) {
    tagsCollection.docs.map((doc) => {
      tags.push({value: doc.data().value, videoIds: doc.data().videoIds})
    })
  }

  const router = useRouter();
  const [user, loading, error] = useAuthState(auth)
  const [tagValues, setTagValues] = useState('')
  const {register, handleSubmit, setError, clearErrors, formState: {errors}} = useForm<FormValue>();

  if(!loading && !user) {
    router.push('/login');
  }

  const onSubmit: SubmitHandler<FormValue> = (data) => {
    data.tags = tagValues
    const tags:string[] = data.tags.split(',')
    
    if(tags.length > 3) {
      setError('tags', {
        type: 'manual',
        message: '最大で3つです'
      })
      return
    }
    const storageRef = storage.ref('videos');
    const fileRef = storageRef.child(data.video[0].name)
    const metadata: any = {
      customMetadata: {
        'uid': user?.uid,
        'title': data.title,
        'description': data.description,
        'tags': tagValues
      }
    }
    fileRef.put(data.video[0], metadata).then((res) => {
      console.log('uploaded: ', res)
      db.collection('videos')
        .add({
          uid: user?.uid,
          filename: res.metadata.fullPath,
          title: res.metadata.customMetadata?.title,
          description: res.metadata.customMetadata?.description,
          createdAt: res.metadata.timeCreated,
          size: res.metadata.size,
          downloadCount: 0,
          tags: tags
        })

      router.push('/video')
    })
  }

  const onChange = (event: React.ChangeEvent<{}>, value: string[]) => {
    if(value.length > 3) {
      setError('tags', {
        type: 'manual',
        message: '最大で3つです'
      })
    } else {
      clearErrors("tags")
    }
    setTagValues(value.join(','))
  }

  return (
    <Layout>
      <div className="p-4 mx-auto max-w-screen-sm">
        {loading && <p>Loading...</p>}
        {user && !loading && 
          <>
            <h1 className="text-2xl font-bold py-4">動画アップロード</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="py-4">
                <TextField {...register('title', {required: '必須項目です'})} label="タイトル" fullWidth />
                {errors.title && <span className="block mt-2 text-xs text-red-600">{errors.title.message}</span>}
              </div>
              <div className="py-4">
                <TextField {...register('description', {required: '必須項目です'})} label="説明" multiline fullWidth />
                {errors.description && <span className="block mt-2 text-xs text-red-600">{errors.description.message}</span>}
              </div>
              <div className="py-4">
                <Input type="file" {...register('video', {
                  required: '必須項目です',
                  validate: {
                    size: value => value[0].size < 100000000 || '容量が大きすぎます',
                    type: value => value[0].type === 'video/mp4' || 'mp4ファイルを選択してください',
                  }
                })} />
                {errors.video && <span className="block mt-2 text-xs text-red-600">{errors.video.message}</span>}
              </div>
              <div className="py-4">
                <Autocomplete 
                  multiple
                  options={tags.map((option) => option.value)}
                  freeSolo
                  onChange={onChange}
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
                      value={tagValues}
                      {...register('tags')}
                    />
                  )}
                />
                {errors.tags && <span className="block mt-2 text-xs text-red-600">{errors.tags.message}</span>}
              </div>
              
              <button className="inline-block py-2 px-4 bg-indigo-500 text-white font-semibold rounded-lg shadow-md duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75">Submit</button>
            </form>
          </>
        }
      </div>
    </Layout>
  )
}

export default CreateVideoPage;