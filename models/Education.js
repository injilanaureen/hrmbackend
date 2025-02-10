import mongoose from 'mongoose';

// Education Schema (Now Supports Multiple Entries per emp_id)
const educationSchema = new mongoose.Schema({
  emp_id: { type: String, required: true }, // Reference to the User's emp_id
  education: [
    {
      degree: { type: String, required: true },
      institution: { type: String, required: true },
      year_of_passing: { type: String, required: true } // Keep it as String to allow 'NA'
    }
  ]
});

const Education = mongoose.model('Education', educationSchema);

export default Education;
