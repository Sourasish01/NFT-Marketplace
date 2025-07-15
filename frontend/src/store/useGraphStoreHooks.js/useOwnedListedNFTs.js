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

/*

The GraphQL query expects string values for both to and from fields within the where clause.

to: "${contractAddress}": In this case, contractAddress is a JavaScript variable that holds a string (the contract's address). The ${...} syntax interpolates that string value directly into the GraphQL query string. So, when the GraphQL server receives the query, it sees to: "0xYourContractAddress", which is a string.

from: $owner: Here, $owner is a GraphQL variable of type String!. You then pass the actual string value for this variable in the variables object of your useQuery hook: variables: { owner: address ?? '' }. The address variable from your useAuthStore is also a string (the connected wallet address).


*/ 
