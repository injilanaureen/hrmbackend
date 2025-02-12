import express from "express";
import Holiday from "../models/holidayList.js"; // Ensure correct file path

const addHoliday = express.Router();

// POST route to add a new holiday
addHoliday.post("/add", async (req, res) => {
  try {
    const { holidayName, month, day, weekDateName, status } = req.body;

    const newHoliday = new Holiday({
      holidayName,
      month,
      day,
      weekDateName,
      status: status || "Week Off", // Default to "Week Off" if not provided
    });

    await newHoliday.save();
    res.status(201).json({ message: "Holiday added successfully", holiday: newHoliday });
  } catch (error) {
    res.status(500).json({ message: "Error adding holiday", error });
  }
});

addHoliday.get("/holidays", async (req, res) => {
  try {
    const { date } = req.query;
    console.log(date)

    if (date) {
      // Extract month and day from date
      const parsedDate = new Date(date);
      const month = parsedDate.toLocaleString("en-US", { month: "long" }); // e.g., "March"
      const day = parsedDate.getDate().toString(); // e.g., "14"

      // Find holiday by month and day
      const holiday = await Holiday.findOne({ month, day });

      if (holiday) {
        return res.json(holiday);
      } else {
        return res.status(200).json({ message: "No holiday on this date" });
      }
    } 

    // If no date is provided, return all holidays
    const holidays = await Holiday.find();
    res.json(holidays);

  } catch (error) {
    console.error("Error fetching holiday:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
  // UPDATE a holiday by ID
addHoliday.put("/update-holidays/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedHoliday = await Holiday.findByIdAndUpdate(id, req.body, {
        new: true, // Return updated document
        runValidators: true, // Validate data
      });
  
      if (!updatedHoliday) {
        return res.status(404).json({ message: "Holiday not found" });
      }
  
      res.status(200).json(updatedHoliday);
    } catch (error) {
      res.status(500).json({ message: "Error updating holiday", error });
    }
  });
  //all holidays
  addHoliday.get("/holidays", async (req, res) => {
    try {
      const holidays = await Holiday.find(); // Fetch all holidays from the database
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  // Delete Holiday by ID
addHoliday.delete('/deleteHoliday/:id', async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id);

        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }

        res.json({ message: 'Holiday deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting holiday', error });
    }
});
export default addHoliday;

