import mongoose from "mongoose";

const ResignedEmployeeSchema = new mongoose.Schema({
  emp_id: { type: String, required: true, unique: true},
  employee_name: { type: String, required: true },
  last_working_day: { type: Date, required: true },
  total_work_period: { type: String, required: true },
  last_ctc_drawn: { type: Number, required: true },
  last_designation: { type: String, required: true },
  reason_for_resignation: { type: String, required: true },
  feedback: { type: String },
  exit_interview_done: { type: Boolean },
  notice_period_served: { type: Boolean },
});

const ResignedEmployee = mongoose.model("ResignedEmployee", ResignedEmployeeSchema);
export default  ResignedEmployee;
