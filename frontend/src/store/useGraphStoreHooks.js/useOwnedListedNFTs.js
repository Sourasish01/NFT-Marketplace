
import { useQuery } from 'urql';
import { useAuthStore } from '@/store/useAuthStore';
import { contractAddress } from "@/config/connectionKeys"; 
import { parseNFT } from './helpers'; // <<-- IMPORTANT: Use parseNFT, not parseRawNFT

const GET_OWNED_LISTED_NFTS_UPDATED = `
  query GetOwnedListedNFTs($listerAddress: Bytes!, $marketplaceContractAddress: Bytes!) {
    nfts(
      where: {
        currentOwner: $marketplaceContractAddress,
        listedBy: $listerAddress,
        isListed: true
      }
    ) {
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

const useOwnedListedNFTs = () => {
  const address = useAuthStore(state => state.connectedAddress); // This is the user's wallet address

  const [result, refetch] = useQuery({
    query: GET_OWNED_LISTED_NFTS_UPDATED, // Use the updated query
    variables: {
      listerAddress: address?.toLowerCase() ?? '0x0000000000000000000000000000000000000000', // Pass user's address as listerAddress
      marketplaceContractAddress: contractAddress.toLowerCase(), // Pass marketplace address
    },
    pause: !address, // Only run if address exists
  });

  const { data, fetching, error } = result;

  // Crucially, map over data.nfts and use parseNFT
  const ownedListedNFTs = data?.nfts.map(parseNFT) || [];

  return {
    ownedListedNFTs,
    loading: fetching,
    error,
    refetch,
  };
};

export default useOwnedListedNFTs;



/*
import { useQuery } from 'urql';
import { useAuthStore } from '@/store/useAuthStore';
import { contractAddress } from  "@/config/connectionKeys";
import { parseRawNFT } from './helpers';

const GET_OWNED_LISTED_NFTS = `
  query GetOwnedListedNFTs($owner: String!) {
    nfttransfers(
      where: {
        to: "${contractAddress}", 
        from: $owner
      }
    ) {
      id
      tokenId
      from
      to
      tokenURI
      price
    }
  }
`;


const useOwnedListedNFTs = () => {
   const address = useAuthStore(state => state.connectedAddress);

  const [result, refetch] = useQuery({
    query: GET_OWNED_LISTED_NFTS,
    variables: { owner: address ?? '' },
    pause: !address, // URQL equivalent of Apollo's skip
  });

  const { data, fetching, error } = result;

  const ownedListedNFTs = data?.nfttransfers.map(parseRawNFT) || [];

 return {
    ownedListedNFTs,
    loading: fetching,
    error,
    refetch, // <-- THIS IS THE CRUCIAL ADDITION
  };
};

export default useOwnedListedNFTs; 
*/

/*

The GraphQL query expects string values for both to and from fields within the where clause.

to: "${contractAddress}": In this case, contractAddress is a JavaScript variable that holds a string (the contract's address). The ${...} syntax interpolates that string value directly into the GraphQL query string. So, when the GraphQL server receives the query, it sees to: "0xYourContractAddress", which is a string.

from: $owner: Here, $owner is a GraphQL variable of type String!. You then pass the actual string value for this variable in the variables object of your useQuery hook: variables: { owner: address ?? '' }. The address variable from your useAuthStore is also a string (the connected wallet address).


*/ 
