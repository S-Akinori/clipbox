import React, {useState, useEffect} from "react";
import Image from "next/dist/client/image";
import { useForm } from "react-hook-form";
import { auth, db, storage} from "../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/dist/client/router";
import {Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Input} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import Layout from "../../components/Layout";
import Button from "../../components/Button"
import User from "../../components/User"
import usePersonalStatus from '../../stripe/usePersonalStatus';

interface Messages {
  profile: string,
  email: string,
  password: string
}

const ShowUserPage = () => {
  const router = useRouter()
  const { register, handleSubmit, setError, watch, formState: { errors }} = useForm();
  const [user, loading, error] = useAuthState(auth)
  const userIsPersonal = usePersonalStatus(user);
  const [isAdmin, setIsAdmin] = useState(false)

  if(user) {
    user.getIdTokenResult().then((idTokenResult) => {
      console.log('idTokenResult: ', idTokenResult.claims)
      if(idTokenResult.claims.role === 'admin') {
        setIsAdmin(true)
      }
    })
  }

  const messages: Messages = {
    profile: '',
    email: '',
    password: ''
  }

  if(!loading && !user) {
    router.push('/login');
  }

  const logout = () => {
    auth.signOut().then(() => {
      router.push('/')
    }).catch((error) => {
      alert('エラーが発生しました。')
    })
  }

  const toggleButton = (buttonEl: HTMLButtonElement, text: string = '', disbaled: boolean | null = null) => {
    if(disbaled !== null && text) {
      buttonEl.disabled = disbaled;
      buttonEl.textContent = text
    } else if(!buttonEl.disabled) {
      buttonEl.disabled = true;
      buttonEl.textContent = text ? text : '保存中'
    } else {
      buttonEl.disabled = false
      buttonEl.textContent = text ? text : '保存'
    }
  }

  const saveProfile = (data: any) => {
    const buttonEl = document.getElementById('saveProfileButton') as HTMLButtonElement
    
    toggleButton(buttonEl)
    if(data.avatar.lenth > 0) {
      const storageRef = storage.ref(`users/${user?.uid}`)
      const fileRef = storageRef.child(data.avatar[0].name)
      fileRef.put(data.avatar[0]).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((url) => {
          db.collection('users')
            .doc(user?.uid)
            .update({
              diplayName: data.username,
              photoURL: url
            })

          user?.updateProfile({
            displayName: data.username,
            photoURL: url
          }).then(() => {
            buttonEl.textContent = '保存しました'
            window.setTimeout((buttonEl: HTMLButtonElement) => toggleButton(buttonEl), 3000)
          }).catch((error) => {
            console.log(error.message)
            toggleButton(buttonEl)
          })
        }).catch((error) => {
          console.log(error.message)
          toggleButton(buttonEl)
        })
      }).catch((error) => {
        console.log(error.message)
        toggleButton(buttonEl)
      })
    } else {
      db.collection('users')
      .doc(user?.uid)
      .update({
        diplayName: data.username
      })

      user?.updateProfile({
        displayName: data.username,
      }).then(() => {
        buttonEl.textContent = '保存しました'
        window.setTimeout(()=> toggleButton(buttonEl), 3000)
      }).catch((error) => {
        console.log(error.message)
        toggleButton(buttonEl)
      })
    }
  }

  const saveEmail = () => {
    console.log('email saved')
  }

  const savePassword = () => {
    console.log('password saved')
  }

  const setPreviewAvatar = (e: React.ChangeEvent) => {
    const image: File = ((e.target as HTMLInputElement).files as FileList)[0]
    if(image.type === 'image/png' || image.type === 'image/jpg' || image.type === 'image/jpeg'|| image.type === 'image/gif') {
      const fileReader = new FileReader()
      fileReader.onload = (function() {
        const imgEl = document.querySelector<HTMLImageElement>('#preview')
        if(imgEl) {
          imgEl.src = fileReader.result as string
        }
      })
      fileReader.readAsDataURL(image)
    } else {
      setError('avatar', {
        type: "manual",
        message: '画像ファイルを選択してください'
      })
    }
  }

  return(
    <Layout>
      <div className="p-4">
        {user && 
          <div className="max-w-xl">
            <div className="py-4 flex items-center">
              <img className="rounded-full w-16 h-16 object-cover mr-4" loading="lazy" src={user?.photoURL as string} alt={user?.displayName as string} width="60" height="60" />
              <span>{user?.displayName}</span>
            </div>
            {!userIsPersonal && 
              <div>
                決済が完了していません。
                <Button href="/pricing">プランを決める</Button>
              </div>
            }
            {userIsPersonal && 
              <div className="my-4">
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="profile--setting"
                    id="profileSetting"
                  >
                    <Typography>プロフィール</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="block">
                    <form onSubmit={handleSubmit(saveProfile)}>
                      <div className="py-3">id: {user.uid}</div>
                      <div className="flex py-3">
                        <span>ユーザー名 : </span>
                        <div>
                          <TextField {...register('username', {required: '入力してください'})} defaultValue={user?.displayName} />
                          {errors.username && <span className="block mt-2 text-xs text-red-600">{errors.username.message}</span>}
                        </div>
                      </div>
                      <div className="flex items-center py-3">
                        <img id="preview" src={user.photoURL!} width="60" height="60" className="rounded-full w-20 h-20 object-cover" />
                        <div className="ml-3">
                          <Input
                            type="file" 
                            {...register('avatar', {
                              validate: {
                                size: value => value !== null || value[0].size < 2000000 || '容量が大きすぎます',
                                type: value => value !== null || value[0].type === 'image/png' || value[0].type === 'image/jpg' || value[0].type === 'image/jpeg'|| value[0].type === 'image/gif' || '画像ファイルを選択してください',
                              }
                            })}
                            onChange={(e) => setPreviewAvatar(e)}
                            />
                            {errors.avatar && <span className="block mt-2 text-xs text-red-600">{errors.avatar.message}</span>}
                        </div>
                      </div>
                    <Button id="saveProfileButton" color="yellow" className="mt-3">保存</Button>
                    <span className="block mt-2 text-xs text-red-600"></span>
                    </form>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="email--setting"
                    id="emailSetting"
                  >
                    <Typography>メールアドレス</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="block">
                    <form onSubmit={handleSubmit(saveEmail)}>
                    <div>
                        <div className="py-3">現在のメールアドレス : <TextField type="email" {...register('current_email')} defaultValue={user?.email} fullWidth /></div>
                        <div className="py-3">新しいメールアドレス : <TextField type="email" {...register('new_email')} fullWidth /></div>
                      </div>
                      <Button id="saveEmail" color="yellow" className="mt-3">保存</Button>
                    </form>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="password--setting"
                    id="passwordSetting"
                  >
                    <Typography>パスワード</Typography>
                  </AccordionSummary>
                  <AccordionDetails className="block">
                    <form onSubmit={handleSubmit(savePassword)}>
                      <div>
                        <div className="py-3">現在のパスワード : <TextField type="password" {...register('current_password')} /></div>
                        <div className="py-3">新しいパスワード : <TextField type="password" {...register('new_password')} /></div>
                      </div>
                      <Button id="savePassword" color="yellow" className="mt-3">保存</Button>
                    </form>
                  </AccordionDetails>
                </Accordion>
              </div>
            }
            <Button color="red" onClick={() => logout()}>ログアウト</Button>
          </div>
        }
      </div>
    </Layout>
  )
}

export default ShowUserPage