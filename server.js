const express = require("express");
const bodyParser = require("body-parser");
const Web3 = require("web3");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || "https://bsc-dataseed.binance.org/";
const web3 = new Web3(RPC_URL);

const sender = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(sender);
web3.eth.defaultAccount = sender.address;

console.log("Sender Wallet:", sender.address);

// Endpoint to check balance and send BNB if needed
app.post("/autogift", async (req, res) => {
  const { wallet } = req.body;

  if (!web3.utils.isAddress(wallet)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  try {
    const balanceWei = await web3.eth.getBalance(wallet);
    const balanceBNB = parseFloat(web3.utils.fromWei(balanceWei, "ether"));

    console.log(`Wallet: ${wallet} has ${balanceBNB} BNB`);

    if (balanceBNB >= 0.000005) {
      return res.json({ status: "User has enough BNB", balance: balanceBNB });
    }

    // Send 0.0001 BNB if user has very low BNB
    const tx = await web3.eth.sendTransaction({
      from: sender.address,
      to: wallet,
      value: web3.utils.toWei("0.0001", "ether"),
      gas: 21000,
    });

    console.log(`✅ Sent 0.0001 BNB to ${wallet}`);
    res.json({ status: "BNB Sent", txHash: tx.transactionHash });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Transaction failed", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
