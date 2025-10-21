//crowdfunding-app-prototype\src\components\layout\components\HeaderRight.js

import styled from "styled-components";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { App } from "../Layout";
import { useContext } from "react";
import Wallet from "./Wallet";

const HeaderRight = () => {
  const ThemeToggler = useContext(App);

  return (
    <HeaderRightWrapper>
      <Wallet />
      <ThemeToggle>
        {ThemeToggler.theme === "light" ? (
          <DarkModeIcon onClick={ThemeToggler.changeTheme} />
        ) : (
          <LightModeIcon onClick={ThemeToggler.changeTheme} />
        )}
      </ThemeToggle>
    </HeaderRightWrapper>
  );
};

const HeaderRightWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  height: 50%;
`;

const ThemeToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.bgDiv};
  height: 100%;
  padding: 5px;
  width: 40px;
  border-radius: 10px;
`;

export default HeaderRight;
