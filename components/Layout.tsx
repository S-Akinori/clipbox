import React from "react";
import Head from "next/dist/shared/lib/head";
// import Image from 'next/image'
import styles from '../styles/Layout.module.css'
import Header from "./Header";

interface Props {
  children: React.ReactNode;
}

const Layout = ({children}: Props) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>        
        <span>
          Clipbox
        </span>        
      </footer>
    </div>
  )
}

export default Layout