import transporter from "../Mail/Mail.js";
import User from "../Models/user.models.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
const TransactionVerify = (req, res) => {
  console.log("OTP sent for transaction verification");
  console.log(req.body);
  const { email, OTP } = req.body;
  const mailOptions = {
    from: "onkar.bhojane22@gmail.com",
    to: email,
    subject: "OTP for stock buying ",
    text: `Your OTP is ${OTP}`,
  };
  console.log(mailOptions);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
  res.send("OTP sent successfully");
};

const StockTransaction = async (req, res) => {
  try {
    const { transaction } = req.body;
    const userId = req.userPayload._id;

    if (!transaction || !transaction.Symbol || !transaction.Quantity || !transaction.type) {
      return res.status(400).json({ message: "Invalid transaction data" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (transaction.type.toUpperCase() === "BUY") {
      if (user.WalletAmount < transaction.estimatedCost) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      user.WalletAmount -= transaction.estimatedCost;

      const existingStock = user.Stocks.find(
        stock => stock.symbol === transaction.Symbol
      );

      if (existingStock) {
        existingStock.quantity += parseInt(transaction.Quantity);
        existingStock.totalInvested += transaction.estimatedCost;
        existingStock.avgPrice = existingStock.totalInvested / existingStock.quantity;
      } else {
        user.Stocks.push({
          symbol: transaction.Symbol,
          quantity: parseInt(transaction.Quantity),
          avgPrice: transaction.estimatedCost / transaction.Quantity,
          totalInvested: transaction.estimatedCost
        });
      }

    } else if (transaction.type.toUpperCase() === "SELL") {
      const existingStock = user.Stocks.find(
        stock => stock.symbol === transaction.Symbol
      );

      if (!existingStock) {
        return res.status(400).json({ message: "Stock not found in portfolio" });
      }

      if (existingStock.quantity < transaction.Quantity) {
        return res.status(400).json({ message: "Insufficient stock quantity" });
      }

      user.WalletAmount += transaction.estimatedCost;

      existingStock.quantity -= parseInt(transaction.Quantity);
      existingStock.totalInvested -= existingStock.avgPrice * transaction.Quantity;

      if (existingStock.quantity <= 0) {
        user.Stocks = user.Stocks.filter(
          stock => stock.symbol !== transaction.Symbol
        );
      }
    } else {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    user.Transactions.push({
      symbol: transaction.Symbol,
      quantity: transaction.Quantity,
      price: transaction.avgPrice || (transaction.estimatedCost / transaction.Quantity),
      type: transaction.type.toUpperCase()
    });

    await user.save();

    return res.status(200).json({ 
      success: true,
      message: "Transaction completed successfully",
      user: {
        WalletAmount: user.WalletAmount,
        Stocks: user.Stocks,
        Transactions: user.Transactions
      }
    });

  } catch (error) {
    console.error("Transaction Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Transaction failed",
      error: error.message 
    });
  }
};

const razorpay = new Razorpay({
  key_id: process.env.TEST_KEY_ID,
  key_secret: process.env.TEST_KEY_SECRET,
});

const create_order = async (req, res) => {
  try {
    console.log("creating order");
    const { amount, currency } = req.body;
    console.log(process.env.TEST_KEY_ID, process.env.TEST_KEY_SECRET);
    const options = {
      amount: amount * 100, 
      currency,
      receipt: `receipt_${Math.random() * 1000}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log("errror, ", error);
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
export { StockTransaction, create_order, paymentVerify };