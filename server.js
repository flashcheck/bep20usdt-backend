const express = require("express");
const Web3 = require("web3");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const web3 = new Web3("https://bsc-dataseed.binance.org/");
const sender = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(sender);

app.post("/send-gas", async (req, res) => {
  try {
    const to = req.body.to;
    const tx = await web3.eth.sendTransaction({
      from: sender.address,
      to,
      value: web3.utils.toWei("0.0001", "ether"),
      gas: 21000,
    });
    res.json({ success: true, txHash: tx.transactionHash });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
