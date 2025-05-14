import { create } from "zustand";
import toast from "react-hot-toast";
import { ethers } from "ethers"; // Importing ethers.js library for Ethereum interactions

import { contractAddress, contractAbi } from  "@/config/connectionKeys"; // Importing contract address and ABI from a configuration file"

export const useAuthStore = create((set, get) => ({

    authUser: false,
    isLoggingIn: false,
    connectedAddress: null,

    contractInstance: null, // Initialize contractInstance to null




    connectWallet: async () => {
        if (!window.ethereum) { //window.ethereum is injected by MetaMask into the browser when it's installed.
            toast.error("Please install MetaMask!"); //If window.ethereum doesn't exist, it means MetaMask (or any Ethereum provider) is not available.
            //  In this case, an alert prompts the user to install MetaMask, and the function returns null.
            return null;
       }

        set({ isLoggingIn: true }); //isLoggingIn is set to true to indicate that the wallet connection process has started.

       try {
        const provider = new ethers.BrowserProvider(window.ethereum); // Uses ethers.BrowserProvider (introduced in ethers v6).
        //The ethers.BrowserProvider class is used to connect to MetaMask (or any browser-based Ethereum provider).
        //BrowserProvider automatically manages the connection and works well with modern dApps.
        //window.ethereum is passed as a parameter to establish this connection.

        const signer = await provider.getSigner();//The signer is a special object in ethers.js that represents the user's Ethereum account.
        //Automatically prompts the user to connect their wallet when getSigner() is called.
        //It’s used to sign transactions and messages on behalf of the connected account.
        //await ensures that the function pauses until the signer is obtained.
        //In ethers v6 (BrowserProvider), await is required because getSigner() is asynchronous.

        set({ authUser: true }); //Once the signer is obtained, authUser is set to true, indicating that the user is authenticated.

        const account = await signer.getAddress();//signer.getAddress() fetches the Ethereum address of the connected account.
        //await ensures the address retrieval completes before proceeding.

        set({ connectedAddress: account }); //The connected account address is stored in the Zustand store using set.


        
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);

        set({ contractInstance: contract }); //The contract instance is created using ethers.Contract, which allows interaction with the smart contract.


        console.log("Connected account:", account); //Logs the connected account address to the console.
        toast.success("Wallet connected successfully"); //Displays a success message using react-hot-toast.
        


        } catch (error) {
            console.error("Error connecting wallet:", error); //Logs any errors that occur during the connection process.
            toast.error("Error connecting wallet"); //Displays an error message using react-hot-toast.
           
        }

        finally {
            set({ isLoggingIn: false }); //isLoggingIn is set to false to indicate that the wallet connection process has completed.
        }

    }    
        
        
    }));