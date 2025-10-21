// crowdfunding-app-prototype\src\components\layout\Form\Components\FormRight.js

"use client";

import styled from "styled-components";
import { useContext, useState, useEffect } from "react";
import { FormState } from "../Form";
import { toast } from "react-toastify";
import { TailSpin } from "react-loader-spinner";
// If you prefer to use Pinata's dedicated JWT, you would use a Bearer token.

// ✅ NEW PINATA ENDPOINT
const PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

const uploadDataToPinata = async (data, filename, apiKey, apiSecret) => {
  const formData = new FormData();
  let uploadBlob; // 1. Determine the Blob/File type

  if (data instanceof File || data instanceof Blob) {
    uploadBlob = data;
  } else if (typeof data === "string") {
    // If it's a string, create a Blob from it
    uploadBlob = new Blob([data], { type: "text/plain" });
  } else {
    throw new Error("Invalid data type for upload.");
  } // Pinata expects the file under the key 'file'

  formData.append("file", uploadBlob, filename);

  // Pinata also accepts metadata (optional, but good practice)
  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: filename,
      keyvalues: { origin: "crowdfunding-dapp" },
    })
  ); // ✅ PINATA uses custom headers for API Key authentication

  const response = await fetch(PINATA_UPLOAD_URL, {
    method: "POST",
    headers: {
      pinata_api_key: apiKey, // Your API Key
      pinata_secret_api_key: apiSecret, // Your API Secret // NOTE: Do NOT set 'Content-Type' header when using FormData,
      // the browser sets it automatically with the correct boundary.
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ error: "Could not read error body" }));
    // Pinata returns detailed errors in JSON format
    throw new Error(
      `Pinata upload failed: ${response.status} ${
        response.statusText
      }. Details: ${JSON.stringify(errorBody.error || errorBody.reason)}`
    );
  }

  const json = await response.json(); // Pinata returns the CID as 'IpfsHash'
  return json.IpfsHash;
};

const FormRight = () => {
  const Handler = useContext(FormState);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // ✅ NEW STATE: Store Pinata Keys instead of Base64 Auth String
  const [pinataKeys, setPinataKeys] = useState({ apiKey: "", apiSecret: "" });

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

    if (apiKey && apiSecret) {
      // Store keys directly since Pinata doesn't require Basic Auth encoding
      setPinataKeys({ apiKey: apiKey.trim(), apiSecret: apiSecret.trim() });
    } else {
      console.error(
        "FATAL: Pinata Keys not loaded. Check .env.local and NEXT_PUBLIC_ prefix."
      );
    }
  }, []);

  const uploadFiles = async (e) => {
    e.preventDefault();
    setUploadLoading(true);

    const { apiKey, apiSecret } = pinataKeys;

    if (!apiKey || !apiSecret) {
      toast.error("Pinata credentials missing. Cannot upload.");
      setUploadLoading(false);
      return;
    }

    // --- Story Upload ---
    if (Handler.form.description && Handler.form.description.trim() !== "") {
      try {
        // Pass the raw keys to the helper function
        const cid = await uploadDataToPinata(
          Handler.form.description,
          "story.txt",
          apiKey, // Pass 1
          apiSecret // Pass 2
        );
        Handler.setDescriptionUrl(cid);
        toast.success("Description Uploaded");
      } catch (error) {
        toast.warn(`Error Uploading Description: ${error.message}`);
      }
    } else {
      toast.info("Story field is empty, skipping upload.");
    }

    // --- Image Upload ---
    if (Handler.image !== null) {
      try {
        const cid = await uploadDataToPinata(
          Handler.image,
          Handler.image.name,
          apiKey, // Pass 1
          apiSecret // Pass 2
        );
        Handler.setImageUrl(cid);
        toast.success("Image Uploaded");
      } catch (error) {
        toast.warn(`Error Uploading Image: ${error.message}`);
      }
    } else {
      toast.info("No image selected, skipping upload.");
    }

    setUploadLoading(false);
    setUploaded(true);
    Handler.setUploaded("true");
    toast.success("Files Processed Successfully");
  };

  return (
    <FormRightWRapper>
      <FormInput>
        <FormRow>
          <RowFirstInput>
            <label>Required Amount</label>
            <Input
              onChange={Handler.FormHandler}
              value={Handler.form.requiredAmount}
              type={"number"}
              placeholder="Required Amount"
              name="requiredAmount"
            ></Input>
          </RowFirstInput>
          <RowSecondInput>
            <label>Choose Category</label>
            <Select
              onChange={Handler.FormHandler}
              value={Handler.form.category}
              name="category"
            >
              <option>Education</option> <option>Health</option>
              <option>Animal</option>
            </Select>
          </RowSecondInput>
        </FormRow>
      </FormInput>
      {/*Image*/}
      <FormInput>
        <label>Select Image</label>
        <Image
          onChange={Handler.ImageHandler}
          type={"file"}
          accept="image/*"
        ></Image>
      </FormInput>
      {uploadLoading == true ? (
        <Button>
          <TailSpin color="#fff" height={20} />
        </Button>
      ) : uploaded == false ? (
        <Button onClick={uploadFiles}>Upload Files to IPFS</Button>
      ) : (
        <Button style={{ cursor: "no-drop" }}>
          Files uploaded succcessfully.
        </Button>
      )}
      <Button onClick={Handler.startCampaign}>Start Campaign</Button>
    </FormRightWRapper>
  );
};

const FormRightWRapper = styled.div`
  width: 45%;
`;

const FormInput = styled.div`
  display: flex;
  flex-direction: column;
  font-family: "poppins";
  margin-top: 10px;
`;

const FormRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const RowFirstInput = styled.div`
  display: flex;
  flex-direction: column;
  width: 45%;
`;

const RowSecondInput = styled.div`
  display: flex;
  flex-direction: column;
  width: 45%;
`;

const Select = styled.select`
  padding: 15px;
  background-color: ${(props) => props.theme.bgDiv};
  color: ${(props) => props.theme.color};
  margin-top: 4px;
  border: none;
  border-radius: 8px;
  outline: none;
  font-size: large;
  width: 100%;
`;

const Input = styled.input`
  padding: 15px;
  background-color: ${(props) => props.theme.bgDiv};
  color: ${(props) => props.theme.color};
  margin-top: 4px;
  border: none;
  border-radius: 8px;
  outline: none;
  font-size: large;
  width: 100%;
`;

const Image = styled.input`
  background-color: ${(props) => props.theme.bgDiv};
  color: ${(props) => props.theme.color};
  margin-top: 4px;
  border: none;
  border-radius: 8px;
  outline: none;
  font-size: large;
  width: 100%;

  &::-webkit-file-upload-button {
    padding: 15px;
    background-color: ${(props) => props.theme.bgSubDiv};
    color: ${(props) => props.theme.color};
    outline: none;
    border: none;
    font-weight: bold;
  }
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 15px;
  color: white;
  background-color: #00b712;
  background-image: linear-gradient(180deg, #00b712 0%, #5aff15 80%);
  border: none;
  margin-top: 30px;
  cursor: pointer;
  font-weight: bold;
  font-size: large;
`;

export default FormRight;
