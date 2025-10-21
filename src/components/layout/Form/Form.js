// crowdfunding-app-prototype\src\components\layout\Form\Form.js

import styled from "styled-components";
import FormRight from "./Components/FormRight";
import FormLeft from "./Components/FormLeft";
import { createContext, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { BrowserProvider, Contract, ethers } from "ethers";
import { toast } from "react-toastify";
import CampaignFactory from "../../../../artifacts/contracts/Campaign.sol/CampaignFactory.json";
import { useRouter } from "next/navigation";
// import CampaignFactory from "../../../../artifacts/contracts/Campaign.sol/CampaignFactory.json";

const FormState = createContext();

const Form = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    campaignTitle: "",
    description: "",
    requiredAmount: "",
    category: "Education",
  });

  // for starting campaign
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [uploaded, setUploaded] = useState(false);

  // for storing IPFS links
  const [descriptionUrl, setDescriptionUrl] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [image, setImage] = useState(null);

  const FormHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const ImageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const startCampaign = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading immediately

    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed or detected.");
      setLoading(false);
      return;
    }

    try {
      // ✅ FIX 1: Use Ethers v6 BrowserProvider
      const provider = new BrowserProvider(window.ethereum);
      // ✅ FIX 2: Await getSigner() in Ethers v6
      const signer = await provider.getSigner();

      if (form.campaignTitle === "") {
        toast.warn("Title is Empty");
      } else if (form.description === "") {
        toast.warn("Description is empty");
      } else if (form.requiredAmount === "") {
        toast.warn("Required Amount is Empty");
      } else if (uploaded === false) {
        toast.warn("Files Upload is Required ");
      } else if (!process.env.NEXT_PUBLIC_ADDRESS) {
        toast.error("Contract address is missing in environment variables.");
      } else {
        const contract = new Contract(
          process.env.NEXT_PUBLIC_ADDRESS,
          CampaignFactory.abi,
          signer
        );

        console.log("Starting new Campaign ...... ");

        // Convert requiredAmount to BigInt/Wei before sending
        const amountInWei = ethers.parseEther(form.requiredAmount.toString());

        const campaignData = await contract.createCampaign(
          form.campaignTitle,
          amountInWei, // Use converted BigInt value
          imageUrl,
          form.category,
          descriptionUrl
        );

        await campaignData.wait();

        // --- CRITICAL FIX: Get the new contract address from the event ---
        // Assuming your CampaignFactory event log is the first one in the receipt
        const receipt = await campaignData.wait();
        // The last argument in your event is campaignAddress
        const newCampaignAddress = receipt.logs.find(
          (log) => log.address === contract.target
        )?.args[3];

        setAddress(newCampaignAddress);
        toast.success("Campaign Started!");
      }
    } catch (error) {
      console.error("Campaign start failed:", error);
      setLoading(false);
      // Display a user-friendly error
      toast.error(`Transaction failed: ${error.reason || error.message}`);
    } finally {
      // setLoading(false); // Stop loading regardless of success/failure
    }
  };

  return (
    <FormState.Provider
      value={{
        form,
        setForm,
        image,
        setImage,
        ImageHandler,
        FormHandler,
        setImageUrl,
        setDescriptionUrl,
        startCampaign,
        setUploaded,
      }}
    >
      <FormWrapper>
        <FormMain>
          <FormTitle>Create Campaign</FormTitle>
          {loading === true ? (
            address === "" ? (
              <Spinner>
                <TailSpin height={60} />
              </Spinner>
            ) : (
              <Address>
                <h1>Campaign Started Successfully</h1>
                <h2>{address}</h2>
                <Button onClick={() => router.push(`/campaign/${address}`)}>
                  Go To Campaign
                </Button>
              </Address>
            )
          ) : (
            <FormInputsWrapper>
              <FormLeft />
              <FormRight />
            </FormInputsWrapper>
          )}
        </FormMain>
      </FormWrapper>
    </FormState.Provider>
  );
};

const FormWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FormMain = styled.div`
  width: 80%;
`;

const FormTitle = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: capitalize;
  font-weight: bold;
  color: ${(props) => props.theme.color};
  font-size: 40px;
  font-family: "poppins";
  margin-top: 20px;
`;

const FormInputsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 45px;
`;

const Spinner = styled.div`
  width: 100%;
  height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Address = styled.div`
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${(props) => props.theme.bgSubDiv};
  border-radius: 10px;
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  width: 30%;
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

export default Form;
export { FormState };
