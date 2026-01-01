"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useEffect, useState } from "react"

export function ConnectWalletButton() {
  const { login, authenticated, user, logout } = usePrivy()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="bg-[#63f2d2] text-black px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
        Connect Wallet
      </button>
    )
  }

  const wallet = user?.wallet
  const address = wallet?.address

  if (authenticated && address) {
    return (
      <button
        onClick={logout}
        className="bg-[#63f2d2] text-black px-3 md:px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        title={address}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span className="hidden md:inline">
          {`${address.slice(0, 4)}...${address.slice(-4)}`}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={login}
      className="bg-[#63f2d2] text-black px-3 md:px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <span className="hidden md:inline">
        Connect Wallet
      </span>
    </button>
  )
}