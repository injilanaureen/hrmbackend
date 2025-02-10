import mongoose from 'mongoose';

// Banking Schema
const bankingSchema = new mongoose.Schema({
  emp_id: { type: String, required: true, unique: true }, // Reference to the User's emp_id
  bank_name: { type: String, required: true },
  account_holder_name: { type: String, required: true },
  account_number: { type: String, required: true },
  ifsc_code: { type: String, required: true },
  branch_name: { type: String, required: true },
});

const Banking = mongoose.model('Banking', bankingSchema);

export default Banking;
