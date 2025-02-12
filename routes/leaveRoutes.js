import express from "express";
import Leave from "../models/Leave.js";
import RequestLeaves from "../models/ApplyLeave.js";
import ShortLeave from "../models/ShortLeave.js";
const leaveRouter = express.Router();

// 📌 Add a new leave record
leaveRouter.post("/addedLeave", async (req, res) => {
  try {
    const { emp_id, earned_leave, casual_leave, sick_leave } = req.body;
    const total_leave = earned_leave + casual_leave + sick_leave;

    const newLeave = new Leave({ emp_id, earned_leave, casual_leave, sick_leave, total_leave });
    await newLeave.save();

    res.status(201).json({ message: "Leave record added", leave: newLeave });
  } catch (error) {
    res.status(500).json({ message: "Error adding leave record", error });
  }
});

// 📌 Get all leave records
leaveRouter.get("/allEmployeeData", async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave records", error });
  }
});

// 📌 Get a specific leave record by emp_id
leaveRouter.get("/getSingleLeaveData/:emp_id", async (req, res) => {
  try {
    const leave = await Leave.findOne({ emp_id: req.params.emp_id });

    if (!leave) return res.status(404).json({ message: "Leave record not found" });

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave record", error });
  }
});

// 📌 Update leave record
leaveRouter.put("/update/:emp_id", async (req, res) => {
  try {
    const { earned_leave, casual_leave, sick_leave } = req.body;
    const total_leave = earned_leave + casual_leave + sick_leave;

    const updatedLeave = await Leave.findOneAndUpdate(
      { emp_id: req.params.emp_id },
      { earned_leave, casual_leave, sick_leave, total_leave },
      { new: true }
    );

    if (!updatedLeave) return res.status(404).json({ message: "Leave record not found" });

    res.status(200).json({ message: "Leave record updated", leave: updatedLeave });
  } catch (error) {
    res.status(500).json({ message: "Error updating leave record", error });
  }
});

// 📌 Delete a leave record
leaveRouter.delete("/delete/:emp_id", async (req, res) => {
  try {
    const deletedLeave = await Leave.findOneAndDelete({ emp_id: req.params.emp_id });

    if (!deletedLeave) return res.status(404).json({ message: "Leave record not found" });

    res.status(200).json({ message: "Leave record deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting leave record", error });
  }
});

///// leave apply  get leave request approve leave request etc

// Route to apply for leave (POST)
leaveRouter.post("/apply-leave", async (req, res) => {
  try {
    const { emp_id, leaveReason, leaveType, leaveStartDate, leaveEndDate ,days_requested } = req.body;

    // Validate required fields
    if (!emp_id || !leaveReason || !leaveType || !leaveStartDate || !leaveEndDate) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Ensure leave type is valid
    const validLeaveTypes = ["Casual Leave", "Sick Leave", "Earned Leave"];
    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({ message: "Invalid leave type." });
    }

    // Check if a leave request already exists for the same employee on the same leave start date
    const existingLeave = await RequestLeaves.findOne({ emp_id, leaveStartDate });
    if (existingLeave) {
      return res.status(409).json({ message: "You have already applied for leave on this date." });
    }

    // Create new leave request
    const newLeaveRequest = new RequestLeaves({
      emp_id,
      leaveReason,
      leaveType,
      leaveStartDate,
      leaveEndDate,
      days_requested,
      
    });

    // Save to database
    await newLeaveRequest.save();
    res.status(201).json({ message: "Leave request submitted successfully!", data: newLeaveRequest });

  } catch (error) {
    console.error("Error applying leave:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }

  
});

// Route to get all leave requests (GET HR side)
leaveRouter.get("/leave-requests", async (req, res) => {
  try {
    const leaveRequests = await RequestLeaves.find().sort({ leaveApplydate: -1 }); // Sort by latest applied
    res.status(200).json(leaveRequests);
    // console.log(leaveRequests)
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
});

// Route to get leave requests by employee ID
leaveRouter.get("/leave-requests/:emp_id", async (req, res) => {
  try {
    const { emp_id } = req.params;

    // Find leave requests for the given employee ID
    const leaveRequests = await RequestLeaves.find({ emp_id }).sort({ leaveApplydate: -1 });

    if (!leaveRequests.length) {
      return res.status(404).json({ message: "No leave requests found for this employee." });
    }

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
});


////short leave

const getFirstDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Route to apply for short leave



export default leaveRouter;
