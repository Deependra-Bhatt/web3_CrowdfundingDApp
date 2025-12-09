// src/utils/index.js

//  Utility function to shorten an Ethereum address for display.
export const shortenAddress = (address) => {
  if (!address) return "N/A";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

// Utility function to convert deadline to Unix
export const convertDeadlineToUnix = (dateTimeString) => {
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid deadline format.");
  }
  return Math.floor(date.getTime() / 1000);
};


// Utility to format time in seconds to a human-readable remaining time string.
export const formatTimeRemaining = (secondsRemaining) => {
  if (secondsRemaining <= 0) return "Deadline Passed";

  const totalSeconds = Math.max(0, secondsRemaining);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "< 1m";
};

/**
 * Converts an IPFS hash or path to a public HTTP gateway URL.
 * NOTE: This is a placeholder as imageURI is currently assumed to be a direct HTTP URL.
 * @param {string} ipfsUri The IPFS URI (e.g., ipfs://QmW...).
 * @returns {string} The HTTPS gateway URL.
 */
export const convertIPFSURIToHTTP = (ipfsURI, gatewayURL) => {
  if (ipfsURI && ipfsURI.startsWith("ipfs://")) {
    const cid = ipfsURI.replace("ipfs://", "");
    // Ensure the gateway URL ends in a slash or is structured correctly
    return `${
      gatewayURL.endsWith("/") ? gatewayURL.slice(0, -1) : gatewayURL
    }/ipfs/${cid}`;
  }
  return ipfsURI || "/default-campaign.png"; 
};

