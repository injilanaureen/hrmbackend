import express from 'express';
import Attendance from "../models/attendance.js"
import Shift from '../models/shiftingData.js';


const addAttendance = express.Router();


// 📌 Demo Route: Add a Shift Record
addAttendance.post("/addShift", async (req, res) => {
  try {
    const { shift_in, shift_out , week_off } = req.body;

    const newShift = new Shift({
      
      shift_in: shift_in || "10:00", // Default shift_in if not provided
      shift_out: shift_out || "07:00", // Default shift_out if not provided
      week_off: week_off || "Sunday" // Default week_off if not provided

    });

    await newShift.save();

    res.status(201).json({ message: "Demo shift saved successfully", data: newShift });
  } catch (error) {
    console.error("Error saving demo shift:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

addAttendance.put("/updateShift/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { shift_in, shift_out, week_off } = req.body;
  
      // Find and update shift
      const updatedShift = await Shift.findByIdAndUpdate(
        id,
        {
          shift_in: shift_in || "10:00",
          shift_out: shift_out || "07:00",
          week_off: week_off || "Sunday",
        },
        { new: true } // Return updated document
      );
  
      if (!updatedShift) {
        return res.status(404).json({ message: "Shift not found" });
      }
  
      res.status(200).json({ message: "Shift updated successfully", data: updatedShift });
    } catch (error) {
      console.error("Error updating shift:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  

addAttendance.get("/getShift", async (req, res) => {
    try {
      const shifts = await Shift.find({});
      res.status(200).json(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

 
  // addAttendance.post("/addAttendance", async (req, res) => {
  //   try {
  //     const { emp_id, date, time_in } = req.body;
  
  //     if (!emp_id || !date || !time_in) {
  //       return res.status(400).json({ message: "emp_id, date, and time_in are required" });
  //     }
  
  //     // Find the employee's shift
  //     const shift = await Shift.findOne();
  //     if (!shift) {
  //       return res.status(404).json({ message: "Shift data not found for employee" });
  //     }
  
  //     const timeInMinutes = convertToMinutes(time_in);
  //     const shiftInMinutes = convertToMinutes(shift.shift_in);
  //     const graceLimit = convertToMinutes("10:30"); // 10:30 AM grace limit
  //     const lateHalfDayLimit = convertToMinutes("10:10"); // Half-day if 6th late arrival and before 10:10 AM
  //     const fullDayAbsenceLimit = convertToMinutes("14:00"); // Mark absent if after 2:00 PM
  
  //     let status = "Present";
  //     let late_by = "N/A";
  
  //     if (timeInMinutes > shiftInMinutes) {
  //       late_by = formatMinutes(timeInMinutes - shiftInMinutes);
  //     }
  
  //     // Fetch employee's past attendance to track late arrivals
  //     const pastLateCount = await Attendance.countDocuments({
  //       emp_id,
  //       late_by: { $ne: "N/A" },
  //       date: { $regex: `^${date.substring(0, 7)}` } // Matches current month
  //     });
  
  //     if (timeInMinutes > shiftInMinutes) {
  //       if (pastLateCount > 5) {
  //         if (timeInMinutes <= lateHalfDayLimit) {
  //           status = "Half-Day";
  //         } else if (timeInMinutes >= fullDayAbsenceLimit) {
  //           status = "Absent";
  //         } else {
  //           status = "Late";
  //         }
  //       } else if (timeInMinutes <= graceLimit) {
  //         status = "Present"; // Still within grace period
  //       } else {
  //         status = "Late";
  //       }
  //     }
  
  //     const newAttendance = new Attendance({
  //       emp_id,
  //       date,
  //       time_in,
  //       time_out: "N/A",
  //       total_work_duration: "N/A",
  //       late_by,
  //       early_out: "N/A",
  //       record_clock_in: true,
  //       record_clock_out: false,
  //       status
  //     });
  
  //     await newAttendance.save();
  
  //     res.status(201).json({ message: "Attendance saved successfully", data: newAttendance });
  //   } catch (error) {
  //     console.error("Error saving attendance:", error);
  //     res.status(500).json({ message: "Server error", error: error.message });
  //   }
  // });


  /// only for testing 
  // addAttendance.post("/addAttendance", async (req, res) => {
    
  //   console.log(req.body);

  //   try {
  //     const {
  //       emp_id,
  //       date,
  //       time_in,
  //       time_out,
  //       total_work_duration,
  //       late_by,
  //       status,
  //       leaveType,
  //       earlyStatus,
  //       lateStatus,
  //       halfDayStatus,
  //       halfDayPeriod,
  //       shortLeaveStatus,
  //       shortLeavePeriod
  //     } = req.body;


  //     // Validate required fields
  //     if (!emp_id || !date || !status) {
  //       return res.status(400).json({ message: "emp_id, date, and status are required" });
  //     }
  
  //     // Prepare the attendance object with the exact data received from the frontend
  //     const newAttendance = new Attendance({
  //       emp_id,
  //       date,
  //       time_in: time_in || "N/A",
  //       time_out: time_out || "N/A",
  //       total_work_duration: total_work_duration || "N/A",
  //       late_by: late_by || "N/A",
  //       early_out: early_out || "N/A",
  //       status,
  //       leaveType,
  //       earlyStatus,
  //       lateStatus,
  //       halfDayStatus,
  //       halfDayPeriod,
  //       shortLeaveStatus,
  //       shortLeavePeriod
  //     });
  
  //     await newAttendance.save();
  
  //     res.status(201).json({ message: "Attendance saved successfully", data: newAttendance });
  //   } catch (error) {
  //     console.error("Error saving attendance:", error);
  //     res.status(500).json({ message: "Server error", error: error.message });
  //   }

  // });
  
  addAttendance.post("/addAttendance", async (req, res) => {
    try {
      const attendances = req.body.attendances;  // Expecting an array
      
      if (!attendances || attendances.length === 0) {
        return res.status(400).json({ message: "Attendance data is required" });
      }
  
      // Save each attendance record
      const savedAttendances = [];
      for (const attendance of attendances) {
        const newAttendance = new Attendance(attendance);
        await newAttendance.save();
        savedAttendances.push(newAttendance);
      }
  
      res.status(201).json({ message: "Attendances saved successfully", data: savedAttendances });
    } catch (error) {
      console.error("Error saving attendance:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  

  // Utility function to convert time (HH:mm) to minutes
function convertToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Utility function to format minutes as HH:mm
function formatMinutes(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

// API to add attendance (Clock In)
// addAttendance.post("/addAttendance", async (req, res) => {
//   try {
//       const { emp_id, date, time_in } = req.body;

//       if (!emp_id || !date || !time_in) {
//           return res.status(400).json({ message: "emp_id, date, and time_in are required" });
//       }

//       // Find the employee's shift
//       const shift = await Shift.findOne({ emp_id });
//       if (!shift) {
//           return res.status(404).json({ message: "Shift data not found for employee" });
//       }

//       const timeInMinutes = convertToMinutes(time_in);
//       const shiftInMinutes = convertToMinutes(shift.shift_in);
//       const graceLimit = convertToMinutes("10:30"); // 10:30 AM grace limit
//       const lateHalfDayLimit = convertToMinutes("10:10"); // Half-day if 6th late arrival and before 10:10 AM
//       const fullDayAbsenceLimit = convertToMinutes("14:00"); // Mark absent if after 2:00 PM

//       let status = "Present";
//       let late_by = "N/A";

//       if (timeInMinutes > shiftInMinutes) {
//           late_by = formatMinutes(timeInMinutes - shiftInMinutes);
//       }

//       // Fetch employee's past attendance to track late arrivals
//       const pastLateCount = await Attendance.countDocuments({
//           emp_id,
//           late_by: { $ne: "N/A" },
//           date: { $regex: `^${date.substring(0, 7)}` } // Matches current month
//       });

//       if (timeInMinutes > shiftInMinutes) {
//           if (pastLateCount >= 5) {
//               if (timeInMinutes <= lateHalfDayLimit) {
//                   status = "Half-Day";
//               } else if (timeInMinutes >= fullDayAbsenceLimit) {
//                   status = "Absent";
//               } else {
//                   status = "Late";
//               }
//           } else if (timeInMinutes <= graceLimit) {
//               status = "Present"; // Still within grace period
//           } else {
//               status = "Late";
//           }
//       }

//       const newAttendance = new Attendance({
//           emp_id,
//           date,
//           time_in,
//           time_out: "N/A",
//           total_work_duration: "N/A",
//           late_by,
//           early_out: "N/A",
//           record_clock_in: true,
//           record_clock_out: false,
//           status
//       });

//       await newAttendance.save();

//       res.status(201).json({ message: "Attendance saved successfully", data: newAttendance });
//   } catch (error) {
//       console.error("Error saving attendance:", error);
//       res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// API to update attendance (Clock Out)
addAttendance.put("/updateAttendance/:id", async (req, res) => {
  try {
      const { id } = req.params; // Object ID (not used for searching)
      const { emp_id, time_out, date } = req.body; // Include date in the request body

      if (!emp_id || !time_out || !date) {
          return res.status(400).json({ message: "emp_id, time_out, and date are required" });
      }

      // Find attendance based on emp_id and date instead of _id
      const attendance = await Attendance.findOne({ emp_id, date });

      if (!attendance) {
          return res.status(404).json({ message: "Attendance record not found for the given employee and date" });
      }

      // Update attendance
      attendance.time_out = time_out;
      await attendance.save();

      res.status(200).json({ message: "Attendance updated successfully", data: attendance });
  } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});
  
  addAttendance.get("/getAttendance", async (req, res) => {
    try {
      const allAttendance = await Attendance.find({});
      res.status(200).json(allAttendance);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  addAttendance.get("/lateCounts", async (req, res) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7); // Get "YYYY-MM"

        // Count late arrivals per employee based on lateStatus
        const lateCounts = await Attendance.aggregate([
            {
                $match: {
                    lateStatus: "Late",  // ✅ Use lateStatus instead of status
                    date: { $regex: `^${currentMonth}` } // Match dates in current month
                }
            },
            {
                $group: {
                    _id: "$emp_id",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert array to object { emp_id: count }
        const lateCountMap = {};
        lateCounts.forEach(({ _id, count }) => {
            lateCountMap[_id] = count;
        });

        res.json(lateCountMap);
    } catch (error) {
        console.error("Error fetching late counts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

  addAttendance.get("/getSingleAttendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find by _id or emp_id
      const attendance = await Attendance.findOne({
        emp_id: id 
      });
  
      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
  
      res.status(200).json(attendance);
    } catch (error) {
      console.error("Error fetching attendance record:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  

  addAttendance.get("/getAttendanceByDate", async (req, res) => {
    try {
        const { emp_id1, date } = req.query;

        // Check if emp_id and date are provided
       
        // Find attendance by emp_id and date
        const attendance = await Attendance.find({emp_id:emp_id1 });

        if (!attendance) {
            return res.status(404).json({ message: `No attendance found for emp_id: ${emp_id1} on date: ${date}` });
        }

        res.status(200).json({
            message: "Attendance record found",
            data: attendance
        });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

  
  
export default addAttendance;


