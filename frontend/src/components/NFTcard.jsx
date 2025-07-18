
"use client"; 

import React, { useEffect, useState } from "react"; 
import classNames from "classnames";

import { formatEther } from "ethers"; // For displaying prices from contract in ETH (e.g., from Wei)
import { useRouter } from "next/navigation"; // Correct import for useRouter in Next.js 13+ App Router
import { toast } from "react-hot-toast"; // Using react-hot-toast now

import { useAuthStore } from "@/store/useAuthStore"; // Your auth store for connectedAddress
import { useNftStore } from "@/store/useNftStore"; // Your NFT marketplace actions store

import { contractAddress as marketplaceContractAddress } from "@/config/connectionKeys"; // Import marketplace address

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

  // --- LOGIC FOR OWNERSHIP AND LISTING STATUS ---
  // `nft` now comes from the `nfts` query and has `currentOwner`, `isListed`, `listedBy`
  const isCurrentlyListed = nft.isListed;

  // Determine if the connected user is the current owner of the NFT (if not listed)
  // Or if they are the lister (if it is listed on the marketplace)
  const isConnectedUserOwner = connectedAddress && (
    (!isCurrentlyListed && nft.currentOwner?.toLowerCase() === connectedAddress.toLowerCase()) || // Owned by user directly
    (isCurrentlyListed && nft.listedBy?.toLowerCase() === connectedAddress.toLowerCase()) // Listed by user (currently in marketplace's ownership)
  );

  // Determine if the NFT is listed and NOT owned by the connected user (i.e., someone else's listing)

  /*
  const isAvailableToBuy = isCurrentlyListed &&
                          nft.currentOwner?.toLowerCase() === marketplaceContractAddress.toLowerCase() &&
                          nft.listedBy?.toLowerCase() !== connectedAddress.toLowerCase();


When connectedAddress is null or undefined, calling .toLowerCase() throws the error.

(connectedAddress?.toLowerCase() ?? "") safely handles null cases by defaulting to an empty string, preventing runtime errors. 

  */


  const isAvailableToBuy = isCurrentlyListed &&
                            nft.currentOwner?.toLowerCase() === marketplaceContractAddress.toLowerCase() &&
                            nft.listedBy?.toLowerCase() !== (connectedAddress?.toLowerCase() ?? ""); //corrected


  // Determine if the connected user can cancel a listing
  const canCancelListing = connectedAddress &&
                           isCurrentlyListed &&
                           nft.listedBy?.toLowerCase() === connectedAddress.toLowerCase();

  // Determine if the connected user can list this NFT (i.e., they own it and it's not listed)
  const canList = connectedAddress &&
                  !isCurrentlyListed &&
                  nft.currentOwner?.toLowerCase() === connectedAddress.toLowerCase();

  //---------------------------------------------------------------------------------------------------------------------------------

  const onButtonClick = async () => {
    // Prevent multiple clicks while an action is ongoing
    if (isActionLoading) return;

    // Use `nft.tokenId` which is the `tokenId` in your system
    const tokenId = nft.tokenId;

    // --- FIX: Use the new specific flags instead of `owned` and `forSale` ---
    if (canList) {
      // NFT is owned by connected user and not listed, so open sell popup
      setSellPopupOpen(true);
    } else if (canCancelListing) {
      // NFT is owned by connected user AND listed, so cancel listing
      await onCancelClicked(tokenId);
    } else if (isAvailableToBuy) {
      // NFT is NOT owned by connected user but IS listed and available, so buy it
      await onBuyClicked(tokenId, nft.price); // Pass current price (from subgraph, in Wei string)
    } else {
      // This case means the NFT is either unowned and unlisted, or some other unexpected state
      // You might want to navigate to a detail page, or just disable the button.
      console.warn("onButtonClick: No valid action for this NFT in its current state and connected user status.");
      showErrorToast("This NFT is not currently available for your actions.");
      // If you want to navigate to a detail page for unowned, unlisted NFTs:
      // router.push(`/nft/${tokenId}`); // Uncomment if you have an NFT detail page
    }
  };

  //---------------------------------------------------------------------------------------------------------------------------------

  const onBuyClicked = async (tokenId, price) => {
    // setLoading(true); // Removed as useNftStore handles specific loading states
    try {
      await buyNFT(tokenId, price); // Price should be in Wei string as passed from subgraph
      // router.push("/owned"); // Removed, let parent (OwnedPage) handle full page refresh if needed
      toast.success("✅ NFT purchased!");
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
      toast.success("✅ Listing canceled!");
      if (onActionSuccess) onActionSuccess(); // Trigger parent refetch
    } catch (e) {
      showErrorToast("❌ Failed to cancel listing. See console for details.");
      console.error("Error canceling listing:", e);
    }
    // setLoading(false);
  };

    //---------------------------------------------------------------------------------------------------------------------------------

  const onSellConfirmed = async (priceEth) => { // priceEth will be a BigNumber from SellPopup ie wei value
    setSellPopupOpen(false);
    // setLoading(true);
    try {
      // useNftStore.listNFT expects price to be an ethers.BigNumber or string like "0.05"
      // SellPopup likely returns a BigNumber wei value ... from ethers input in SellPopup.jsx
      await listNFT(nft.tokenId, priceEth); // nft.tokenId is your tokenId
      toast.success("✅ NFT listed for sale!");
      if (onActionSuccess) onActionSuccess(); // Trigger parent refetch
    } catch (e) {
      showErrorToast("❌ Failed to list NFT for sale. See console for details.");
      console.error("Error listing NFT:", e);
    }
    // setLoading(false);
  };

    //---------------------------------------------------------------------------------------------------------------------------------
  const formatToEth = (wei) => (Number(wei) / 10 ** 18).toFixed(4); // Convert wei to ETH 

  return (
    <div
      className={classNames(
        "sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer overflow-hidden border font-semibold shadow-sm text-white",
        className
      )}
    >
      {meta ? (
        <img
          src={meta.imageURL}
          alt={meta.name}
          className="h-[216px] w-full object-cover object-center rounded-[15px]"
        />
      ) : (
        <div className="flex h-[158px] w-full items-center justify-center bg-gray-700">
          {loading ? "Loading Metadata..." : "No Image."}
        </div>
      )}

      <div className="flex flex-col p-4">
        <p className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">{meta?.name ?? `NFT #${nft.tokenId}`}</p>
        <span className="my-[5px] font-epilogue font-normal text-[#808191] text-left leading-[22px] truncate">
          {meta?.description ?? "No description available."}
        </span>

        <AddressAvatar address={nft.currentOwner} className="mt-2 text-sm text-gray-400" />


        {/* FIX: Change `forSale` to `isCurrentlyListed` here */}
        {isCurrentlyListed && nft.price && nft.price !== "0" && (
          <p className="text-md mt-2 text-gray-400">Price: {formatToEth(nft.price)} ETH</p>
        )}
        {/* FIX: Change `!forSale` to `!isCurrentlyListed` here */}
        {!isCurrentlyListed && (
          <p className="text-md mt-2 text-gray-400">Not listed for sale</p>
        )}
      </div>

      {/* Action Button */}
      <button
        className="group w-full bg-emerald-600  hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-[5px] transition-colors duration-300 flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed "
        onClick={onButtonClick}
        disabled={isActionLoading || loading}
      >
        {isActionLoading || loading ? "Processing..." : (
          <>
            {canList && "SELL"}
            {canCancelListing && (
              <>

                <span className="group-hover:inline">CANCEL LISTING</span>
              </>
            )}
            {isAvailableToBuy && (
              <>
                <span className="group-hover:hidden">{formatToEth(nft.price)} ETH</span>
                <span className="hidden group-hover:inline">BUY NOW</span>
              </>
            )}
            {!canList && !canCancelListing && !isAvailableToBuy && "VIEW DETAILS"}
          </>
        )}
      </button>

      {/* Sell Popup */}
      <SellPopup
        open={sellPopupOpen}
        onClose={() => setSellPopupOpen(false)}
        onSubmit={onSellConfirmed} // onSubmit represents the onSellConfirmed( priceEth ) function ...so in SellPopup.jsx, you can call onSubmit(wei) ..as a result it will trigger the onSellConfirmed function with the price in ETH in parent component
      />
    </div>
  );
};

export default NFTCard;