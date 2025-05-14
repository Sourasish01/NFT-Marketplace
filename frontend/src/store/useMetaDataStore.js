import { NFTStorage, File } from 'nft.storage';

export const uploadToNFTStorage = async ({ name, description, image }) => {
  const nftStorage = new NFTStorage({
    token: process.env.NFT_STORAGE_KEY,
  });

  const metadata = await nftStorage.store({
    name,
    description,
    image: new File([image], image.name, { type: image.type }),
  });

  return metadata.url;
};
