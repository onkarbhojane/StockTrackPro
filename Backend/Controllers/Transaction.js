import transporter from "../Mail/Mail.js";
import User from "../Models/user.models.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

/* ---------------- OTP Verify ---------------- */
const TransactionVerify = (req, res) => {
  const { email, OTP } = req.body;

  const mailOptions = {
    from: "onkar.bhojane22@gmail.com",
    to: email,
    subject: "OTP for stock buying",
    text: `Your OTP is ${OTP}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
    return res.status(200).json({ message: "OTP sent successfully" });
  });
};

/* ---------------- Stock Transaction (Queue Orders) ---------------- */
const StockTransaction = async (req, res) => {
  try {
    const { transaction } = req.body;
    const userId = req.userPayload._id;

    if (
      !transaction ||
      !transaction.Symbol ||
      !transaction.Quantity ||
      !transaction.type ||
      !transaction.pricePerShare
    ) {
      return res.status(400).json({ message: "Invalid transaction data" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add to pending transactions queue
    user.Transactions.push({
      symbol: transaction.Symbol,
      quantity: transaction.Quantity,
      EntryPrice:
        transaction.type.toUpperCase() === "BUY"
          ? transaction.pricePerShare
          : null,
      ExitPrice:
        transaction.type.toUpperCase() === "SELL"
          ? transaction.pricePerShare
          : null,
      type: transaction.type.toUpperCase(),
      Status: "Pending",
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Transaction queued successfully. It will execute when price hits target.",
      transactions: user.Transactions,
    });
  } catch (error) {
    console.error("Transaction Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Transaction failed",
        error: error.message,
      });
  }
};

/* ---------------- Execute Pending Transactions ---------------- */
const executePendingTransactions = async () => {
  try {
    // Find all users with pending transactions
    const users = await User.find({ "Transactions.Status": "Pending" });

    for (let user of users) {
      let updated = false;

      for (let txn of user.Transactions) {
        if (txn.Status !== "Pending") continue;

        // Fetch latest market price for the symbol
        const latestData = await MarketData.findOne({ Symbol: txn.symbol })
          .sort({ Date: -1 })
          .limit(1);

        if (!latestData) continue;

        const currentPrice = latestData.Close;

        /* ---- BUY ---- */
        if (txn.type === "BUY" && currentPrice <= txn.EntryPrice) {
          const cost = txn.EntryPrice * txn.quantity;

          if (user.WalletAmount >= cost) {
            user.WalletAmount -= cost;

            const existingStock = user.Stocks.find(
              (s) => s.symbol === txn.symbol
            );

            if (existingStock) {
              existingStock.quantity += txn.quantity;
              existingStock.totalInvested += cost;
              existingStock.avgPrice =
                existingStock.totalInvested / existingStock.quantity;
            } else {
              user.Stocks.push({
                symbol: txn.symbol,
                quantity: txn.quantity,
                avgPrice: txn.EntryPrice,
                totalInvested: cost,
              });
            }

            txn.Status = "Executed";
            updated = true;
            console.log(
              `✅ BUY Executed for ${user.EmailID}: ${txn.quantity} ${txn.symbol} @ ${txn.EntryPrice}`
            );
          }
        }

        /* ---- SELL ---- */
        if (txn.type === "SELL" && currentPrice >= txn.ExitPrice) {
          const stock = user.Stocks.find((s) => s.symbol === txn.symbol);

          if (stock && stock.quantity >= txn.quantity) {
            const revenue = txn.ExitPrice * txn.quantity;
            user.WalletAmount += revenue;

            stock.quantity -= txn.quantity;
            stock.totalInvested -= stock.avgPrice * txn.quantity;

            if (stock.quantity <= 0) {
              user.Stocks = user.Stocks.filter((s) => s.symbol !== txn.symbol);
            }

            txn.Status = "Executed";
            updated = true;
            console.log(
              `✅ SELL Executed for ${user.EmailID}: ${txn.quantity} ${txn.symbol} @ ${txn.ExitPrice}`
            );
          }
        }
      }

      if (updated) await user.save();
    }
  } catch (error) {
    console.error("Execution Error:", error);
  }
};
/* ---------------- Razorpay Setup ---------------- */
const razorpay = new Razorpay({
  key_id: process.env.TEST_KEY_ID,
  key_secret: process.env.TEST_KEY_SECRET,
});

const create_order = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${Math.random() * 1000}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const paymentVerify = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.TEST_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res
        .status(200)
        .json({ success: true, message: "Payment verified successfully!" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export default TransactionVerify;
export {
  StockTransaction,
  create_order,
  paymentVerify,
  executePendingTransactions,
};
