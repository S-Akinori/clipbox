import React, { MouseEventHandler } from "react";
import { storage } from "../firebase/clientApp";
import { useDownloadURL } from "react-firebase-hooks/storage"

interface Prop {
  filename: string
  control?: boolean
  onMouseOver?: MouseEventHandler
  onMouseLeave?: MouseEventHandler
}

const EmbedVideo = ({filename, control = false, onMouseOver, onMouseLeave}:Prop) => {
  const [value, loading, error] = useDownloadURL(
    storage.ref(filename)    
  )

  return (
    <div className="mb-4">
      {value && <video src={value} controls={control} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} onContextMenu={(e) => {e.preventDefault(); return false}}></video>}
    </div>
  )
}

export default EmbedVideo