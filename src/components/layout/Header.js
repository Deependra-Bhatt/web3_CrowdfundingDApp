// crowdfunding-app-prototype\src\components\layout\Header.js

import styled from "styled-components";
import HeaderLogo from "./components/HeaderLogo";
import HeaderNav from "./components/HeaderNav";
import HeaderRight from "./components/HeaderRight";

const Header = () => {
  return (
    <HeaderWrapper>
      <HeaderLogo />
      <HeaderNav />
      <HeaderRight />
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.div`
  width: 100%;
  height: 70px;
  border: 2px solid red;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default Header;
