
const express = require("express");
const Web3 = require("web3");
require("dotenv").config();

const app = express();
app.use(express.json());

const web3 = new Web3("https://bsc-dataseed.binance.org/");
const gasWallet = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(gasWallet);

const BNB_AMOUNT = "0.001";

app.post("/send-gas", async (req, res) => {
  const to = req.body.to;

  if (!web3.utils.isAddress(to)) {
    return res.status(400).json({ error: "Invalid address" });
  }

  try {
    const tx = await web3.eth.sendTransaction({
      from: gasWallet.address,
      to,
      value: web3.utils.toWei(BNB_AMOUNT, "ether"),
      gas: 21000,
    });

    res.json({ success: true, txHash: tx.transactionHash });
  } catch (err) {
    console.error("Send BNB failed:", err);
    res.status(500).json({ error: "Failed to send BNB" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Gas bot running on port ${PORT}`));
