import express from 'express';
import Attendance from '../models/attendance.js';
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

 
  addAttendance.post("/addAttendance", async (req, res) => {
    try {
      const { emp_id, date, time_in, status } = req.body;
  
      if (!emp_id || !date || !time_in) {
        return res.status(400).json({ message: "emp_id, date, and time_in are required" });
      }
  
      // Find shift for this employee
      const shift = await Shift.findOne({ });
  
      if (!shift) {
        return res.status(404).json({ message: "Shift data not found for employee" });
      }
  
      let late_by = "N/A";
      let finalStatus = status || "Present"; // If status is not sent, default to "Present"
  
      // Convert shift_in and time_in to minutes
      const timeInMinutes = convertToMinutes(time_in);
      const shiftInMinutes = convertToMinutes(shift.shift_in);
  
      // Calculate Late By (time_in - shift_in)
      if (timeInMinutes > shiftInMinutes) {
        late_by = formatMinutes(timeInMinutes - shiftInMinutes);
       
      }
  
      const newAttendance = new Attendance({
        emp_id,
        date,
        time_in,
        time_out: "N/A",
        total_work_duration: "N/A",
        late_by,
        early_out: "N/A",
        record_clock_in: true, // Set true when clocking in
        record_clock_out: false, // Set false until clock-out
        status: finalStatus, // Use HR's status or auto-set
      });
  
      await newAttendance.save();
  
      res.status(201).json({ message: "Attendance saved successfully", data: newAttendance });
    } catch (error) {
      console.error("Error saving attendance:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  

  // Utility function to convert time (HH:mm) to minutes
  function convertToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }
  
  // Utility function to format minutes as HH:mm
  function formatMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }  
  addAttendance.put("/updateAttendance/:id", async (req, res) => {
    try {
      const { id } = req.params; // Object ID from URL
      const { emp_id, time_out } = req.body;
  
      if (!emp_id || !time_out) {
        return res.status(400).json({ message: "emp_id and time_out are required" });
      }
  
      // Find existing attendance record
      const attendance = await Attendance.findOne({ _id: id, emp_id });
  
      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
  
      // Find employee shift data
      const shift = await Shift.findOne({  });
  
      if (!shift) {
        return res.status(404).json({ message: "Shift data not found for employee" });
      }
  
      const timeInMinutes = convertToMinutes(attendance.time_in);
      const timeOutMinutes = convertToMinutes(time_out);
      const shiftOutMinutes = convertToMinutes(shift.shift_out);
  
      // Calculate total work duration
      const total_work_duration = formatMinutes(timeOutMinutes - timeInMinutes);
  
      // Calculate early out (if time_out is before shift_out)
      let early_out = "N/A";
      if (timeOutMinutes < shiftOutMinutes) {
        early_out = formatMinutes(shiftOutMinutes - timeOutMinutes);
      }
  
      // Update the attendance record
      attendance.time_out = time_out;
      attendance.total_work_duration = total_work_duration;
      attendance.early_out = early_out;
      attendance.record_clock_out = true;
  
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


