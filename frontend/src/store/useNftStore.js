import { useAuthStore } from "@/store/useAuthStore";
import { create } from "zustand";

import toast from "react-hot-toast";
//import { ethers } from "ethers"; // Importing ethers.js library for Ethereum interactions

//import { contractAddress, contractAbi } from  "@/config/connectionKeys"; // Importing contract address and ABI from a configuration file"
//import { a } from "framer-motion/dist/types.d-DDSxwf0n";







export const useNftStore = create((set, get) => ({

    creatingNFT: false, // State to track if NFT creation is in progres

    createNFT: async (metadataURL) => {
         const { contractInstance } = useAuthStore.getState(); // ✅ Correct hook usage
        set({ creatingNFT: true });
        try {
            const tx = await contractInstance.createNFT(metadataURL);
            await tx.wait();
            toast.success("✅ NFT created!");
        } catch (error) {
            console.error("Error creating NFT:", error);
            toast.error("❌ NFT creation failed");
        } finally {
            set({ creatingNFT: false });
        }
    }
}));



