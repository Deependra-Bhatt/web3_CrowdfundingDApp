// src/app/HomePage.js

"use client";
import styled from "styled-components";
import { FilterAlt, AccountBox, Paid, Event } from "@mui/icons-material";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Update this to your Pinata URL or your environment variable
const IPFS_BASE_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
  "https://gateway.pinata.cloud/ipfs/";

export default function HomePage({
  allData,
  healthData,
  educationData,
  animalData,
}) {
  const router = useRouter();
  const [filter, setFilter] = useState(allData); // The rest of your JSX and styled components remain unchanged...

  return (
    <HomeWrapper>
      {/* Filter Section*/}
      <FilterWrapper>
        <FilterAlt style={{ fontSize: 40 }} />
        <Category onClick={() => setFilter(allData)}>All</Category>
        <Category onClick={() => setFilter(healthData)}>Health</Category>
        <Category onClick={() => setFilter(educationData)}>Education</Category>
        <Category onClick={() => setFilter(animalData)}>Animal</Category>
        {/* Added All filter */}
      </FilterWrapper>
      {/*Cards Container*/}
      <CardsWrapper>
        {/*Cards*/}
        {filter.map((e, i) => {
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
}

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 80%;
  margin-top: 15px;
`;

const Category = styled.div`
  padding: 10px 15px;
  background-color: ${(props) => props.theme.bgDiv};
  margin: 0 15px;
  border-radius: 10px;
  font-family: "Poppins";
  font-weight: normal;
  cursor: pointer;
  &:hover {
    color: white;
    background-color: rgba(5, 5, 0, 0.5);
  }
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
