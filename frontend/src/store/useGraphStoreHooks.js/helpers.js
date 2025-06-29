import { contractAddress } from "@/config/connectionKeys";

export const parseRawNFT = (nft) => {
  
  const isListed =
    nft.to.toLowerCase() === contractAddress.toLowerCase() && // NFT is owned by the marketplace contract
    nft.price && // Price exists (not null or undefined)
    nft.price !== "0"; // Price is not zero (as a string)
 
  return {
    id: nft.id,
    tokenId: nft.tokenId, 
    from: nft.from,
    to: nft.to,
    tokenURI: nft.tokenURI,
    price: nft.price,
    isListed: isListed,
    name: `NFT #${nft.tokenId}`,
  };
};


