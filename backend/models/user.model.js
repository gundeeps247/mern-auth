import mongoose from 'mongoose';
const comparisonSchema = new mongoose.Schema({
  term: { type: String, required: true }, // Search term
  data: { type: Object, required: true },  // The comparison data or chart data
  date: { type: Date, default: Date.now }  // Timestamp
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: 'https://i.pinimg.com/736x/3b/ed/41/3bed41ea8eeaab4fbdc572d2a0ba9cb6.jpg' },
  pdfUrls: [{ type: String }],
  comparisons: [comparisonSchema],  // Array to store comparisons
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

export default User;
