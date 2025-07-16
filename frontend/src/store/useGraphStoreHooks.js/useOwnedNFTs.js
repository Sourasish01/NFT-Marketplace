// src/hooks/useOwnedNFTs.js (or wherever you keep this specific hook)
import { useQuery } from 'urql';
import { useAuthStore } from '@/store/useAuthStore';
import { parseNFT } from './helpers'; // <<-- IMPORTANT: Use parseNFT, not parseRawNFT

const GET_OWNED_NFTS_UPDATED = `
  query GetOwnedNFTs($ownerAddress: Bytes!) {
    nfts(where: { currentOwner: $ownerAddress, isListed: false }) {
      id
      tokenId
      currentOwner
      tokenURI
      isListed
      price
      createdAtTimestamp
      createdAtBlockNumber
      listedBy
    }
  }
`;

const useOwnedNFTs = () => {
  const address = useAuthStore(state => state.connectedAddress); // This is the user's wallet address

  const [result, refetch] = useQuery({
    query: GET_OWNED_NFTS_UPDATED, // Use the updated query
    variables: { ownerAddress: address?.toLowerCase() ?? '0x0000000000000000000000000000000000000000' }, // Pass user's address
    pause: !address, // Only run if address exists
  });

  const { data, fetching, error } = result;

  // Crucially, map over data.nfts and use parseNFT
  const ownedNFTs = data?.nfts.map(parseNFT) || [];

  return {
    ownedNFTs,
    loading: fetching,
    error,
    refetch,
  };
};

export default useOwnedNFTs;


/*

import { useQuery } from 'urql';
import { useAuthStore } from '@/store/useAuthStore';
import { parseRawNFT } from './helpers';

const GET_OWNED_NFTS = `
  query GetOwnedNFTs($owner: String!) {
    nfttransfers(where: { to: $owner }) {
      id
      tokenId     
      from
      to
      tokenURI
      price
    }
  }
`;

const useOwnedNFTs = () => {
  const address = useAuthStore(state => state.connectedAddress);

  const [result, refetch] = useQuery({
    query: GET_OWNED_NFTS,
    variables: { owner: address ?? '' },
    pause: !address, // Only run if address exists
  });

  const { data, fetching, error } = result;
  const ownedNFTs = data?.nfttransfers.map(parseRawNFT) || [];

  return {
    ownedNFTs,
    loading: fetching,
    error,
    refetch, // <-- THIS IS THE CRUCIAL ADDITION
  };
};

export default useOwnedNFTs;

*/
