// //crowdfunding-app-prototype\src\components\layout\components\Wallet.js

"use client"; // CRITICAL: Required for using React hooks (useState) and browser APIs (window.ethereum)

import styled from "styled-components";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
// Removed: import { Balance } from "@mui/icons-material"; -> Unused and unnecessarily capitalizes a value.

const AMOY_CHAIN_ID_HEX = `0x${Number(80002).toString(16)}`;

const networks = {
  polygon: {
    chainId: AMOY_CHAIN_ID_HEX,
    chainName: "Polygon Amoy Testnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    // Using an official, reliable RPC URL
    rpcUrls: ["https://rpc-amoy.polygon.technology/"],
    blockExplorerUrls: ["https://amoy.polygonscan.com/"],
  },
};

const Wallet = () => {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    setError(null);
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask or a compatible wallet extension is required.");
      console.error("Wallet Not Installed.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Request accounts to connect
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // 2. Instantiate Ethers v6 Provider
      // CORRECTED: Use ethers.BrowserProvider directly (not ethers.providers.BrowserProvider)
      const provider = new ethers.BrowserProvider(window.ethereum, "any");

      // 3. Check and enforce the correct network (Amoy)
      const { chainId: currentChainId } = await provider.getNetwork();

      // Compare BigInt or ensure the hex strings match
      if (currentChainId !== BigInt(80002)) {
        try {
          // Attempt to switch networks
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: networks.polygon.chainId }],
          });
        } catch (switchError) {
          // 4902 is the error code for "chain not added"
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [networks.polygon],
            });
          } else {
            // User rejected the switch or another error occurred
            setError("Please switch to Polygon Amoy Testnet manually.");
            setIsLoading(false);
            return;
          }
        }
      }

      // 4. Get Signer and Address
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();
      setAddress(currentAddress);

      // 5. Get Balance
      const rawBalance = await provider.getBalance(currentAddress);

      // CORRECTED: Use ethers.formatEther directly for Ethers v6
      const formattedBalance = ethers.formatEther(rawBalance);
      setBalance(formattedBalance);
    } catch (e) {
      console.error("Wallet operation failed:", e);
      // Handle cases where the user rejects the connection request
      if (e.code === 4001) {
        setError("Connection rejected by user.");
      } else {
        setError(`Connection failed: ${e.message.slice(0, 50)}...`);
      }
      setAddress("");
      setBalance("");
    } finally {
      setIsLoading(false);
    }
  };

  // Use a shorter version of the balance for the UI display
  const displayBalance = balance
    ? `${parseFloat(balance).toFixed(4)} MATIC`
    : "";

  // Use a shorter version of the address for the UI display
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Connect Wallet";

  return (
    <ConnectWalletWrapper
      onClick={address ? null : connectWallet}
      disabled={isLoading}
    >
      {isLoading ? (
        <LoadingText>Connecting...</LoadingText>
      ) : (
        <>
          <BalanceWrapper>{displayBalance}</BalanceWrapper>
          <Address>{error || displayAddress}</Address>
        </>
      )}
    </ConnectWalletWrapper>
  );
};

const ConnectWalletWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Assuming theme variables are passed via ThemeProvider */
  background-color: ${(props) => props.theme.bgDiv || "#E0E0E0"};
  height: 100%;
  padding: 5px 9px;
  color: ${(props) => props.theme.color || "#333333"};
  border-radius: 10px;
  margin-right: 15px;
  font-family: "Roboto", sans-serif;
  font-weight: bold;
  font-size: small;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: opacity 0.3s;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};

  &:hover {
    opacity: ${(props) => (props.disabled ? 0.6 : 0.9)};
  }
`;

const Address = styled.h2`
  background-color: ${(props) => props.theme.bgSubDiv || "#CCCCCC"};
  height: 100%;
  display: flex;
  align-items: center; /* Corrected typo from align-itmes */
  justify-content: center;
  padding: 0 8px;
  border-radius: 6px; /* Slightly smaller radius for sub-div */
  font-size: 0.8rem;
  line-height: 1; /* Ensure text fits */
  margin: 0;
`;

const BalanceWrapper = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin-right: 10px;
  font-size: 0.8rem;
  line-height: 1;
  margin: 0;
`;

const LoadingText = styled.div`
  padding: 0 10px;
  font-style: italic;
  color: ${(props) => props.theme.color || "#333333"};
`;

export default Wallet;

// OLDER VERSION

// import styled from "styled-components";
// import { ethers } from "ethers";
// import { useState } from "react";
// import { Balance } from "@mui/icons-material";

// const networks = {
//   polygon: {
//     chainId: `0x${Number(80002).toString(16)}`,
//     chainName: "Polygon Amoy Testnet",
//     nativeCurrency: {
//       name: "MATIC",
//       symbol: "MATIC",
//       decimals: 18,
//     },
//     rpcUrls: ["https://rpc-amoy.polygon.technology/"],
//     blockExplorerUrls: ["https://amoy.polygonscan.com/"],
//   },
// };

// const Wallet = () => {
//   const [address, setAddress] = useState("");
//   const [balance, setBalance] = useState("");

//   const connectWallet = async () => {
//     await window.ethereum.request({ method: "eth_requestAccounts" });
//     const provider = new ethers.providers.BrowserProvider(
//       window.ethereum,
//       "any"
//     );
//     if (provider.network !== "matic") {
//       await window.ethereum.request({
//         method: "wallet_addEthereumChain",
//         params: [
//           {
//             ...networks["polygon"],
//           },
//         ],
//       });

//       const account = await provider.getSigner();
//       const Address = await account.getAddress();
//       setAddress(Address);
//       const Balance = ethers.utils.formatEther(await account.getBalance());
//       setBalance(Balance);
//     }
//   };

//   return (
//     <ConnectWalletWrapper onClick={connectWallet}>
//       {balance === "" ? (
//         <BalanceWrapper></BalanceWrapper>
//       ) : (
//         <BalanceWrapper>{balance.slice(0, 4)} Matic</BalanceWrapper>
//       )}

//       {address === "" ? (
//         <Address>Connect Wallet</Address>
//       ) : (
//         <Address>
//           {address.slice(0, 6)}...{address.slice(39)}
//         </Address>
//       )}
//     </ConnectWalletWrapper>
//   );
// };

// const ConnectWalletWrapper = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   background-color: ${(props) => props.theme.bgDiv};
//   height: 100%;
//   padding: 5px 9px;
//   color: ${(props) => props.theme.color};
//   border-radius: 10px;
//   margin-right: 15px;
//   font-family: "Roboto";
//   font-weight: bold;
//   font-size: small;
// `;

// const Address = styled.h2`
//   background-color: ${(props) => props.theme.bgSubDiv};
//   height: 100%;
//   display: flex;
//   align-itmes: center;
//   justify-content: center;
//   padding: 0 3px;
//   border-radius: 10px;
// `;

// const BalanceWrapper = styled.h2`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   height: 100%;
//   margin-right: 5px;
// `;

// export default Wallet;
