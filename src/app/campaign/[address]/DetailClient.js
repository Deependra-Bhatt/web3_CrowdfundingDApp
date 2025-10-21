// src/app/campaign/[address]/DetailClient.js

"use client";
import styled from "styled-components";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ethers, BrowserProvider, Contract } from "ethers"; // ADDED BrowserProvider, Contract
import Campaign from "../../../../artifacts/contracts/Campaign.sol/Campaign.json"; // Adjusted path
import { toast } from "react-toastify"; // Assume you're using toasts

const IPFS_BASE_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
  "https://gateway.pinata.cloud/ipfs/";

export default function DetailClient({ Data, DonationsData }) {
  // Renamed component
  const [mydonations, setMyDonations] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(""); // Changed to empty string for number input
  const [change, setChange] = useState(false); // --- FETCH DESCRIPTION AND MY DONATIONS ---

  useEffect(() => {
    const Request = async () => {
      // 1. Wallet Setup (CRITICAL: FIX Ethers v5 syntax)
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const Web3Provider = new BrowserProvider(window.ethereum); // ✅ FIX: Ethers v6
      const signer = await Web3Provider.getSigner(); // ✅ FIX: Ethers v6 (await)
      const Address = await signer.getAddress();

      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const contract = new Contract(
        Data.address,
        Campaign.abi,
        provider // Use provider for read-only access (queryFilter)
      ); // 2. Fetch Description (using the CID)

      let descriptionData = "";
      try {
        const res = await fetch(IPFS_BASE_URL + Data.descriptionUrl);
        descriptionData = await res.text();
      } catch (e) {
        console.error("Failed to fetch description:", e);
      } // 3. Fetch My Donations

      const mydonationsFilter = contract.filters.donated(Address);
      const myAllDonations = await contract.queryFilter(mydonationsFilter);

      setMyDonations(
        myAllDonations.map((e) => ({
          donor: e.args.donar.toString(),
          amount: ethers.formatEther(e.args.amount),
          timestamp: Number(e.args.timestamp),
        }))
      );

      setDescription(descriptionData);
    };
    Request();
  }, [change, Data.descriptionUrl]); // Added Data.descriptionUrl to dependencies // --- DONATION FUNCTION ---

  const DonateFunds = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.warn("Please enter a valid amount to donate.");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new BrowserProvider(window.ethereum); // ✅ FIX: Ethers v6
      const signer = await provider.getSigner(); // ✅ FIX: Ethers v6 (await)

      const contract = new Contract(
        Data.address,
        Campaign.abi,
        signer // Use signer for writing transactions
      ); // Ethers v6: Use parseEther to convert readable amount (string) to Wei (BigInt)

      const transaction = await contract.donate({
        value: ethers.parseEther(amount), // ✅ FIX: Ethers v6 parseEther
      });

      toast.info("Sending Transaction...");
      await transaction.wait();
      toast.success("Donation confirmed!");

      setChange((prev) => !prev); // Toggle change to trigger useEffect refresh
      setAmount("");
    } catch (error) {
      console.error("Donation failed:", error);
      toast.error(
        `Donation Failed: ${error.reason || error.message || "Check console."}`
      );
    }
  };

  return (
    <DetailWrapper>
      <LeftContainer>
        <ImageSection>
          <Image
            fill={true}
            src={IPFS_BASE_URL + Data.image}
            alt="Image not available"
          />
        </ImageSection>
        <Text>{description}</Text>
      </LeftContainer>
      <RightContainer>
        <Title>{Data.title}</Title>
        <DonateSection>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            placeholder="Enter Amount"
          />
          <Donate onClick={DonateFunds}>Donate</Donate>
        </DonateSection>
        <FundsData>
          <Funds>
            <FundText>Required Amount</FundText>
            <FundText> {Data.requiredAmount} MATIC</FundText>
          </Funds>
          <Funds>
            <FundText>Received Amount</FundText>
            <FundText>{Data.receivedAmount} MATIC</FundText>
          </Funds>
        </FundsData>
        <Donated>
          {/* Ensure you map with key for both lists */}
          <LiveDonation>
            <DonationTitle>Recent Donation</DonationTitle>
            {DonationsData.map((e, i) => {
              return (
                <Donation key={`live-${i}`}>
                  <DonationData>
                    {e.donor.slice(0, 6)}...{e.donor.slice(39)}{" "}
                  </DonationData>
                  <DonationData> {e.amount} MATIC</DonationData>
                  <DonationData>
                    {new Date(e.timestamp * 1000).toLocaleString()}
                  </DonationData>
                </Donation>
              );
              //return <Donation key={`live-${i}`}>...</Donation>;
            })}
          </LiveDonation>
          <MyDonation>
            <DonationTitle>My Past Donation</DonationTitle>
            {mydonations.map((e, i) => {
              return (
                <Donation key={`my-${i}`}>
                  <DonationData>
                    {e.donor.slice(0, 6)}...{e.donor.slice(39)}{" "}
                  </DonationData>
                  <DonationData> {e.amount} MATIC</DonationData>
                  <DonationData>
                    {new Date(e.timestamp * 1000).toLocaleString()}
                  </DonationData>
                </Donation>
              );
              // return <Donation key={`my-${i}`}>...</Donation>;
            })}
          </MyDonation>
        </Donated>
      </RightContainer>
    </DetailWrapper>
  );
}

const DetailWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  width: 98%;
`;

const LeftContainer = styled.div`
  width: 45%;
`;

const RightContainer = styled.div`
  width: 50%;
`;

const ImageSection = styled.div`
  width: 100%;
  position: relative;
  height: 350px;
`;

const Text = styled.p`
  font-family: "Roboto";
  font-size: large;
  text-align: justify;
  color: ${(props) => props.theme.color};
`;

const Title = styled.h1`
  margin: 0;
  padding: 0;
  font-family: "Poppins";
  font-size: x-large;
  color: ${(props) => props.theme.color};
`;

const DonateSection = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
`;

const Input = styled.input`
  padding: 8px 15px;
  background-color: ${(props) => props.theme.bgDiv};
  color: ${(props) => props.theme.color};
  border: none;
  border-radius: 10px;
  outline: none;
  font-size: large;
  width: 40%;
  height: 40px;
`;

const Donate = styled.button`
  display: flex;
  justify-content: center;
  padding: 15px;
  width: 40%;
  color: white;
  background-color: #00b712;
  background-image: linear-gradient(180deg, #00b712 0%, #5aff15 80%);
  border: none;
  font-weight: bold;
  font-size: large;
  cursor: pointer;
`;

const FundsData = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  width: 100%;
`;

const Funds = styled.div`
  width: 45%;
  background-color: ${(props) => props.theme.bgDiv};
  padding: 8px;
  text-align: center;
  border-radius: 8px;
`;

const FundText = styled.p`
  margin: 2px;
  padding: 0;
  font-family: "Poppins";
  font-size: normal;
`;

const Donated = styled.div`
  height: 280px;
  margin-top: 15px;
  background-color: ${(props) => props.theme.bgDiv};
`;

const LiveDonation = styled.div`
  height: 65%;
  overflow-y: auto;
`;

const MyDonation = styled.div`
  height: 35%;
  overflow-y: auto;
`;

const DonationTitle = styled.div`
  font-family: "Roboto";
  font-size: x-small;
  text-transform: uppercase;
  padding: 4px;
  text-align: center;
  background-color: #4cd137;
`;

const Donation = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  padding: 4px 8px;
  background-color: ${(props) => props.theme.bgSubDiv};
`;

const DonationData = styled.p`
  margin: 0;
  padding: 0;
  font-family: "Roboto";
  font-size: large;
  color: ${(props) => props.theme.color};
`;
