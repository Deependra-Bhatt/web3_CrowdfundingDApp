// src/app/Dashboard/page.js

"use client";
import styled from "styled-components";
import { AccountBox, Paid, Event } from "@mui/icons-material";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers, BrowserProvider, Contract } from "ethers";
import CampaignFactory from "../../../artifacts/contracts/Campaign.sol/CampaignFactory.json";

// Update this to your Pinata URL or your environment variable
const IPFS_BASE_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
  "https://gateway.pinata.cloud/ipfs/";

const DashboardPage = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    try {
      const Request = async () => {
        // 1. Wallet Setup (CRITICAL: FIX Ethers v5 syntax)
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const Web3Provider = new BrowserProvider(window.ethereum); // ✅ FIX: Ethers v6
        const signer = await Web3Provider.getSigner(); // ✅ FIX: Ethers v6 (await)
        const Address = await signer.getAddress();

        // 1. Initialize the Provider using ONLY the URL.
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL
        );

        // 2. CRITICAL STEP: Fetch the network explicitly. This makes the provider aware of the network,
        // often settling the configuration before the Contract object checks it.
        const network = await provider.getNetwork();

        // 3. Contract Setup: Pass the provider
        const contract = new Contract(
          process.env.NEXT_PUBLIC_ADDRESS,
          CampaignFactory.abi,
          provider
        );

        //To get All Campaigns
        const getAllCampaigns = contract.filters.campaignCreated(
          null,
          null,
          Address
        );
        const allCampaigns = await contract.queryFilter(
          getAllCampaigns,
          0,
          "latest"
        );
        const allData = allCampaigns.map((e) => {
          const requiredAmountEth = ethers.formatEther(e.args.requiredAmount);

          return {
            title: e.args.title,
            requiredAmount: Number(requiredAmountEth),
            image: e.args.campaignImage,
            owner: e.args.owner,
            timeStamp: Number(e.args.timestamp),
            category: e.args.category.toString(),
            campaignAddress: e.args.campaignAddress,
          };
        });
        setCampaigns(allData);
      };
      Request();
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <HomeWrapper>
      {/*Cards Container*/}
      <CardsWrapper>
        {/*Cards*/}
        {campaigns.map((e, i) => {
          return (
            <Card key={e.campaignAddress || i}>
              {" "}
              <CardImg>
                <Image
                  alt={e.title}
                  fill={true} // Use 'fill' instead of 'layout="fill"' in Next.js 13+
                  src={IPFS_BASE_URL + e.image}
                />
              </CardImg>
              <Title>{e.title}</Title>
              <CardData>
                <Text>
                  <AccountBox />
                </Text>
                <Text>
                  {e.owner.slice(0, 6)}...{e.owner.slice(-4)}
                </Text>
              </CardData>
              <CardData>
                <Text>
                  <Paid />
                </Text>
                <Text>{e.requiredAmount} MATIC</Text>
              </CardData>
              <CardData>
                <Text>
                  <Event />
                </Text>
                <Text>{new Date(e.timeStamp * 1000).toLocaleDateString()}</Text>
              </CardData>
              <Button
                onClick={() => router.push(`/campaign/${e.campaignAddress}`)}
              >
                Go To Campaign
              </Button>
            </Card>
          );
        })}
      </CardsWrapper>
    </HomeWrapper>
  );
};

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const CardsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 80%;
  margin-top: 25px;
`;

const Card = styled.div`
  width: 30%;
  margin-top: 20px;
  background-color: ${(props) => props.theme.bgDiv};
  &:hover {
    transform: translateY(-10px);
    transition: transform 0.5s;
  }
  &:not(:hover) {
    transition: transform 0.5s;
  }
`;

const CardImg = styled.div`
  position: relative;
  height: 120px;
  width: 100%;
`;

const Title = styled.h2`
  font-family: "Roboto";
  font-size: 18px;
  margin: 2px 0;
  background-color: ${(props) => props.theme.bgSubDiv};
  padding: 5px;
  font-weight: normal;
  cursor: pointer;
`;

const CardData = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: ${(props) => props.theme.bgSubDiv};
  margin: 2px 0;
  padding: 5px;
  cursor: pointer;
`;

const Text = styled.p`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  font-family: "Roboto";
  font-size: 18px;
  font-weight: bold;
`;

const Button = styled.div`
  padding: 8px;
  text-align: center;
  width: 100%;
  background-color: #00b712;
  background-image: linear-gradient(180deg, #00b712 0%, #5aff15 80%);
  border: none;
  cursor: pointer;
  font-family: "Roboto";
  text-transform: uppercase;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
`;

export default DashboardPage;
