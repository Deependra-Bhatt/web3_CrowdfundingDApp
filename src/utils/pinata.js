// src\utils\pinata.js
import axios from "axios";

// This uses the API Key/Secret method
export const uploadDataToPinata = async (data, fileName, apiKey, apiSecret) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const isFile = data instanceof File;

  let formData = new FormData();

  if (isFile) {
    // For image file upload
    formData.append("file", data, fileName);
  } else {
    // For text data (description)
    const blob = new Blob([data], { type: "text/plain" });
    formData.append("file", blob, fileName);
  }

  try {
    const response = await axios.post(url, formData, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
    });

    // Pinata response contains the IPFS Hash (CID)
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Pinata Upload Error:", error);
    throw new Error(
      `Pinata upload failed: ${error.response?.data?.error || error.message}`
    );
  }
};
