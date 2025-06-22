// utils/uploadToPinata.js
import axios from "axios";

export async function uploadToPinata(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxContentLength: "Infinity", // for large files
      headers: {
        "Content-Type": "multipart/form-data",
        "pinata_api_key": process.env.NEXT_PUBLIC_PINATA_API_KEY,
        "pinata_secret_api_key": process.env.NEXT_PUBLIC_PINATA_API_SECRET,
      },
    });

    const ipfsHash = res.data.IpfsHash;
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    return url;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
}


