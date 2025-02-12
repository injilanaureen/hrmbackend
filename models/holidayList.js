import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  holidayName: { type: String, required: true }, // Name of the holiday
  month: { type: String, required: true }, // Month name (e.g., January, February)
  day: { type: String, required: true }, // Numeric day of the month
  weekDateName: { type: String, required: true }, // Day of the week (e.g., Monday, Friday)
  status: { type: String, default: "Holiday" }, // Default status is "holiday"
});

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
