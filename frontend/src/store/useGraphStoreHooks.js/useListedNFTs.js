import { useQuery } from 'urql';
import { parseNFT } from './helpers';
import { contractAddress } from '@/config/connectionKeys';


const GET_LISTED_NFTS = `
  query GetListedNFTs {
    nfts(
      where: {
        currentOwner: "${contractAddress}", 
        isListed: true, 
        price_not: "0"
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

const useListedNFTs = () => {
  const [result, refetch] = useQuery({
    query: GET_LISTED_NFTS,
  });

  const { data, fetching, error } = result;

  const listedNFTs = data?.nfts.map(parseNFT) || [];

  return {
    listedNFTs,
    loading: fetching,
    error,
    refetch,
  };
};

export default useListedNFTs;
