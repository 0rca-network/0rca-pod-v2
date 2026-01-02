"use client"

import type React from "react"
import { PrivyProvider } from "@privy-io/react-auth"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export function Providers({ children }: { children: React.ReactNode }) {
  // Replace this with your actual App ID from the Privy Dashboard
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
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