"use client"

import { useState } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import ConnectWalletModal from "./ConnectWalletModal"
import { createPortal } from "react-dom"

export function ConnectWalletButton() {
  const { activeAccount, wallets } = useWallet()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      <button 
        onClick={openModal} 
        className="bg-[#63f2d2] text-black px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        {activeAccount ? `${activeAccount.address.slice(0, 4)}...${activeAccount.address.slice(-4)}` : "Connect Wallet"}
      </button>

      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <ConnectWalletModal wallets={wallets} isOpen={isModalOpen} onClose={closeModal} />,
        document.body
      )}
    </>
  )
}