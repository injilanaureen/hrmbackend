import mongoose from 'mongoose';

// Department Schema
const departmentSchema = new mongoose.Schema({
  dep_id: { type: Number, required: true, unique: true }, // Unique department ID
  dep_name: { type: String, required: true }, // Department name (e.g., "Management", "HR")
});

const Department = mongoose.model('Department', departmentSchema, 'departments'); // 'departments' collection

export default Department;
