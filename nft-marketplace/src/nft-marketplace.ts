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