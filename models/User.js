import mongoose from 'mongoose';
import Role from './Role.js'; // Import Role model
import Department from './Department.js'; // Import Department model
import Designation from './Designation.js'; // Import Designation model

// User Schema
const userSchema = new mongoose.Schema({
  emp_full_name: { type: String, required: true },
  emp_personal_email: { type: String, required: true },
  emp_phone_no: { type: String, required: true },
  emp_addhar_no: { type: String, required: true },
  emp_department: { type: Number, required: true, ref: 'Department' }, // Reference to Department by dep_id
  emp_designation: { type: Number, required: true, ref: 'Designation' }, // Reference to Designation by designation_id
  emp_join_date: { type: Date, required: true },
  emp_status: { type: String, default: 'Inactive' },
  role_id: { type: Number, required: true, ref: 'Role' }, // Reference to Role by role_id
  role_permission: { type: String, required: true },
  emp_email: { type: String, required: false ,default: null},
  emp_password: { type: String, required: false,default: null },

  emp_pan_card_no: { type: String, required: true },
  manager_id: { type: String, ref: 'User', default: null }, // Reference to another User based on emp_id
  team_leader_id: { type: String, ref: 'User', default: null }, // Reference to another User based on emp_id
  emp_confirmation_date: { type: Date, required: true },
  emp_offered_ctc: { type: Number, required: true },
  emp_empstatus: { type: String, required: true },
  emp_id: { type: String, required: false ,unique: true,default: null },
  emp_dob: { type: Date, required: true },
  last_updated_time: { type: Date, default: Date.now },
  last_updated_status: { type: String, default: 'New' },
});

// Populate references when querying users
// Explicitly mention the 'master' collection
const User = mongoose.model('User', userSchema, 'master'); // 'master' collection

export default User;
