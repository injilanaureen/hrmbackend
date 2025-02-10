import mongoose from 'mongoose';

// Role Schema
const roleSchema = new mongoose.Schema({
  role_id: { type: Number, required: true, unique: true }, // Unique role ID
  role: { type: String, required: true }, // Role name (e.g., "admin", "user")
  permission: { type: String, required: true }, // Permissions associated with the role (e.g., "all", "read-only")
});

const Role1 = mongoose.model('Role', roleSchema, 'roles'); // 'roles' collection specified here

export default Role1;
