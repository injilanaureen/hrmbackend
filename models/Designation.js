import mongoose from 'mongoose';
import Department from './Department.js';

// Designation Schema
const designationSchema = new mongoose.Schema({
  designation_id: { type: Number, required: true, unique: true }, // Unique designation ID
  designation_name: { type: String, required: true }, // Designation name (e.g., "Junior Developer", "Manager")
  dep_id: { type: Number, required: true, ref: 'Department' } // Reference to Department by dep_id
});

const Designation = mongoose.model('Designation', designationSchema, 'designations'); // 'designations' collection

export default Designation;
