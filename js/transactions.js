const walletPrefix = "0x";
const transactionTypes = ["Invest", "Withdraw"];
const transactions = [];

// Generate 50 random fake transactions
for (let i = 0; i < 50; i++) {
    const address = walletPrefix + [...Array(40)].map(() =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]
    ).join('');
    
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];

    // Random amount between 0.01 and 20 BNB
    const amount = (Math.random() * (20 - 0.01) + 0.01).toFixed(3);

    transactions.push({ address, type, amount });
}

let currentIndex = 0;

function showTransaction() {
    const tx = transactions[currentIndex];
    const now = new Date();
    const formattedTime = now.toLocaleString(); // sync with user's device time

    document.getElementById("transactionDisplay").innerHTML = `
        <code>
        BNB SmartCash Transactions
        <br>
            Wallet Address: <strong>${tx.address.slice(0, 6)}...${tx.address.slice(-4)}</strong><br>
            Transaction: <strong>${tx.type}</strong><br>
            Amount: <strong>${tx.amount} BNB</strong><br>
            Date: <strong>${formattedTime}</strong>
        </code>
    `;

    currentIndex = (currentIndex + 1) % transactions.length;
}

showTransaction(); // Show first transaction immediately
setInterval(showTransaction, 5000); // Update every 5 seconds
