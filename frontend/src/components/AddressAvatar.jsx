import { useMemo } from "react";
import Blockies from "react-blockies";

const minifyAddress = (address) => {
  const start = address.substring(0, 5);
  const end = address.substring(address.length - 4);
  return `${start}...${end}`;
};

const AddressAvatar = ({ address }) => {
  const shortAddress = useMemo(() => minifyAddress(address), [address]);

  return (
    <div className="flex h-10 items-center">
      <Blockies seed={address.toLowerCase()} className="mr-2 rounded-md" />
      <span>{shortAddress}</span>
    </div>
  );
};

export default AddressAvatar;