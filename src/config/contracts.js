// Dynamic contract address and ABI loader for KDEx
// Fetches deployed addresses and ABIs from Hardhat build artifacts

export const NETWORK_CONFIG = {
  chainId: import.meta.env.VITE_CHAIN_ID,
  chainIdDecimal: parseInt(import.meta.env.VITE_CHAIN_ID_DECIMAL),
  rpcUrl: import.meta.env.VITE_RPC_URL,
  name: import.meta.env.VITE_NETWORK_NAME,
  currency: {
    name: import.meta.env.VITE_CURRENCY_NAME,
    symbol: import.meta.env.VITE_CURRENCY_SYMBOL,
    decimals: parseInt(import.meta.env.VITE_CURRENCY_DECIMALS),
  },
  environment: import.meta.env.VITE_ENVIRONMENT,
  debug: import.meta.env.VITE_DEBUG === 'true',
};

// Load contract ABIs from Hardhat artifacts
export const loadContractABIs = async () => {
  try {
    console.log('📜 Loading contract ABIs...');

    const [tokenArtifact, exchangeArtifact] = await Promise.all([
      fetch('/artifacts/contracts/Token.sol/Token.json').then(r => r.json()),
      fetch('/artifacts/contracts/Exchange.sol/Exchange.json').then(r => r.json())
    ]);

    const abis = {
      Token: tokenArtifact.abi,
      Exchange: exchangeArtifact.abi,
    };

    console.log('✅ Contract ABIs loaded');
    return abis;

  } catch (error) {
    console.error('❌ Failed to load contract ABIs:', error);
    console.error('💡 Make sure Hardhat contracts are compiled: npx hardhat compile');
    return null;
  }
};

export const loadContractAddresses = async () => {
  try {
    console.log('📄 Loading contract addresses...');

    // Fetch the deployed addresses from Hardhat Ignition
    const response = await fetch('/ignition/deployments/chain-31337/deployed_addresses.json');

    if (!response.ok) {
      throw new Error(`Failed to fetch addresses: ${response.status} ${response.statusText}`);
    }

    const deployed = await response.json();
    console.log('Raw deployed addresses:', deployed);

    const addresses = {
      KDEX: deployed["KDExEcosystemModule#KDEX"],
      mUSDT: deployed["KDExEcosystemModule#mUSDT"],
      mUSDC: deployed["KDExEcosystemModule#mUSDC"],
      mETH: deployed["KDExEcosystemModule#mETH"],
      Exchange: deployed["KDExEcosystemModule#KDEXe"],
    };

    // Validate all addresses are present
    const missingAddresses = Object.entries(addresses)
      .filter(([name, address]) => !address)
      .map(([name]) => name);

    if (missingAddresses.length > 0) {
      throw new Error(`Missing contract addresses: ${missingAddresses.join(', ')}`);
    }

    console.log('✅ Contract addresses loaded:', addresses);
    return addresses;

  } catch (error) {
    console.error('❌ Failed to load contract addresses:', error);

    // Provide helpful error message
    if (error.message.includes('Failed to fetch')) {
      console.error('💡 Make sure:');
      console.error('  1. Hardhat node is running: npx hardhat node');
      console.error('  2. Contracts are deployed: npx hardhat ignition deploy ignition/modules/KDExEcosystem.js --network localhost');
      console.error('  3. Vite dev server can access the ignition folder');
    }

    return null;
  }
};

// Helper function to check if MetaMask is available
export const checkMetaMaskAvailability = () => {
  if (typeof window.ethereum !== 'undefined') {
    console.log('✅ MetaMask detected');
    return true;
  } else {
    console.error('❌ MetaMask not found. Please install MetaMask extension.');
    return false;
  }
};

// Helper function to connect to the correct network
export const ensureCorrectNetwork = async () => {
  if (!checkMetaMaskAvailability()) return false;

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    if (chainId !== NETWORK_CONFIG.chainId) {
      console.log(`🔄 Switching to Hardhat network (current: ${chainId})`);

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
        console.log('✅ Switched to Hardhat network');
        return true;
      } catch (switchError) {
        // Network not added to MetaMask, try to add it
        if (switchError.code === 4902) {
          console.log('➕ Adding Hardhat network to MetaMask...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: NETWORK_CONFIG.chainId,
              chainName: NETWORK_CONFIG.name,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              nativeCurrency: NETWORK_CONFIG.currency,
            }],
          });
          console.log('✅ Hardhat network added to MetaMask');
          return true;
        }
        throw switchError;
      }
    }

    console.log('✅ Already on correct network');
    return true;

  } catch (error) {
    console.error('❌ Network setup failed:', error);
    return false;
  }
};

// Comprehensive loader for all blockchain data
export const loadBlockchainConfig = async () => {
  try {
    console.log('🔧 Loading complete blockchain configuration...');

    // Load addresses and ABIs in parallel
    const [addresses, abis] = await Promise.all([
      loadContractAddresses(),
      loadContractABIs()
    ]);

    if (!addresses || !abis) {
      throw new Error('Failed to load addresses or ABIs');
    }

    // Get current network info from MetaMask
    const [chainId, networkVersion] = await Promise.all([
      window.ethereum.request({ method: 'eth_chainId' }),
      window.ethereum.request({ method: 'net_version' })
    ]);

    const config = {
      addresses,
      abis,
      network: {
        chainId,
        chainIdDecimal: parseInt(chainId, 16),
        networkVersion,
        isHardhat: chainId === NETWORK_CONFIG.chainId,
      }
    };

    console.log('✅ Complete blockchain config loaded:', config);
    return config;

  } catch (error) {
    console.error('❌ Failed to load blockchain config:', error);
    return null;
  }
};
