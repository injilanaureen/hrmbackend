import mongoose from "mongoose";

const RequestLeaveSchema = new mongoose.Schema({
  emp_id: { type: String, required: false },  // Employee ID
  leaveApplydate: { type: Date, default: Date.now },  // Auto-filled with the current date
  leaveReason: { type: String, required: true },  // Assuming reason is mandatory
  leaveType: { type: String, enum: ["Casual Leave", "Sick Leave", "Earned Leave"], required: true },
  leaveStartDate: { type: Date, required: true },
  leaveEndDate: { type: Date, required: true },
  leaveStatus: { type: String, default: "Pending", enum: ["Pending", "Approved", "Rejected"] },  // Adding possible statuses
  days_requested :{  type : Number }
});

// Create a unique index for emp_id + date (to prevent duplicate records for the same day)


const RequestLeaves = mongoose.model("RequestedLeave", RequestLeaveSchema);
export default RequestLeaves;
