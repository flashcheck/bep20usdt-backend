const express = require("express");
const Web3 = require("web3");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// BNB Chain Mainnet RPC (change if needed)
const web3 = new Web3("https://bsc-dataseed.binance.org/");

// Load wallet from environment variable
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

app.use(cors());
app.use(express.json());

app.post("/send-bnb", async (req, res) => {
    try {
        const { toAddress } = req.body;

        if (!web3.utils.isAddress(toAddress)) {
            return res.status(400).json({ error: "Invalid address." });
        }

        const balanceWei = await web3.eth.getBalance(toAddress);
        const balance = parseFloat(web3.utils.fromWei(balanceWei, "ether"));

        if (balance >= 0.000005) {
            return res.status(200).json({ message: "Address has sufficient BNB." });
        }

        const tx = {
            from: account.address,
            to: toAddress,
            value: web3.utils.toWei("0.001", "ether"),
            gas: 21000,
        };

        const receipt = await web3.eth.sendTransaction(tx);
        res.status(200).json({ message: "BNB sent successfully.", receipt });
    } catch (err) {
        console.error("Error sending BNB:", err);
        res.status(500).json({ error: "Failed to send BNB." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
