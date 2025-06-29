
// SellPopup.jsx (or SellPopup.js)
import { ethers, parseEther } from "ethers";
import { useState } from "react";
import Button from "./Button";

const SellPopup = (props) => {
  const { open, onClose, onSubmit } = props;
  const [price, setPrice] = useState("");
  const [error, setError] = useState();

  if (!open) {
    return null;
  }

  const onConfirm = () => {
    setError(undefined);

    if (!price) {
      return setError("Price cannot be empty.");
    }

    let wei;
    try {
      // parseEther now returns a JavaScript native BigInt
      wei = parseEther(price);
    } catch (e) {
      console.error("Error parsing price with ethers.parseEther:", e); // Updated log message
      return setError("Invalid price format. Please enter a valid number.");
    }

    // --- FIX IS HERE: Use standard BigInt comparison ---
    if (wei <= 0n) { // Compare `wei` (BigInt) with `0n` (BigInt literal for zero)
      return setError("Price must be greater than 0.");
    }

    onSubmit(wei); // onSubmit will now receive a JavaScript BigInt
  };

  return (
    // Replaced CustomDialog with basic div structure for a simple modal/dialog
    // This provides a fixed overlay and a central content box.
    // For a robust dialog, consider using a headless UI library like Headless UI or Radix UI.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">List NFT for Sale</h3>
        {/* Description */}
        <p className="text-sm text-gray-400 mb-4">This will list the NFT for sale, you can cancel anytime.</p>

        {/* Close Button (Optional, but good for accessibility) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-end">
          <div className="mr-2 flex flex-grow flex-col">
            <label
              htmlFor="price"
              className="ml-2 text-xs font-semibold text-gray-400" 
            >
              PRICE (ETH)
            </label>
            {/* Replaced Input with standard HTML <input> */}
            <input
              name="price"
              id="price"
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setError(undefined);
              }}
              // Basic styling for the input
              className={`
                mt-1 block w-full rounded-md border
                bg-gray-700 text-white placeholder-gray-500
                focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5
                ${error ? 'border-red-500' : 'border-gray-600'}
              `}
              placeholder="0.00"
              step="0.01" // Suggest a step for number input
            />
            {/* Display error message if it exists */}
            {error && <p className="mt-1 ml-2 text-xs text-red-500">{error}</p>}
          </div>
          <Button onClick={onConfirm}>CONFIRM</Button>
        </div>
      </div>
    </div>
  );
};

export default SellPopup;