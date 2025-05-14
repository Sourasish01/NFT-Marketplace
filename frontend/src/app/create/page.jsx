"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { uploadToNFTStorage } from "@/store/useMetaDataStore";

import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";

const Page = () => {
  const { authUser, isLoggingIn } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });




  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);






  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };






  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.image) {
      alert("All fields are required!");
      return;
    }

    try {
      setLoading(true);

      const metadataURL = await uploadToNFTStorage(formData);

      console.log("✅ Metadata uploaded to:", metadataURL);

      // TODO: Add smart contract minting or listing logic here using metadataURL
      // ie the creation of the NFT on the blockchain

    } catch (err) {
      console.error("❌ Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };



  

  return (
    <div className="flex w-full flex-col overflow-hidden">
      <div className="flex min-h-screen w-full items-center justify-center text-lg text-white">
        {isLoggingIn ? (
          "Loading..."
        ) : !authUser ? (
          "Connect your Wallet"
        ) : (
          <motion.div
            className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-emerald-300 text-center">
              Create New Product
            </h2>

            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap md:flex-nowrap space-y-6 md:space-y-0 md:space-x-8"
            >
              {/* Image Upload Section */}
              
              <div className="w-full md:w-1/2 p-4 border border-gray-600 rounded-md shadow-sm flex flex-col items-center justify-center text-sm font-medium text-gray-300 min-h-[250px] relative overflow-hidden">
                <input
                  type="file"
                  id="image"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="image"
                  className="cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <Upload className="h-5 w-5 inline-block mr-2" />
                  Upload Image
                </label>

                {/* Always render this fixed-size preview box to preserve layout */}
                <div className="mt-4 w-full max-w-[143px] bg-gray-900 rounded-md overflow-hidden flex items-center justify-center border border-gray-700 py-3.5">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs">No image selected</span>
                  )}
                </div>
              </div>


              {/* Text Inputs Section */}
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Page;
