"use client"

import type React from "react"
import { PrivyProvider } from "@privy-io/react-auth"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export function Providers({ children }: { children: React.ReactNode }) {
  // Replace this with your actual App ID from the Privy Dashboard
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""

  const cronosTestnet = {
    id: 338,
    name: 'Cronos Testnet',
    network: 'cronos-testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'TCRO',
      symbol: 'TCRO',
    },
    rpcUrls: {
      default: {
        http: ['https://evm-t3.cronos.org'],
      },
      public: {
        http: ['https://evm-t3.cronos.org'],
      },
    },
    blockExplorers: {
      default: { name: 'Cronoscan', url: 'https://explorer.cronos.org/testnet' },
    },
    testnet: true,
  };

  return (
    <PrivyProvider
      appId={appId}
      config={{
        defaultChain: cronosTestnet,
        supportedChains: [cronosTestnet],
        appearance: {
          theme: "dark",
          accentColor: "#00ffa3",
          logo: "https://auth.privy.io/logos/privy-logo.png",
        },
      }}
    >
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </PrivyProvider>
  )
}