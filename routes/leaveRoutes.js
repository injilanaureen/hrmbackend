import express from "express";
import Leave from "../models/Leave.js";
import RequestLeaves from "../models/ApplyLeave.js";
import User from "../models/User.js";
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
    const { emp_id, leaveReason, leaveType, leaveStartDate, leaveEndDate, days_requested } = req.body;

    // Validate required fields
    if (!emp_id || !leaveReason || !leaveType || !leaveStartDate || !leaveEndDate) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Ensure leave type is valid
    const validLeaveTypes = ["Casual Leave", "Sick Leave", "Earned Leave"];
    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({ message: "Invalid leave type." });
    }

    // Convert dates to standard Date format for comparison
    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);

    // ✅ Check if a leave request already exists for overlapping dates
    const existingLeave = await RequestLeaves.findOne({
      emp_id,
      $or: [
        { leaveStartDate: { $lte: end }, leaveEndDate: { $gte: start } }, // Leave already applied in the range
      ],
    });

    if (existingLeave) {
      return res.status(409).json({
        message: `You have already applied for leave from ${existingLeave.leaveStartDate.toDateString()} to ${existingLeave.leaveEndDate.toDateString()}.`,
      });
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



//fetch employee information in master branch

leaveRouter.get("/fetch/employee", async (req, res) => {
  const { emp_ids } = req.query; // Extract emp_ids from query parameters

  if (!emp_ids) {
    return res.status(400).json({ error: "Employee IDs are required" });
  }

  // Convert comma-separated string into an array
  const empIdArray = emp_ids.split(",");

  console.log("Fetching data for emp_ids:", empIdArray);

  try {
    // Fetch employees from MongoDB (assuming you have a model named EmployeeModel)
    const employees = await User.find({ emp_id: { $in: empIdArray } });

    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


leaveRouter.put("/updatedLeaveBalance", async (req, res) => {
  try {
    const { id, leaveRequests, newStatus } = req.body;
    const leaveRequest = leaveRequests[0];
    
    // ✅ Pehle check karo ki ye leave request already Approved toh nahi hai
    const existingRequest = await RequestLeaves.findById(leaveRequest._id);
    if (existingRequest.leaveStatus === "Approved") {
      return res.status(400).json({ message: "This leave is already approved. It cannot be updated again." });
    }

    // ✅ Ab sirf pehli baar approval allow hoga
    if (newStatus === "Approved") {
      let leaveTypeField = "";
      if (leaveRequest.leaveType === "Sick Leave") leaveTypeField = "sick_leave";
      else if (leaveRequest.leaveType === "Earned Leave") leaveTypeField = "earned_leave";
      else if (leaveRequest.leaveType === "Casual Leave") leaveTypeField = "casual_leave";
      else return res.status(400).json({ message: "Invalid leave type for balance deduction" });

      const updatedLeave = await Leave.findOneAndUpdate(
        { emp_id: leaveRequest.emp_id },
        { 
          $inc: { 
            [leaveTypeField]: -leaveRequest.days_requested, 
            total_leave: -leaveRequest.days_requested 
          } 
        },
        { new: true }
      );

      if (!updatedLeave) {
        return res.status(404).json({ message: "Employee leave record not found" });
      }

      await RequestLeaves.findByIdAndUpdate(
        leaveRequest._id,
        { leaveStatus: "Approved" }, 
        { new: true }
      );

      return res.status(200).json({ message: "Leave balance updated successfully", updatedLeave });
    } else {
      return res.status(400).json({ message: "Invalid status update" });
    }
  } catch (error) {
    console.error("Error updating leave balance:", error);
    res.status(500).json({ message: "Server error" });
  }
});


leaveRouter.put("/RejectedLeave", async (req, res) => {
  console.log(req.body);
  
  try {
    const { id, newStatus } = req.body; // ✅ Extract newStatus

    if (!id || !newStatus) {
      return res.status(400).json({ message: "ID and status are required" });
    }

    if (newStatus !== "Rejected") {
      return res.status(400).json({ message: "Invalid status update" });
    }

    // ✅ Find and update leave request status
    const updatedLeaveRequest = await RequestLeaves.findByIdAndUpdate(
      id,
      { leaveStatus: newStatus }, // ✅ Using newStatus from req.body
      { new: true }
    );

    if (!updatedLeaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    return res.status(200).json({ 
      message: "Leave request rejected successfully", 
      updatedLeaveRequest 
    });

  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ message: "Server error" });
  }
});





//short part started 

const getFirstDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Route to apply for short leave

leaveRouter.post("/apply-short-leave", async (req, res) => {
  try {
    const { emp_id, shortLeaveDate, shortLeavePeriod, shortLeaveReason } = req.body;

 
    if (!emp_id || !shortLeaveDate || !shortLeavePeriod || !shortLeaveReason) {
      return res.status(400).json({ message: "All fields are required!" });
    }
 

  
    // Validate short leave timing
    let shortLeaveTime = "";
    if (shortLeavePeriod === "Morning") {
      shortLeaveTime = "10:00 AM - 12:00 PM";
    } else if (shortLeavePeriod === "Evening") {
      shortLeaveTime = "5:00 PM - 7:00 PM";
    } else {
      return res.status(400).json({ message: "Invalid short leave period!" });
    }

    // Count how many short leaves this employee has taken this month
    const firstDayOfMonth = getFirstDayOfMonth();
    const shortLeaveCount = await ShortLeave.countDocuments({
      emp_id,
      shortLeaveDate: { $gte: firstDayOfMonth.toISOString().split("T")[0] },
      leaveStatus: { $ne: "Rejected" },  // Count only approved/pending leaves
    });

    // Allow only 2 short leaves per month
    if (shortLeaveCount >= 2) {
      return res.status(400).json({ message: "You have already taken 2 short leaves this month!" });
    }
    // Create new short leave request
    const newShortLeave = new ShortLeave({
      emp_id,
      shortLeaveDate,
      shortLeavePeriod,
      shortLeaveTime,
      shortLeaveReason,
      shortLeaveCount: shortLeaveCount + 1,
    });

 
    await newShortLeave.save();
    res.status(201).json({ message: "Short leave request submitted successfully!" });
 

  } catch (error) {
    console.error("Error applying short leave:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//all short leaves
leaveRouter.get("/short-leaves", async (req, res) => {
  try {
    const shortLeaves = await ShortLeave.find();
    res.status(200).json(shortLeaves);
  } catch (error) {
    console.error("Error fetching short leaves:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//fetch short leave for one employee
leaveRouter.get("/short-leaves/:emp_id", async (req, res) => {
  try {
    const { emp_id } = req.params;

    console.log("Fetching leaves for:", emp_id);

    
    const employeeLeaves = await ShortLeave.find({ emp_id });

    res.status(200).json(employeeLeaves);
  } catch (error) {
    console.error("Error fetching short leaves:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});
leaveRouter.put("/updated-Short-leaves/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update the leave status to "Approved"
    const updatedLeave = await ShortLeave.findByIdAndUpdate(
      id, // Use findByIdAndUpdate for `_id`
      { leaveStatus: "Approved" }, 
      { new: true } // Return updated document
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({ message: "Leave status updated successfully", data: updatedLeave });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
leaveRouter.put("/updated-Short-leaves-Rejected/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update the leave status to "Approved"
    const updatedLeave = await ShortLeave.findByIdAndUpdate(
      id, // Use findByIdAndUpdate for `_id`
      { leaveStatus: "Rejected" }, 
      { new: true } // Return updated document
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({ message: "Leave status updated successfully", data: updatedLeave });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});





export default leaveRouter;
