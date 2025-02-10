
import mongoose from "mongoose";

const ShiftSchema = new mongoose.Schema({
  shift_in: { type: String, default: "10:00" },  // Default Shift Start Time
  shift_out: { type: String, default: "07:00" },  // Default Shift End Time (Next Day Possible)
  week_off : { type: String, default : "Sunday" } //
  
});

const Shift = mongoose.model("Shift", ShiftSchema);

export default Shift;
