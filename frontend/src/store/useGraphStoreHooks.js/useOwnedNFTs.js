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
