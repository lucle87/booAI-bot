// pages/_app.js
import '../styles/globals.css'
import Head from 'next/head'
import { PrivyProvider } from '@privy-io/react-auth'

export default function App({ Component, pageProps }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmq0yf8yi003n0cl82yux6e3y'

  return (
    <>
      <Head>
        <title>booAI_bot — AI Agent on ARC Testnet</title>
        <meta name="description" content="Deploy contracts, generate media, mint NFTs — all in one AI chat." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['email'],
          appearance: {
            theme: 'dark',
            accentColor: '#8b6fff',
            logo: '/logo.png',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          defaultChain: {
            id: 5042002,
            name: 'ARC Testnet',
            network: 'arc-testnet',
            nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
            rpcUrls: {
              default: { http: ['https://rpc.testnet.arc.network'] },
              public: { http: ['https://rpc.testnet.arc.network'] },
            },
            blockExplorers: {
              default: { name: 'ARC Explorer', url: 'https://testnet.arcscan.app' },
            },
          },
          supportedChains: [{
            id: 5042002,
            name: 'ARC Testnet',
            network: 'arc-testnet',
            nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
            rpcUrls: {
              default: { http: ['https://rpc.testnet.arc.network'] },
              public: { http: ['https://rpc.testnet.arc.network'] },
            },
            blockExplorers: {
              default: { name: 'ARC Explorer', url: 'https://testnet.arcscan.app' },
            },
          }],
        }}
      >
        <Component {...pageProps} />
      </PrivyProvider>
    </>
  )
}