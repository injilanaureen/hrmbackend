import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema({
  emp_id: { type: String, required: true, unique: true },
  earned_leave: { type: Number, required: true, default: 7 },
  casual_leave: { type: Number, required: true, default: 7 },
  sick_leave: { type: Number, required: true, default: 6 },
  total_leave: {
    type: Number,
    required: true,
    default: function () {
      return this.earned_leave + this.casual_leave + this.sick_leave;
    },
  },
});

const Leave = mongoose.model("Leave", LeaveSchema);
export default Leave;
