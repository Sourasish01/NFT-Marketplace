import { BigInt, Bytes } from "@graphprotocol/graph-ts"; // Ensure Bytes is imported
import { NFTTransfer as NFTTransferEvent, NFTMarketplace } from "../generated/NFTMarketplace/NFTMarketplace";
import { NFTTransfer, NFT } from "../generated/schema"; // Import both NFTTransfer and the new NFT entity

export function handleNFTTransfer(event: NFTTransferEvent): void {
  // --- 1. Save the raw NFTTransfer event (your existing logic, enhanced) ---
  const transferId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let transferEntity = new NFTTransfer(transferId);

  transferEntity.tokenId = event.params.tokenId;
  transferEntity.from = event.params.from;
  transferEntity.to = event.params.to;
  transferEntity.price = event.params.price; // This 'price' is the event's price, for transfers/listings

  // Add the new fields for historical transfers (always available from event context)
  transferEntity.timestamp = event.block.timestamp;
  transferEntity.blockNumber = event.block.number;
  transferEntity.transactionHash = event.transaction.hash;

  // Fetch tokenURI from the contract for the transfer event if it's a mint or if needed for historical accuracy
  // This binding uses the address from the event context, which is your NFTMarketplace contract address.
  const nftMarketContract = NFTMarketplace.bind(event.address);
  const tokenURIResult = nftMarketContract.try_tokenURI(event.params.tokenId);
  if (!tokenURIResult.reverted) {
    transferEntity.tokenURI = tokenURIResult.value;
  } else {
    // Fallback to event param if contract call fails (e.g., if contract doesn't have tokenURI view function)
    // Based on your contract, event.params.tokenURI is often "" for non-mint transfers,
    // but the `try_tokenURI` call should succeed.
    transferEntity.tokenURI = event.params.tokenURI;
  }

  transferEntity.save();


  // --- 2. Update/Create the NFT entity (the NEW core logic to solve duplication) ---
  // The ID of the NFT entity should be unique per NFT, e.g., its tokenId
  const nftId = event.params.tokenId.toString(); // Use tokenId as the unique ID for the NFT entity
  let nft = NFT.load(nftId); // Try to load an existing NFT entity

  // If the NFT entity doesn't exist, create it (this happens on the first transfer/mint)
  if (!nft) {
    nft = new NFT(nftId);
    nft.tokenId = event.params.tokenId;
    nft.createdAtTimestamp = event.block.timestamp;
    nft.createdAtBlockNumber = event.block.number;
  }

  // Update current owner based on the 'to' address of the transfer
  nft.currentOwner = event.params.to;

  // Update tokenURI (always keep it up-to-date, fetch from contract for reliability)
  if (!tokenURIResult.reverted) { // Reuse the result from above
    nft.tokenURI = tokenURIResult.value;
  } else {
    // Fallback if contract call fails (e.g., if tokenURI changes and old version failed)
    nft.tokenURI = event.params.tokenURI;
  }

  // Determine listing status and price based on your contract's logic for NFTTransfer events
  // - createNFT: from=address(0), to=msg.sender (owner is msg.sender) -> not listed
  // - listNFT: from=msg.sender, to=address(this) (owner is marketplace) -> listed
  // - buyNFT: from=address(this), to=msg.sender (owner is msg.sender - buyer) -> not listed
  // - cancelListing: from=address(this), to=msg.sender (owner is msg.sender - original seller) -> not listed

  // Your contract passes the marketplace contract address as `address(this)`
  const marketplaceContractAddress = event.address; // The address of the contract emitting the event

  if (event.params.to.toHexString() == marketplaceContractAddress.toHexString()) { // NFT transferred TO the marketplace (it's listed)
    nft.isListed = true;
    nft.price = event.params.price; // The price is explicitly set in your `listNFT` event
    nft.listedBy = event.params.from; // The address who listed it
  } else if (event.params.from.toHexString() == marketplaceContractAddress.toHexString()) { // NFT transferred FROM the marketplace (it's bought or canceled)
    nft.isListed = false;
    nft.price = BigInt.fromI32(0); // No longer listed, so price is 0
    nft.listedBy = Bytes.fromHexString("0x0000000000000000000000000000000000000000"); // Reset listedBy to zero address or null
  } else {
    // For regular user-to-user transfers or mints (where `from` is address(0))
    nft.isListed = false;
    nft.price = BigInt.fromI32(0); // Not listed, so price is 0
    nft.listedBy = Bytes.fromHexString("0x0000000000000000000000000000000000000000"); // Reset listedBy
  }

  // Save the updated NFT entity
  nft.save();
}





/*
import { NFTTransfer as NFTTransferEvent } from "../generated/NFTMarketplace/NFTMarketplace";
import { NFTTransfer } from "../generated/schema";
export function handleNFTTransfer(event: NFTTransferEvent): void {
  let entity = new NFTTransfer(
  event.transaction.hash.toHex() + "-" + event.logIndex.toString()
);
  entity.tokenId = event.params.tokenId
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenURI = event.params.tokenURI
  entity.price = event.params.price

  entity.save()
}
  */

/*

import { NFTTransfer as NFTTransferEvent } from "../generated/NFTMarketplace/NFTMarketplace";
import { NFTTransfer } from "../generated/schema";
import { NFTMarketplace } from "../generated/NFTMarketplace/NFTMarketplace";

export function handleNFTTransfer(event: NFTTransferEvent): void {
  const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const nft = new NFTTransfer(id);

  nft.tokenId = event.params.tokenId;
  nft.to = event.params.to;
  nft.from = event.params.from;
  nft.price = event.params.price;

  const nftMarket = NFTMarketplace.bind(event.address);
  const tokenURIResult = nftMarket.try_tokenURI(event.params.tokenId);
  if (!tokenURIResult.reverted) {
    nft.tokenURI = tokenURIResult.value;
  }

  

  nft.save();
}

*/