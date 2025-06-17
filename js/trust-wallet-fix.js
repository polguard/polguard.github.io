// Trust Wallet Fix - This will run when the page loads
(function() {
    console.log("Trust Wallet fix loading...");
    
    // Function to check if we're running in Trust Wallet browser
    function isTrustWallet() {
        return (
            typeof window !== 'undefined' && 
            window.ethereum && 
            (window.ethereum.isTrust || 
             (window.ethereum.providers && 
              window.ethereum.providers.some(provider => provider.isTrust)))
        );
    }

    // Function to handle trust wallet detection
    function trustWalletSetup() {
        if (isTrustWallet()) {
            console.log("Trust Wallet browser detected");
            
            // Prioritize Trust Wallet's injected provider
            window.ethereum = window.ethereum.providers ? 
                window.ethereum.providers.find(provider => provider.isTrust) : 
                window.ethereum;
                
            // Save wallet type to localStorage
            localStorage.setItem("WALLET", "ethereum");
            
            // Make connect button work with Trust Wallet directly
            let connectBtnHandled = false;
            const connectBtn = document.getElementById('connectBtn');
            
            if (connectBtn && !connectBtnHandled) {
                connectBtnHandled = true;
                console.log("Setting up Trust Wallet connect button handler");
                
                const originalClick = connectBtn.onclick;
                connectBtn.onclick = function(e) {
                    if (isTrustWallet()) {
                        console.log("Using Trust Wallet direct connection");
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Connect directly to Trust Wallet provider
                        window.ethereum.request({ method: 'eth_requestAccounts' })
                            .then(function(accounts) {
                                console.log("Connected accounts: ", accounts);
                                // Use global walletChoosingObserver if available
                                if (typeof walletChoosingObserver === 'function') {
                                    walletChoosingObserver();
                                }
                            })
                            .catch(function(error) {
                                console.error("Trust Wallet connection error: ", error);
                                if (typeof showErrorPopup === 'function') {
                                    showErrorPopup("Trust Wallet Error", "Could not connect to Trust Wallet. Please try again.", 5000);
                                }
                            });
                        return false;
                    } else if (originalClick) {
                        return originalClick.call(this, e);
                    }
                };
            }
            
            // Fix for the invest button - ensure it works with Trust Wallet
            const investButton = document.getElementById('investButton');
            if (investButton) {
                const originalInvestClick = investButton.onclick;
                investButton.onclick = function(e) {
                    if (isTrustWallet()) {
                        // If user is not connected, show wallet selection
                        if (!window.ethereum.selectedAddress) {
                            console.log("User not connected, showing wallet selection");
                            if (typeof showWalletSelection === 'function') {
                                showWalletSelection();
                                return false;
                            }
                        } else {
                            console.log("User connected, proceeding with investment");
                            // Let the standard invest function handle it, as accounts are connected
                            // The event will be handled by the RxJS subscription in dapp.js
                        }
                    }
                };
            }
        }
    }

    // Run when DOM is fully loaded
    function initTrustWalletSupport() {
        // Run initial setup
        trustWalletSetup();
        
        // Set observer for dynamically added elements
        const observer = new MutationObserver(function(mutations) {
            trustWalletSetup();
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Run on document ready
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(initTrustWalletSupport, 100);
    } else {
        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(initTrustWalletSupport, 100);
        });
    }

    // Also run when window is fully loaded (for better compatibility)
    window.addEventListener('load', function() {
        setTimeout(initTrustWalletSupport, 100);
    });
})();
