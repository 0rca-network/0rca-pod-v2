"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import ConnectWalletModal from "./ConnectWalletModal"
import { createPortal } from "react-dom"

export function ConnectWalletButton() {
  const { activeAccount, wallets } = useWallet()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  if (!mounted) {
    return (
      <button className="bg-[#63f2d2] text-black px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
        Connect Wallet
      </button>
    )
  }

  return (
    <>
      <button 
        onClick={openModal} 
        className="bg-[#63f2d2] text-black px-3 md:px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        title={activeAccount ? activeAccount.address : "Connect Wallet"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span className="hidden md:inline">
          {activeAccount ? `${activeAccount.address.slice(0, 4)}...${activeAccount.address.slice(-4)}` : "Connect Wallet"}
        </span>
      </button>

      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <ConnectWalletModal wallets={wallets} isOpen={isModalOpen} onClose={closeModal} />,
        document.body
      )}
    </>
  )
}