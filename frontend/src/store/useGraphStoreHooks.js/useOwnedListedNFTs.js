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
