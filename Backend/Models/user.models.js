import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  symbol: String,
  quantity: Number,
  price: Number,
  type: String,
  Status: String,
  date: { type: Date, default: Date.now }
});

const StockSchema = new mongoose.Schema({
  symbol: String,
  quantity: Number,
  avgPrice: Number,
  totalInvested: Number
});

const UserSchema = new mongoose.Schema({
  Name: String,
  EmailID: { type: String, unique: true },
  Password: String,
  ProfileImage: String,
  PhoneNo: { type: String, default: '0' },
  Stocks: [StockSchema],
  TotalAmount: { type: Number, default: 100000 },
  WalletAmount: { type: Number, default: 100000 },
  isVerified: { type: Boolean, default: false },
  Transactions: [TransactionSchema],
  SavedNews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'News' }],
  Books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  Watchlist: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stock' }], default: [] }, // <-- default added
  PremiumPurchase: {
    isPremium: { type: Boolean, default: false },
    purchaseDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, default: null }
  },
  Courses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  }],
});

const User = mongoose.model('User', UserSchema);
export default User;
