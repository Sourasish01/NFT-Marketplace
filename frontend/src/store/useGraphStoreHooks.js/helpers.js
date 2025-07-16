import { contractAddress } from "@/config/connectionKeys";

// Function to parse the current state NFT entity (from 'nfts' query)
export const parseNFT = (nft) => {
  return {
    id: nft?.id ?? "",
    tokenId: nft?.tokenId ?? "0",
    currentOwner: nft?.currentOwner ?? "0x0000000000000000000000000000000000000000",
    tokenURI: nft?.tokenURI ?? "",
    price: nft?.price ?? "0",
    isListed: nft?.isListed ?? false,
    name: `NFT #${nft?.tokenId ?? "0"}`,
    createdAtTimestamp: nft?.createdAtTimestamp ?? "0",
    createdAtBlockNumber: nft?.createdAtBlockNumber ?? "0",
    listedBy: nft?.listedBy ?? "0x0000000000000000000000000000000000000000",
  };
};

// Function to parse a historical NFTTransfer entity (from 'nfttransfers' query)
export const parseNFTTransfer = (transfer) => {
  const from = transfer?.from?.toLowerCase() ?? "";
  const to = transfer?.to?.toLowerCase() ?? "";
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const marketplaceAddress = contractAddress.toLowerCase();

  // 🟣 Derive a basic transfer type (optional for UI clarity)
  let type = "Transfer";
  if (from === zeroAddress) type = "Mint";
  else if (to === marketplaceAddress) type = "Listed";
  else if (from === marketplaceAddress) type = "Purchased";
  else if (to !== marketplaceAddress && from !== zeroAddress) type = "UserTransfer";

  return {
    id: transfer?.id ?? "",
    tokenId: transfer?.tokenId ?? "0",
    from,
    to,
    tokenURI: transfer?.tokenURI ?? "",
    price: transfer?.price ?? "0",
    timestamp: transfer?.timestamp ?? "0",
    blockNumber: transfer?.blockNumber ?? "0",
    transactionHash: transfer?.transactionHash ?? "",
    type, // New derived field
  };
};


