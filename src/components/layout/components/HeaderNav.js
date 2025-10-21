//crowdfunding-app-prototype\src\components\layout\components\HeaderNav.js

import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HeaderNav = () => {
  const pathname = usePathname();
  return (
    <HeaderNavWrapper>
      <Link href={"/"}>
        <HeaderNavLinks $active={pathname === "/" ? true : false}>
          Campaigns
        </HeaderNavLinks>
      </Link>
      <Link href={"/CreateCampaign"}>
        <HeaderNavLinks
          active={pathname === "/CreateCampaign" ? true : false}
        >
          Create Campaign
        </HeaderNavLinks>
      </Link>
      <Link href={"/Dashboard"}>
        <HeaderNavLinks
          active={pathname === "/Dashboard" ? true : false}
        >
          Dashboard
        </HeaderNavLinks>
      </Link>
    </HeaderNavWrapper>
  );
};

const HeaderNavWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.bgDiv};
  padding: 6px;
  height: 50%;
  border-radius: 10px;
`;

const HeaderNavLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  font-family: "Roboto";
  height: 100%;
  margin: 7px;
  background-color: ${(props) =>
    props.active ? props.theme.bgSubDiv : props.theme.bgDiv};
  padding: 0 5px;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: bold;
  font-size: small;
`;

export default HeaderNav;
