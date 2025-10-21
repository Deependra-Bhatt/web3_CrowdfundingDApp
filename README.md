Here is an updated and comprehensive `README.md` for your Crowdfunding DApp project, explaining the technology and setup process.

---

# 💰 CrowdFund DApp Prototype

## 🌟 Project Overview

This Crowdfunding Decentralized Application (DApp) is a full-stack prototype built on the **Polygon Amoy Testnet** that allows users to create campaigns and donate funds. It utilizes modern web technologies (React/Next.js) for the frontend and Ethers.js for secure, direct interaction with the Ethereum Virtual Machine (EVM).

### Key Features

- **Decentralized Campaign Creation:** Users can deploy new campaign contracts via a factory contract on the Polygon Amoy Testnet.
- **Secure File Upload:** Campaign images and stories are stored immutably on the IPFS network using the Pinata service.
- **Wallet Integration:** Seamless connection and transaction signing via MetaMask (Ethers.js).
- **Dynamic Data Fetching:** Campaign details and donation history are fetched directly from the blockchain (event logs and contract state).

---

## 💻 Technology Stack

| Category                  | Technology                         | Purpose                                                                                                      |
| :------------------------ | :--------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Frontend**              | **Next.js 15.5.4** (App Router)    | React framework for server-side rendering (SSR) and client-side interactivity.                               |
| **Styling**               | **Styled-Components**              | Component-level CSS-in-JS styling.                                                                           |
| **Blockchain Client**     | **Ethers.js v6**                   | Library for connecting to the Polygon RPC node, handling transactions, and reading contract data.            |
| **Smart Contracts**       | **Solidity** / **Hardhat**         | Language for the `CampaignFactory` and `Campaign` contracts, and the environment for development/deployment. |
| **Decentralized Storage** | **Pinata**                         | Gateway service used to pin campaign images and descriptions to the IPFS network.                            |
| **UI/UX**                 | **React-Toastify** & **MUI Icons** | Notifications, loading spinners, and vector icons.                                                           |

---

## ⚙️ Setup and Installation

### Prerequisites

1.  **Node.js:** (v18+)
2.  **MetaMask:** Installed and connected to the **Polygon Amoy Testnet (Chain ID: 80002)**.
3.  **MATIC:** Obtain testnet MATIC from an Amoy Faucet.

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone [YOUR_REPO_URL] crowdfunding-app-prototype
cd crowdfunding-app-prototype

# Install Node modules
npm install
```

### Step 2: Configure Environment Variables

Create a file named **`.env.local`** in the root directory of your project and add the following configuration.

| Variable                        | Source / Value                                       | Purpose                                                    |
| :------------------------------ | :--------------------------------------------------- | :--------------------------------------------------------- |
| `NEXT_PUBLIC_RPC_URL`           | Your **Infura** or **Alchemy** Polygon Amoy RPC URL. | Required for the Server Component to read blockchain data. |
| `NEXT_PUBLIC_PINATA_API_KEY`    | Your Pinata API Key.                                 | Required for authenticating file uploads.                  |
| `NEXT_PUBLIC_PINATA_API_SECRET` | Your Pinata API Secret.                              | Required for authenticating file uploads.                  |
| `NEXT_PUBLIC_ADDRESS`           | **Obtained after deployment** (See Step 3).          | Address of the deployed `CampaignFactory` contract.        |

### Step 3: Deploy Smart Contracts

You must compile and deploy your contracts to get the Factory Address (`NEXT_PUBLIC_ADDRESS`).

1.  **Compile Contracts:**
    ```bash
    npx hardhat compile
    ```
2.  **Deploy to Amoy:** (Ensure your `hardhat.config.js` is correctly set up for the `amoy` network.)
    ```bash
    npx hardhat run scripts/deploy.js --network amoy
    ```
3.  **Update `.env.local`:** Copy the address printed in the console (the deployed `CampaignFactory` address) and paste it as the value for `NEXT_PUBLIC_ADDRESS`.

### Step 4: Run the Application

Start the development server:

```bash
npm run dev
```

Open your browser to [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the application.

---

## 📝 Usage and Routes

| Page                      | Description               | Interaction                                                      |
| :------------------------ | :------------------------ | :--------------------------------------------------------------- |
| **`/`**                   | Home Page / All Campaigns | Reads `campaignCreated` events from the Factory contract.        |
| **`/CreateCampaign`**     | Campaign Submission Form  | Uses the Factory contract to deploy a new campaign instance.     |
| **`/Dashboard`**          | My Campaigns              | Filters events by the connected wallet's address (`msg.sender`). |
| **`/campaign/[address]`** | Dynamic Campaign Details  | Reads the state of a single deployed `Campaign` contract.        |

_(The remaining sections below are carried over from the original Next.js template.)_

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome\!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
