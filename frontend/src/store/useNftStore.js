import { useAuthStore } from "@/store/useAuthStore";
import { create } from "zustand";

import toast from "react-hot-toast";
import { ethers } from "ethers"; // Importing ethers.js library for Ethereum interactions

import { contractAddress, contractAbi } from  "@/config/connectionKeys"; // Importing contract address and ABI from a configuration file"

