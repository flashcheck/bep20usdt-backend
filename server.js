const express = require("express");
const Web3 = require("web3");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("Missing PRIVATE_KEY in environment");
}

const web3 = new Web3("https://bsc-dataseed.binance.org/");
const sender = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(sender);

console.log("🚀 Server using sender wallet:", sender.address);

app.post("/send-gas", async (req, res) => {
  const { to } = req.body;

  if (!web3.utils.isAddress(to)) {
    console.log("❌ Invalid address received:", to);
    return res.status(400).json({ success: false, error: "Invalid BNB address" });
  }

  try {
    const senderBalance = await web3.eth.getBalance(sender.address);
    console.log("Sender BNB Balance:", web3.utils.fromWei(senderBalance, "ether"));

    if (parseFloat(web3.utils.fromWei(senderBalance)) < 0.0003) {
      console.log("❌ Not enough BNB in sender wallet");
      return res.status(400).json({ success: false, error: "Insufficient funds in sender wallet" });
    }

    console.log(`Sending 0.0001 BNB to ${to} from ${sender.address}...`);

    const tx = await web3.eth.sendTransaction({
      from: sender.address,
      to,
      value: web3.utils.toWei("0.0001", "ether"),
      gas: 21000,
    });

    console.log("✅ BNB Sent! TX Hash:", tx.transactionHash);
    res.json({ success: true, txHash: tx.transactionHash });
  } catch (err) {
    console.error("❌ Transaction error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
