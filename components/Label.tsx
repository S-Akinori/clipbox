import React from "react";

interface Prop {
  id: string,
  children: React.ReactNode
}

const Label = ({id, children}: Prop) => {
  return(
    <label htmlFor={id}>{children}</label>
  )
}

export default Label;