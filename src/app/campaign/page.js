// // src/app/CampaignDetails/page.js

// "use client";
// import styled from "styled-components";
// import Image from "next/image";
// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import CampaignFactory from "../../../artifacts/contracts/Campaign.sol/CampaignFactory.json";
// import Campaign from "../../../artifacts/contracts/Campaign.sol/Campaign.json";

// const IPFS_BASE_URL =
//   process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
//   "https://gateway.pinata.cloud/ipfs/";

// export default function Detail({ Data, DonationsData }) {
//   const [mydonations, setMyDonations] = useState([]);
//   const [description, setDescription] = useState("");
//   const [amount, setAmount] = useState();
//   const [change, setChange] = useState(false);

//   useEffect(() => {
//     const Request = async () => {
//       let descriptionData;

//       await window.ethereum.request({ method: "eth_requestAccounts" });
//       const Web3Provider = new ethers.provider.Web3Provider(window.ethereum);
//       const signer = Web3Provider.getSigner();
//       const Address = await signer.getAddress();

//       const provider = new ethers.providers.JsonRpcProvider(
//         process.env.NEXT_PUBLIC_RPC_URL
//       );

//       const contract = new ethers.Contract(
//         Data.address,
//         Campaign.abi,
//         provider
//       );

//       fetch(IPFS_BASE_URL + Data.descriptionUrl)
//         .then((res) => res.text())
//         .then((data) => (descriptionData = data));

//       const mydonations = contract.filters.donated(Address);
//       const myAllDonations = await contract.queryFilter(mydonations);

//       setMyDonations(
//         myAllDonations.map((e) => {
//           return {
//             donor: e.args.donar,
//             amount: ethers.formatEther(e.args.amount),
//             timestamp: parseInt(e.args.timestamp),
//           };
//         })
//       );

//       setDescription(descriptionData);
//     };
//     Request();
//   }, [change]);

//   const DonateFunds = async () => {
//     try {
//       await window.ethereum.request({ method: "eth_requestAccounts" });

//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();

//       const contract = new ethers.Contract.apply(
//         Data.address,
//         Campaign.abi,
//         signer
//       );

//       const transaction = await contract.donate({
//         value: ethers.parseEther(amount),
//       });
//       await transaction.wait();

//       setChange(true);
//       setAmount("");
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   return (
//     <DetailWrapper>
// <LeftContainer>
//   <ImageSection>
//     <Image
//       fill={true}
//       src={IPFS_BASE_URL + Data.image}
//       alt="Image not available"
//     />
//   </ImageSection>
//   <Text>{description}</Text>
// </LeftContainer>
//       <RightContainer>
        // <Title>{Data.title}</Title>
        // <DonateSection>
        //   <Input
        //     value={amount}
        //     onChange={(e) => setAmount(e.target.value)}
        //     type="number"
        //     placeholder="Enter Amount"
        //   />
        //   <Donate onClick={DonateFunds}>Donate</Donate>
        // </DonateSection>
        // <FundsData>
        //   <Funds>
        //     <FundText>Required Amount</FundText>
        //     <FundText> {Data.requiredAmount} MATIC</FundText>
        //   </Funds>
        //   <Funds>
        //     <FundText>Received Amount</FundText>
        //     <FundText>{Data.receivedAmount} MATIC</FundText>
        //   </Funds>
        // </FundsData>
//         <Donated>
//           <LiveDonation>
//             <DonationTitle>Recent Donation</DonationTitle>
//             {DonationsData.map((e) => {
              // return (
              //   <Donation>
              //     <DonationData>
              //       {" "}
              //       {e.donor.slice(0, 6)}...{e.donor.slice(39)}{" "}
              //     </DonationData>
              //     <DonationData> {e.amount} MATIC</DonationData>
              //     <DonationData>
              //       {new Date(e.timestamp * 1000).toLocaleString()}
              //     </DonationData>
              //   </Donation>
              // );
//             })}
//           </LiveDonation>
//           <MyDonation>
//             <DonationTitle>My Past Donation</DonationTitle>
//             {mydonations.map((e) => {
//               return (
//                 <Donation>
//                   <DonationData>
//                     {" "}
//                     {e.donor.slice(0, 6)}...{e.donor.slice(39)}{" "}
//                   </DonationData>
//                   <DonationData> {e.amount} MATIC</DonationData>
//                   <DonationData>
//                     {new Date(e.timestamp * 1000).toLocaleString()}
//                   </DonationData>
//                 </Donation>
//               );
//             })}
//           </MyDonation>
//         </Donated>
//       </RightContainer>
//     </DetailWrapper>
//   );
// }

// export async function getStaticPaths() {
//   const provider = new ethers.providers.JsonRpcProvider(
//     process.env.NEXT_PUBLIC_RPC_URL
//   );

//   const contract = new ethers.Contract(
//     process.env.NEXT_PUBLIC_ADDRESS,
//     CampaignFactory.abi,
//     provider
//   );

//   const getAllCampaigns = contract.filters.campaignCreated();
//   const allCampaigns = await contract.queryFilter(getAllCampaigns);

//   return {
//     paths: allCampaigns.map((e) => ({
//       params: { address: e.args.campaignAddress.toString() },
//     })),
//     fallback: "blocking",
//   };
// }

// export async function getStaticProps(context) {
//   const provider = new ethers.providers.JsonRpcProvider(
//     process.env.NEXT_PUBLIC_RPC_URL
//   );

//   const contract = new ethers.Contract(
//     process.env.NEXT_PUBLIC_ADDRESS,
//     CampaignFactory.abi,
//     provider
//   );

//   const title = await contract.title();
//   const requiredAmount = await contract.requiredAmount();
//   const image = await contract.image();
//   const descriptionUrl = await contract.story();
//   const owner = await contract.owner();
//   const receivedAmount = await contract.receivedAmount();
//   const donations = contract.filters.donated();
//   const allDonations = await contract.queryFilter(donations);

//   const Data = {
//     address: context.params.address,
//     title,
//     requiredAmount: ethers.formatEther(requiredAmount),
//     image,
//     receivedAmount: ethers.formatEther(receivedAmount),
//     descriptionUrl,
//     owner,
//   };

//   const DonationsData = allDonations.map((e) => {
//     return {
//       donor: e.args.donar,
//       amount: ethers.formatEther(e.args.amount),
//       timestamp: parseInt(e.args.timestamp),
//     };
//   });

//   return {
//     props: { Data, DonationsData },
//   };
// }

// const DetailWrapper = styled.div`
//   display: flex;
//   justify-content: space-between;
//   padding: 20px;
//   width: 98%;
// `;

// const LeftContainer = styled.div`
//   width: 45%;
// `;

// const RightContainer = styled.div`
//   width: 50%;
// `;

// const ImageSection = styled.div`
//   width: 100%;
//   position: relative;
//   height: 350px;
// `;

// const Text = styled.p`
//   font-family: "Roboto";
//   font-size: large;
//   text-align: justify;
//   color: ${(props) => props.theme.color};
// `;

// const Title = styled.h1`
//   margin: 0;
//   padding: 0;
//   font-family: "Poppins";
//   font-size: x-large;
//   color: ${(props) => props.theme.color};
// `;

// const DonateSection = styled.div`
//   display: flex;
//   width: 100%;
//   align-items: center;
//   justify-content: space-between;
//   margin-top: 10px;
// `;

// const Input = styled.input`
//   padding: 8px 15px;
//   background-color: ${(props) => props.theme.bgDiv};
//   color: ${(props) => props.theme.color};
//   border: none;
//   border-radius: 10px;
//   outline: none;
//   font-size: large;
//   width: 40%;
//   height: 40px;
// `;

// const Donate = styled.button`
//   display: flex;
//   justify-content: center;
//   padding: 15px;
//   width: 40%;
//   color: white;
//   background-color: #00b712;
//   background-image: linear-gradient(180deg, #00b712 0%, #5aff15 80%);
//   border: none;
//   font-weight: bold;
//   font-size: large;
//   cursor: pointer;
// `;

// const FundsData = styled.div`
//   display: flex;
//   justify-content: space-between;
//   margin-top: 10px;
//   width: 100%;
// `;

// const Funds = styled.div`
//   width: 45%;
//   background-color: ${(props) => props.theme.bgDiv};
//   padding: 8px;
//   text-align: center;
//   border-radius: 8px;
// `;

// const FundText = styled.p`
//   margin: 2px;
//   padding: 0;
//   font-family: "Poppins";
//   font-size: normal;
// `;

// const Donated = styled.div`
//   height: 280px;
//   margin-top: 15px;
//   background-color: ${(props) => props.theme.bgDiv};
// `;

// const LiveDonation = styled.div`
//   height: 65%;
//   overflow-y: auto;
// `;

// const MyDonation = styled.div`
//   height: 35%;
//   overflow-y: auto;
// `;

// const DonationTitle = styled.div`
//   font-family: "Roboto";
//   font-size: x-small;
//   text-transform: uppercase;
//   padding: 4px;
//   text-align: center;
//   background-color: #4cd137;
// `;

// const Donation = styled.div`
//   display: flex;
//   justify-content: space-between;
//   margin-top: 4px;
//   padding: 4px 8px;
//   background-color: ${(props) => props.theme.bgSubDiv};
// `;

// const DonationData = styled.p`
//   margin: 0;
//   padding: 0;
//   font-family: "Roboto";
//   font-size: large;
//   color: ${(props) => props.theme.color};
// `;
