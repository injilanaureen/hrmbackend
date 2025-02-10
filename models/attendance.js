import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  emp_id: { type: String, required: true },  // Employee ID
  date: { type: String, required: true },  // Date of attendance (YYYY-MM-DD)
  time_in: { type: String, required: true },  // Time In (HH:mm)
  time_out: { type: String },  // Time Out (HH:mm) (Optional)
  total_work_duration: { type: String },  // Work duration (HH:mm)
  late_by: { type: String, default: "N/A" },  // Late minutes (if applicable)
  early_out: { type: String, default: "N/A" },  // Early leaving time
  record_clock_in: { type: Boolean, default: true },  // Marked when employee clocks in
  record_clock_out: { type: Boolean, default: false },  // Marked when employee clocks out
  status: { type: String, enum: ["Present", "Late", "Absent"], default: "Present" }  // Attendance status
});

// Create a unique index for emp_id + date (to prevent duplicate records for the same day)


const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;
