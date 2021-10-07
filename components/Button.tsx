import React, { MouseEventHandler } from "react";
import Link from "next/dist/client/link";

interface Prop {
  id?: string,
  color?: string,
  href?: string,
  download?: boolean,
  onClick?: MouseEventHandler,
  children: React.ReactNode,
  className?: string
}

const Button = ({id, color = 'yellow', href = '', download = false, onClick, children, className}: Prop) => {
  const buttonClass: string = (color) ? `py-2 px-4 text-white font-semibold rounded-lg shadow-md duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-75 bg-${color}-500 hover:bg-${color}-400 focus:ring-${color}-400 ${className}` : `py-2 px-4 font-semibold rounded-lg shadow-md duration-300 focus:outline-none hover:bg-gray-200 ${className}`
  return (
    <>
      {href && <Link href={href}><a id={id} className={buttonClass} onClick={onClick} download={download}>{children}</a></Link>}
      {!href && <button id={id} className={buttonClass} onClick={onClick}>{children}</button>}
    </>
  )
}
export default Button