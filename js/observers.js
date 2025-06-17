const from  = rxjs.from
const takeUntil = rxjs.takeUntil
const Web3Modal = window.Web3Modal.default;
let isAuth=0;
var WalletConnectProvider = window.WalletConnectProvider.default;
const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        bridge: "https://bridge.walletconnect.org",
        rpc: {
            56: "https://bsc-dataseed.binance.org/",
            "56": "https://bsc-dataseed.binance.org/",
            0x38: "https://bsc-dataseed.binance.org/",
            "0x38": "https://bsc-dataseed.binance.org/"
        },
        chainId: 56,
        network: "binance",
        networkId: 56,
        qrcodeModalOptions: {
            mobileLinks: [
                "metamask",
                "trust",
                "rainbow",
                "argent",
                "imtoken",
                "pillar",
                "safepal"
            ]
        }
      }
    }
}

// Explicitly check for Trust Wallet's injected provider
if (typeof window !== 'undefined' && window.ethereum && window.ethereum.isTrust) {
    console.log("Trust Wallet detected");
    providerOptions["injected"] = {
        display: {
            name: "Trust Wallet",
            description: "Connect using Trust Wallet browser"
        },
        package: null
    };
}

const anyProviderObserver =
     async() => {
        try {
            provider=new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/');
            const providerWrapper = new ethers.providers.Web3Provider(provider)
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, providerWrapper)
            setGlobalStatisticsEvents(contract)
        }
        catch(Exception){
            console.log(Exception)
        }
        finally {
            onNoWalletsConnected()
        }        
    }

const walletChoosingObserver = async() => {
    try {
        web3Modal = new Web3Modal({
            network: "binance", // replace mainnet to binance
            providerOptions, // required
        });
        provider = await web3Modal.connect();
        console.log(provider);
        const providerWrapper = new ethers.providers.Web3Provider(provider);
        const signer = providerWrapper.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        const accountsChangeObservable = accountsChangeObservableFactory(provider);
        accountsChangeObservable.subscribe(accounts => setPersonalStatisticsEvents(providerWrapper, contract, accounts[0]));
        const requestAccountObservable = from(requestAccounts(provider)).pipe(takeUntil(accountsChangeObservable));
        requestAccountObservable.subscribe(accounts => setPersonalStatisticsEvents(providerWrapper, contract, accounts[0]));
        setGlobalStatisticsEvents(contract);
    }
    catch(Exception) {
        console.log(Exception);
        showErrorPopup("Wallet Connection Failed", "Failed to connect to wallet. Please try again.", 5000);
    }
}
