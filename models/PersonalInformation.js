import mongoose from "mongoose";

const personalInfoSchema = new mongoose.Schema({
  emp_id: { type: String, required: true, unique: true, ref: "User" }, // Reference to User model
  permanent_address: { type: String, required: true },
  permanent_city: { type: String, required: true },
  permanent_state: { type: String, required: true },
  permanent_zip_code: { type: Number, required: true },
  current_address: { type: String, required: true },
  current_city: { type: String, required: true },
  current_state: { type: String, required: true },
  current_zip_code: { type: Number, required: true },
  alternate_mob_no: { type: Number, required: true },
  emergency_person_name: { type: String, required: true },
  emergency_relationship: { type: String, required: true },
  emergency_mob_no: { type: Number, required: true },
  emergency_address: { type: String, required: true },
  marital_status: { type: String, required: true },
  blood_group: { type: String, required: true }
});

const PersonalInformation = mongoose.model("PersonalInformation", personalInfoSchema);
export default PersonalInformation;
