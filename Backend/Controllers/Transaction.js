import transporter from "../Mail/Mail.js";
import User from "../Models/user.models.js";
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
    const transaction = req.body.transaction;
    const userId = req.userPayload._id;
    console.log(req.body.transaction);
    // Validate transaction data
    if (!transaction || !transaction.Symbol || !transaction.Quantity) {
      return res.status(400).json({ message: "Invalid transaction data" });
    }

    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle transaction
    if (transaction.type === "BUY") {
      if (user.WalletAmount < transaction.estimatedCost) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Update wallet
      user.WalletAmount -= transaction.estimatedCost;
      
      // Update stocks
      const existingStock = user.Stocks
        .find((stock) => stock.symbol === transaction.Symbol);
      
      console.log(transaction,'sssssssssssssssssssssss');
      if (existingStock) {
        existingStock.quantity += parseInt(transaction.Quantity);
        existingStock.totalInvested += transaction.estimatedCost;
        existingStock.avgPrice =
        existingStock.totalInvested / existingStock.quantity;
      } else {
        user.Stocks.push({
          symbol: transaction.Symbol,
          quantity: transaction.Quantity,
          avgPrice: transaction.avgPrice,
          totalInvested: transaction.estimatedCost,
        });
      }
    }else{
      // SELL transaction
      const existingStock = user.Stocks
        .find((stock) => stock.symbol === transaction.Symbol);
      if (!existingStock || existingStock.quantity < transaction.Quantity) {
        return res.status(400).json({ message: "Insufficient stocks" });
      }
      // Update wallet
      user.WalletAmount += transaction.estimatedCost;
      // Update stocks
      existingStock.quantity -= transaction.Quantity;
      existingStock.totalInvested -= transaction.estimatedCost;
      existingStock.avgPrice =
        existingStock.totalInvested / existingStock.quantity;
    }

    // Record transaction
    user.Transactions.push({
      symbol: transaction.Symbol,
      quantity: transaction.Quantity,
      price: transaction.avgPrice,
      type: transaction.type,
    });

    await user.save();

    res.status(200).json({ transaction });
  } catch (error) {
    console.error("Transaction Error:", error);
    res.status(500).json({ success: false, message: "Transaction failed" });
  }
};
export default TransactionVerify;
export { StockTransaction };
