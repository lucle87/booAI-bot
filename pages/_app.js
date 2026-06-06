// pages/_app.js
import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>booAI_bot — AI Agent on ARC Testnet</title>
        <meta name="description" content="Deploy contracts, generate media, mint NFTs — all in one AI chat." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}