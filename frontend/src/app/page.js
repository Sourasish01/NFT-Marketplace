"use client";

import React from 'react';
import { useAuthStore } from "@/store/useAuthStore";
import useListedNFTs from "@/store/useGraphStoreHooks.js/useListedNFTs"; 
import NFTCard from "@/components/NFTcard";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const { connectedAddress, isLoggingIn } = useAuthStore();
  const { listedNFTs, loading, error, refetch } = useListedNFTs();

  console.log("Connected Address:", connectedAddress);
  console.log("Listed NFTs:", listedNFTs);
  console.log("Error:", error);

  const notConnected = !connectedAddress;
  const isLoading = isLoggingIn || loading;
  const hasError = !!error;
  const isEmpty = !isLoading && !hasError && listedNFTs?.length === 0;
  const hasData = !isLoading && !hasError && listedNFTs?.length > 0;
  const router = useRouter();

  const handleActionSuccess = () => {
    refetch({ requestPolicy: "network-only" });
    router.refresh(); // this refreshes the route, fetching fresh data
  };

  return (
    <div className="flex w-full flex-col overflow-hidden p-4">
      {notConnected && <EmptyState>Connect your wallet</EmptyState>}

      {isLoading && <EmptyState>Loading listed NFTs...</EmptyState>}

      {hasError && (
        <EmptyState>
          Error loading NFTs: {error?.message || "Something went wrong."}
        </EmptyState>
      )}

      {isEmpty && <EmptyState>No NFTs listed on the marketplace.</EmptyState>}

      {hasData && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-white">Explore Marketplace NFTs:</h2>
          <div className="flex flex-wrap gap-4">
            {listedNFTs.map((nft) => (
              <NFTCard
                nft={nft}
                key={nft.tokenId}
                onActionSuccess={handleActionSuccess}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
