"use client"
import React, { use } from 'react'
import { useAuthStore } from "@/store/useAuthStore";

const page = () => {
  const { authUser, isLoggingIn } = useAuthStore();
  
    return (
      <div className="flex w-full flex-col overflow-hidden">
        <div className="flex min-h-screen w-full items-center justify-center text-lg text-white">
          {isLoggingIn ? (
            "Loading..."
          ) : !authUser ? (
            "Connect your Wallet"
          ) : (
            "Nothing to show"
          )}
        </div>
      </div>
    );
}

export default page
