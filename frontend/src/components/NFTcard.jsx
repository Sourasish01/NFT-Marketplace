
"use client"; 

import React, { useEffect, useState } from "react"; 
import classNames from "classnames";

import { formatEther } from "ethers"; // For displaying prices from contract in ETH (e.g., from Wei)
import { useRouter } from "next/navigation"; // Correct import for useRouter in Next.js 13+ App Router
import { toast } from "react-hot-toast"; // Using react-hot-toast now

import { useAuthStore } from "@/store/useAuthStore"; // Your auth store for connectedAddress
import { useNftStore } from "@/store/useNftStore"; // Your NFT marketplace actions store

// Helper to convert IPFS URLs to HTTPS (ensure this path is correct or define it here)
// Assuming ipfsToHTTPS function is either globally available or defined within this file.
// If it's in a separate file, import it:
// import { ipfsToHTTPS } from "../utils/helpers"; // Adjust path as needed
const ipfsToHTTPS = (ipfsUrl) => {
  if (ipfsUrl && ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/"); // Or your preferred gateway
  }
  return ipfsUrl;
};

// Assuming AddressAvatar and SellPopup are correctly imported
import AddressAvatar from "./AddressAvatar";
import SellPopup from "./SellPopup"; // Ensure SellPopup also expects plain JS props

const NFTCard = (props) => {
  const { nft, className, onActionSuccess } = props; // Destructure onActionSuccess
  const { connectedAddress } = useAuthStore(); // Get connected wallet address
  const { listNFT, cancelListing, buyNFT, listingNFT, buyingNFT, cancellingListing } = useNftStore(); // Get actions and their loading states
  const router = useRouter(); // For navigation after actions

  const [meta, setMeta] = useState(null); // Changed initial state to null
  const [loading, setLoading] = useState(false); // Overall loading for button
  const [sellPopupOpen, setSellPopupOpen] = useState(false);

  // Derive global loading state from useNftStore actions
  const isActionLoading = listingNFT || buyingNFT || cancellingListing;


  //---------------------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    const fetchMetadata = async () => {

      if (!nft.tokenURI) { // Check if tokenURI is available
        setMeta({
          name: `NFT #${nft.tokenId}`,
          description: "No metadata URI available.",
          imageURL: "/placeholder.png", // Fallback placeholder
        });
        setLoading(false); // Stop overall loading indicator for initial render
        return;
      }

      try {
        const metadataResponse = await fetch(ipfsToHTTPS(nft.tokenURI));
        if (metadataResponse.status !== 200) {
          console.error(`Failed to fetch metadata for ${nft.tokenId}: ${metadataResponse.statusText}`);
          setMeta({
            name: `NFT #${nft.tokenId} (Metadata Error)`,
            description: "Could not load description.",
            imageURL: "/error-placeholder.png", // Fallback error image
          });
          return;
        }
        const json = await metadataResponse.json();
        setMeta({
          name: json.name || `NFT #${nft.tokenId}`, // Fallback if name is missing
          description: json.description || "No description available.", // Fallback if description is missing
          imageURL: ipfsToHTTPS(json.image) || "/placeholder.png", // Fallback if image is missing
        });
      } catch (e) {
        console.error(`Error fetching metadata for NFT ${nft.tokenId}:`, e);
        setMeta({
          name: `NFT #${nft.tokenId} (Error)`,
          description: "Error loading metadata.",
          imageURL: "/error-placeholder.png", // Fallback for network errors
        });
      } finally {
        // This setLoading(false) here is for the initial metadata loading
        // The button's 'loading' state is controlled by isActionLoading
        setLoading(false); // Initial loading for the card itself
      }
    };

    setLoading(true); // Start loading when component mounts or nft.tokenURI changes
    void fetchMetadata();
  }, [nft.tokenURI, nft.tokenId]); // Dependency on nft.tokenId for metadata refresh

  //---------------------------------------------------------------------------------------------------------------------------------

  // Helper for consistent error toasts
  const showErrorToast = (message = "Something went wrong!") => toast.error(message);

 //---------------------------------------------------------------------------------------------------------------------------------

  // Determine if the NFT is currently listed for sale (from subgraph)
  const forSale = nft.isListed;
  // Determine if the connected wallet owns this NFT
  // nft.to is the current owner from your subgraph `nfttransfers`
  const owned = connectedAddress && (
    (!forSale && nft.to.toLowerCase() === connectedAddress.toLowerCase()) || // If NOT for sale, check if current holder is connected user
    (forSale && nft.from.toLowerCase() === connectedAddress.toLowerCase())   // If FOR sale, check if original lister is connected user
  );

  const onButtonClick = async () => {
    // Prevent multiple clicks while an action is ongoing
    if (isActionLoading) return;

    // Use `nft.tokenId` which is the `tokenId` in your system
    const tokenId = nft.tokenId;

    if (owned) {
      if (forSale) {
        // NFT is owned and listed, so cancel listing
        await onCancelClicked(tokenId);
      } else {
        // NFT is owned but not listed, so open sell popup
        setSellPopupOpen(true);
      }
    } else {
      if (forSale) {
        // NFT is not owned but is listed, so buy it
        await onBuyClicked(tokenId, nft.price); // Pass current price (from subgraph, in Wei string)
      } else {
        // This case should ideally not happen if logic is correct
        console.warn("onButtonClick called for unowned, unlisted NFT. This might indicate a logic error or subgraph delay.");
        showErrorToast("NFT is not available for purchase or relisting.");
      }
    }
  };

  //---------------------------------------------------------------------------------------------------------------------------------

  const onBuyClicked = async (tokenId, price) => {
    // setLoading(true); // Removed as useNftStore handles specific loading states
    try {
      await buyNFT(tokenId, price); // Price should be in Wei string as passed from subgraph
      // router.push("/owned"); // Removed, let parent (OwnedPage) handle full page refresh if needed
      toast.success("✅ NFT purchased! Your collection will be updated shortly.");
      if (onActionSuccess) onActionSuccess(); // Trigger parent refetch
    } catch (e) {
      showErrorToast("❌ NFT purchase failed. See console for details.");
      console.error("Error buying NFT:", e);
    }
    // setLoading(false);
  };

  //---------------------------------------------------------------------------------------------------------------------------------

  const onCancelClicked = async (tokenId) => {
    // setLoading(true);
    try {
      await cancelListing(tokenId);
      toast.success("✅ Listing canceled! Your collection will be updated shortly.");
      if (onActionSuccess) onActionSuccess(); // Trigger parent refetch
    } catch (e) {
      showErrorToast("❌ Failed to cancel listing. See console for details.");
      console.error("Error canceling listing:", e);
    }
    // setLoading(false);
  };

    //---------------------------------------------------------------------------------------------------------------------------------

  const onSellConfirmed = async (priceEth) => { // priceEth will be a BigNumber from SellPopup
    setSellPopupOpen(false);
    // setLoading(true);
    try {
      // useNftStore.listNFT expects price to be an ethers.BigNumber or string like "0.05"
      // SellPopup likely returns a BigNumber from ethers.
      await listNFT(nft.tokenId, priceEth); // nft.tokenId is your tokenId
      toast.success("✅ NFT listed for sale! Changes will be reflected shortly.");
      if (onActionSuccess) onActionSuccess(); // Trigger parent refetch
    } catch (e) {
      showErrorToast("❌ Failed to list NFT for sale. See console for details.");
      console.error("Error listing NFT:", e);
    }
    // setLoading(false);
  };

    //---------------------------------------------------------------------------------------------------------------------------------

  return (
    <div
      className={classNames(
        "flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-xl border font-semibold shadow-sm bg-gray-900 text-white", // Added dark background for card
        className
      )}
    >
      {/* Conditionally render image or loading state */}
      {meta ? (
        <img
          src={meta.imageURL}
          alt={meta.name}
          className="h-80 w-full object-cover object-center"
        />
      ) : (
        <div className="flex h-80 w-full items-center justify-center bg-gray-700">
          Loading Metadata...
        </div>
      )}

      <div className="flex flex-col p-4">
        <p className="text-lg">{meta?.name ?? `NFT #${nft.tokenId}`}</p>
        <span className="text-sm font-normal text-gray-300">
          {meta?.description ?? "No description available."}
        </span>
        {/* Display current owner using nft.to */}
        <AddressAvatar address={nft.to} className="mt-2 text-sm text-gray-400" />

        {forSale && nft.price && nft.price !== "0" && (
          // Display price, assuming nft.price is a Wei string and needs formatting
          <p className="text-xl font-bold mt-2">Price: {formatEther(nft.price)} ETH</p>
        )}
        {!forSale && (
          <p className="text-md mt-2 text-gray-400">Not listed for sale</p>
        )}
      </div>

      {/* Action Button */}
      <button
        className="group flex h-16 items-center justify-center bg-blue-600 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        onClick={onButtonClick}
        disabled={isActionLoading || loading} // Disable if any action is ongoing or initial metadata is loading
      >
        {isActionLoading || loading ? "Processing..." : ( // Show processing for any active action
          <>
            {!forSale && owned && "SELL"} {/* Owned but not for sale -> Sell */}
            {forSale && owned && ( // Owned and for sale -> Show price, hover to cancel
              <>
                <span className="group-hover:hidden">{formatEther(nft.price)} ETH</span>
                <span className="hidden group-hover:inline">CANCEL LISTING</span>
              </>
            )}
            {forSale && !owned && ( // Not owned but for sale -> Show price, hover to buy
              <>
                <span className="group-hover:hidden">{formatEther(nft.price)} ETH</span>
                <span className="hidden group-hover:inline">BUY NOW</span>
              </>
            )}
            {/* If neither forSale nor owned (e.g., owned by someone else and not listed),
                or if connectedAddress is null, the button might not show meaningful text.
                Consider adding a default or hiding the button in such cases.
                For now, the disabled state handles it. */}
          </>
        )}
      </button>

      {/* Sell Popup */}
      <SellPopup
        open={sellPopupOpen}
        onClose={() => setSellPopupOpen(false)}
        onSubmit={onSellConfirmed}
      />
    </div>
  );
};

export default NFTCard;