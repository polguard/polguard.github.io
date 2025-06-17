// Transaction Feedback System
(function() {
    // Transaction states
    const TX_STATE = {
        PENDING: 'pending',
        SUCCESS: 'success',
        FAILED: 'failed'
    };

    // Default messages
    const DEFAULT_MESSAGES = {
        PENDING: {
            deposit: "Transaction in progress. Please wait while your investment is being processed.",
            withdraw: "Transaction in progress. Your funds are being withdrawn.",
            connect: "Connecting to your wallet. Please approve the connection request.",
            generic: "Transaction in progress. Please wait for confirmation."
        },
        SUCCESS: {
            deposit: "Investment successful! Your funds have been deposited.",
            withdraw: "Withdrawal successful! Your funds have been sent to your wallet.",
            connect: "Wallet connected successfully.",
            generic: "Transaction completed successfully!"
        },
        FAILED: {
            deposit: "Investment failed. Please try again.",
            withdraw: "Withdrawal failed. Please try again.",
            connect: "Wallet connection failed. Please try again.",
            generic: "Transaction failed. Please try again."
        }
    };

    // Create notification container if it doesn't exist
    function ensureNotificationContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                #notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    max-width: 350px;
                }
                
                .notification {
                    margin-bottom: 10px;
                    padding: 15px 20px;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    animation: slideIn 0.3s forwards;
                    position: relative;
                    color: white;
                    font-weight: 500;
                }
                
                .notification.pending {
                    background-color: #3498db;
                }
                
                .notification.success {
                    background-color: #2ecc71;
                }
                
                .notification.error {
                    background-color: #e74c3c;
                }
                
                .notification-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background-color: rgba(255, 255, 255, 0.5);
                    animation: progress 5s linear forwards;
                }
                
                .notification-close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    cursor: pointer;
                    font-size: 18px;
                    color: white;
                    opacity: 0.7;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                
                .transaction-icon {
                    display: inline-block;
                    margin-right: 10px;
                    vertical-align: middle;
                }
                
                .notification-content {
                    display: inline-block;
                    vertical-align: middle;
                    width: calc(100% - 35px);
                }
                
                .spinner {
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top: 2px solid white;
                    width: 18px;
                    height: 18px;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                    vertical-align: middle;
                    margin-right: 10px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        return container;
    }

    // Create a notification
    function createNotification(message, type, duration = 5000) {
        const container = ensureNotificationContainer();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = '';
        if (type === TX_STATE.PENDING) {
            icon = '<div class="spinner"></div>';
        } else if (type === TX_STATE.SUCCESS) {
            icon = '✅';
        } else if (type === TX_STATE.FAILED) {
            icon = '❌';
        }
        
        notification.innerHTML = `
            <span class="transaction-icon">${icon}</span>
            <div class="notification-content">${message}</div>
            <div class="notification-progress"></div>
            <span class="notification-close">×</span>
        `;
        
        container.appendChild(notification);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            container.removeChild(notification);
        });
        
        // Auto-remove after duration (except for pending notifications)
        if (type !== TX_STATE.PENDING) {
            setTimeout(() => {
                if (notification.parentNode === container) {
                    container.removeChild(notification);
                }
            }, duration);
        }
        
        return notification;
    }

    // Track active transactions
    const activeTransactions = new Map();

    // Start tracking a transaction
    function trackTransaction(txHash, type = 'generic') {
        const pendingMessage = DEFAULT_MESSAGES.PENDING[type] || DEFAULT_MESSAGES.PENDING.generic;
        const notification = createNotification(pendingMessage, TX_STATE.PENDING);
        
        activeTransactions.set(txHash, {
            notification,
            type,
            startTime: Date.now()
        });
        
        console.log(`Tracking transaction: ${txHash} (${type})`);
        return notification;
    }

    // Update transaction status
    function updateTransaction(txHash, status, customMessage = null) {
        if (!activeTransactions.has(txHash)) {
            console.warn(`Transaction ${txHash} not found in active transactions`);
            return null;
        }
        
        const { notification, type } = activeTransactions.get(txHash);
        
        if (notification.parentNode === null) {
            console.warn(`Notification for transaction ${txHash} no longer in DOM`);
            activeTransactions.delete(txHash);
            return null;
        }
        
        // Remove the old notification
        notification.parentNode.removeChild(notification);
        
        // Get appropriate message
        let message;
        if (customMessage) {
            message = customMessage;
        } else if (status === TX_STATE.SUCCESS) {
            message = DEFAULT_MESSAGES.SUCCESS[type] || DEFAULT_MESSAGES.SUCCESS.generic;
        } else {
            message = DEFAULT_MESSAGES.FAILED[type] || DEFAULT_MESSAGES.FAILED.generic;
        }
        
        // Create new notification with updated status
        const newNotification = createNotification(message, status);
        
        // If transaction is complete, remove from tracking
        if (status !== TX_STATE.PENDING) {
            activeTransactions.delete(txHash);
        }
        
        return newNotification;
    }

    // Patch wallet connection functions to add feedback
    function patchWalletConnections() {
        // Override showWalletSelection 
        if (typeof window.showWalletSelection === 'function') {
            const originalShowWalletSelection = window.showWalletSelection;
            window.showWalletSelection = function() {
                createNotification(DEFAULT_MESSAGES.PENDING.connect, TX_STATE.PENDING);
                return originalShowWalletSelection.apply(this, arguments);
            };
        }
        
        // Override the original function
        if (typeof window.walletChoosingObserver === 'function') {
            const originalWalletChooser = window.walletChoosingObserver;
            window.walletChoosingObserver = async function() {
                try {
                    await originalWalletChooser.apply(this, arguments);
                    createNotification(DEFAULT_MESSAGES.SUCCESS.connect, TX_STATE.SUCCESS);
                } catch (error) {
                    createNotification(error.message || DEFAULT_MESSAGES.FAILED.connect, TX_STATE.FAILED);
                }
            };
        }
    }

    // Patch transaction functions to add feedback
    function patchTransactionFunctions() {
        // Patch invest function
        if (typeof window.invest === 'function') {
            const originalInvest = window.invest;
            window.invest = function(contract, accountBalance, dashboardObserver) {
                const newObserver = {
                    next: (tx) => {
                        if (tx && tx.hash) {
                            trackTransaction(tx.hash, 'deposit');
                        }
                        if (dashboardObserver && dashboardObserver.next) {
                            dashboardObserver.next(tx);
                        }
                    },
                    complete: () => {
                        createNotification(DEFAULT_MESSAGES.SUCCESS.deposit, TX_STATE.SUCCESS);
                        if (dashboardObserver && dashboardObserver.complete) {
                            dashboardObserver.complete();
                        }
                    }
                };
                
                return originalInvest.call(this, contract, accountBalance, newObserver);
            };
        }
        
        // Patch withdraw function
        if (typeof window.withdraw === 'function') {
            const originalWithdraw = window.withdraw;
            window.withdraw = function(contract, dashboardObserver) {
                const newObserver = {
                    next: (tx) => {
                        if (tx && tx.hash) {
                            trackTransaction(tx.hash, 'withdraw');
                        }
                        if (dashboardObserver && dashboardObserver.next) {
                            dashboardObserver.next(tx);
                        }
                    },
                    complete: () => {
                        createNotification(DEFAULT_MESSAGES.SUCCESS.withdraw, TX_STATE.SUCCESS);
                        if (dashboardObserver && dashboardObserver.complete) {
                            dashboardObserver.complete();
                        }
                    }
                };
                
                return originalWithdraw.call(this, contract, newObserver);
            };
        }
    }

    // Initialize the system
    function initialize() {
        // Ensure notification container exists
        ensureNotificationContainer();
        
        // Patch functions when they become available
        const checkAndPatchFunctions = () => {
            patchWalletConnections();
            patchTransactionFunctions();
        };
        
        // Try immediately if functions are already defined
        checkAndPatchFunctions();
        
        // Otherwise, check periodically
        const interval = setInterval(() => {
            checkAndPatchFunctions();
            
            // Stop checking after 10 seconds
            if (document.readyState === 'complete' && 
                typeof window.invest === 'function' && 
                typeof window.withdraw === 'function') {
                clearInterval(interval);
            }
        }, 500);
        
        // Stop checking after 10 seconds regardless
        setTimeout(() => clearInterval(interval), 10000);
        
        // Override error popup with our notification system
        if (typeof window.showErrorPopup === 'function') {
            window.showErrorPopup = function(title, message, duration) {
                return createNotification(message, TX_STATE.FAILED, duration);
            };
        }
        
        if (typeof window.showWarningPopup === 'function') {
            window.showWarningPopup = function(title, message, duration) {
                return createNotification(message, TX_STATE.SUCCESS, duration);
            };
        }
        
        console.log("Transaction feedback system initialized");
    }

    // Run when the document is ready
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(initialize, 500);
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(initialize, 500);
        });
    }

    // Expose functions globally
    window.transactionFeedback = {
        trackTransaction,
        updateTransaction,
        showNotification: createNotification
    };
})();
