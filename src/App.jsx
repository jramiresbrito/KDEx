import { useEffect } from "react";
import "./App.css";
import {
  checkMetaMaskAvailability,
  ensureCorrectNetwork,
  loadBlockchainConfig,
  NETWORK_CONFIG,
} from "./config/contracts";

function App() {
  const loadBlockchainData = async () => {
    try {
      console.log("🚀 Loading blockchain data...");

      // Check MetaMask availability
      if (!checkMetaMaskAvailability()) {
        return;
      }

      // Ensure correct network
      const networkOk = await ensureCorrectNetwork();
      if (!networkOk) {
        return;
      }

      // Load complete blockchain configuration
      const blockchainConfig = await loadBlockchainConfig();
      if (!blockchainConfig) {
        return;
      }

      console.log("📋 Complete Blockchain Configuration:");
      console.log("- Addresses:", blockchainConfig.addresses);
      console.log("- ABIs:", blockchainConfig.abis);
      console.log("- Network Info:", blockchainConfig.network);
      console.log("- Expected Network:", NETWORK_CONFIG);

      // Connect to MetaMask
      const userAccounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("👥 Connected accounts:", userAccounts);

      // Log current account ETH balance
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [userAccounts[0], "latest"],
      });
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
      console.log(`💰 Current account ETH balance: ${ethBalance}`);

      console.log("✅ Blockchain data loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load blockchain data:", error);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      {/* Navbar */}

      <main className="exchange grid">
        <section className="exchange__section--left grid">
          {/* Markets */}

          {/* Balance */}

          {/* Order */}
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}
    </div>
  );
}

export default App;
