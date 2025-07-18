"use client"

import React, { use } from 'react'
import { useAuthStore } from "@/store/useAuthStore";
import useOwnedNFTs from '@/store/useGraphStoreHooks.js/useOwnedNFTs'; 
import useOwnedListedNFTs from '@/store/useGraphStoreHooks.js/useOwnedListedNFTs'; 
//import { formatEther } from "ethers"; // For formatting prices if your `price` from subgraph is in Wei
import NFTCard from '@/components/NFTcard';
import EmptyState from '@/components/EmptyState'; // Assuming you have an EmptyState component for displaying empty states

const Page = () => { 
  const {/* authUser,*/ isLoggingIn, connectedAddress } = useAuthStore();
  const { ownedNFTs, loading: loadingOwned, error: errorOwned, refetch: refetchOwnedNFTs } = useOwnedNFTs();
  const { ownedListedNFTs, loading: loadingListed, error: errorListed, refetch: refetchOwnedListedNFTs } = useOwnedListedNFTs();

  console.log("connectedAddress:", connectedAddress);
  console.log("errorOwned:", errorOwned);
  console.log("ownedNFTs:", ownedNFTs);
  console.log("errorListed:", errorListed);
  console.log("ownedListedNFTs:", ownedListedNFTs);

  // --- END CONSOLE LOGS ---

  // Combined refetch handler to pass to NFTCard
  const handleActionSuccess = () => {
    // Force re-fetch from network to get the latest state
    refetchOwnedNFTs({ requestPolicy: 'network-only' });
    refetchOwnedListedNFTs({ requestPolicy: 'network-only' });
  };

  // Determine UI states
  const notConnected = !connectedAddress;
  const isLoading = isLoggingIn || loadingOwned || loadingListed;
  const hasError = errorOwned || errorListed;

  const isEmpty =
    !isLoading &&
    !hasError &&
    !!connectedAddress &&
    ownedNFTs.length === 0 &&
    ownedListedNFTs.length === 0;

  const hasContent =
    !isLoading &&
    !hasError &&
    !!connectedAddress &&
    (ownedNFTs.length > 0 || ownedListedNFTs.length > 0);

  return (
    <div className="flex w-full flex-col overflow-hidden p-4">
      {notConnected && <EmptyState>Connect your Wallet</EmptyState>}

      {isLoading && <EmptyState>Loading your NFTs...</EmptyState>}

      {hasError && (
        <EmptyState>
          Error loading NFTs: {errorOwned?.message || errorListed?.message || "An unknown error occurred."}
        </EmptyState>
      )}

      {isEmpty && <EmptyState>You don't own any NFTs yet.</EmptyState>}

      {hasContent && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-white">Your Owned NFTs : </h2>
          <div className="flex flex-wrap gap-4">
            {ownedNFTs?.map((nft) => (
              // Pass the onActionSuccess prop here!
              <NFTCard nft={nft} key={nft.tokenId} onActionSuccess={handleActionSuccess} />
            ))}
          </div>

          {ownedListedNFTs && ownedListedNFTs.length > 0 && (
            <>
              <div className="relative my-8 h-[1px] w-full flex-shrink-0 bg-gray-600">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-gray-900 px-4 font-mono  text-white">
                  LISTED BY YOU
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">Your Listed NFTs : </h2>
              <div className="flex flex-wrap gap-4">
                {ownedListedNFTs?.map((nft) => (
                  // Pass the onActionSuccess prop here!
                  <NFTCard nft={nft} key={nft.tokenId} onActionSuccess={handleActionSuccess} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Page;
