import { useAuthStore } from "@/store/useAuthStore";
import { create } from "zustand";

import toast from "react-hot-toast";
import { parseEther } from "ethers";


export const useNftStore = create((set, get) => ({

    creatingNFT: false, // State to track if NFT creation is in progres
    listingNFT: false, // New state for listing
    buyingNFT: false,  // New state for buying
    cancellingListing: false, // New state for cancelling
    withdrawingFunds: false, // New state for withdrawing


    createNFT: async (metadataURL) => {
        const { contractInstance } = useAuthStore.getState(); // ✅ Correct hook usage
        set({ creatingNFT: true });
        try {
            const tx = await contractInstance.createNFT(metadataURL);
            toast("⏳ Creating NFT...", { icon: '⏳' }); // Provide immediate feedback
            await tx.wait();
            toast.success("✅ NFT created!");
        } catch (error) {
            console.error("Error creating NFT:", error);
            toast.error("❌ NFT creation failed");
        } finally {
            set({ creatingNFT: false });
        }
    },

    listNFT: async (tokenId, price) => {
        const { contractInstance } = useAuthStore.getState();
        set({ listingNFT: true });

        try {
        // Convert price (e.g., from string input) to Wei
        const priceInWei = parseEther(price.toString()); // price should be a number or string like "0.05"
        const tx = await contractInstance.listNFT(tokenId, priceInWei);
        toast("⏳ Listing NFT...", { icon: '⏳' });
        await tx.wait();
        toast.success("✅ NFT listed for sale!");
        } catch (error) {
        console.error("Error listing NFT:", error);
        // More specific error handling could be added here, e.g., if user rejects
        toast.error("❌ NFT listing failed");
        } finally {
        set({ listingNFT: false });
        }
     },

    buyNFT: async (tokenId, price) => {
        const { contractInstance } = useAuthStore.getState();
        set({ buyingNFT: true });
        try {
        // Convert price to Wei and pass it as the value for the transaction
        const priceInWei = parseEther(price.toString()); // price should be the listing price from subgraph
        const tx = await contractInstance.buyNFT(tokenId, { value: priceInWei });
        toast("⏳ Buying NFT...", { icon: '⏳' });
        await tx.wait();
        toast.success("✅ NFT purchased successfully!");
        } catch (error) {
        console.error("Error buying NFT:", error);
        toast.error("❌ NFT purchase failed");
        } finally {
        set({ buyingNFT: false });
        }
    },

    cancelListing: async (tokenId) => {
        const { contractInstance } = useAuthStore.getState();
        set({ cancellingListing: true });
        
        try {
        const tx = await contractInstance.cancelListing(tokenId);
        toast("⏳ Cancelling listing...", { icon: '⏳' });
        await tx.wait();
        toast.success("✅ NFT listing cancelled!");
        } catch (error) {
        console.error("Error cancelling listing:", error);
        toast.error("❌ Failed to cancel listing");
        } finally {
        set({ cancellingListing: false });
        }
    },

    withdrawFunds: async () => {
        const { contractInstance } = useAuthStore.getState();
        set({ withdrawingFunds: true });
        try {
        const tx = await contractInstance.withdrawFunds();
        toast("⏳ Withdrawing funds...", { icon: '⏳' });
        await tx.wait();
        toast.success("✅ Funds withdrawn!");
        } catch (error) {
        console.error("Error withdrawing funds:", error);
        toast.error("❌ Failed to withdraw funds");
        } finally {
        set({ withdrawingFunds: false });
        }
    },
    
}));











