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
    <div className="flex items-center mt-[16px] gap-[8px]">
      <Blockies seed={address.toLowerCase()} className="rounded-md" />
      <span>{shortAddress}</span>
    </div>
  );
};

export default AddressAvatar;