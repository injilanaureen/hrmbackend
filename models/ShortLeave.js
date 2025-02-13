import mongoose from "mongoose";
 
const ShortLeaveSchema = new mongoose.Schema({
  emp_id: { type: String, required: true },  // Employee ID
  shortLeaveDate: { type: String, required: true },  // Leave Date (YYYY-MM-DD)
  shortLeavePeriod: { type: String, enum: ["Morning", "Evening"], required: true },  // Allowed periods
  shortLeaveTime: { type: String, required: true },  // Time range (10AM-12PM or 5PM-7PM)
  shortLeaveReason: { type: String, required: true },  // Reason for short leave
  leaveStatus: { type: String, default: "Pending", enum: ["Pending", "Approved", "Rejected"] },  // Leave status
  appliedOn: { type: Date, default: Date.now },  // Application date
  shortLeaveCount: { type: Number, required: true, default: 0 },  // Monthly short leave count
});
 
// Create model
const ShortLeave = mongoose.model("ShortLeave", ShortLeaveSchema);
export default ShortLeave;