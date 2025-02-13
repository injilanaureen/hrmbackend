import express from 'express';
import User from '../models/User.js'
import Department from '../models/Department.js';
import Designation from '../models/Designation.js';
import Role from '../models/Role.js'
import mongoose from 'mongoose';
import Banking from '../models/Banking .js';
import Education from '../models/Education.js';
import PersonalInformation from '../models/PersonalInformation.js';
import moment from 'moment';
import ResignedEmployee from '../models/ResignedEmployee.js';
const addUserRoutes = express.Router();

// Fetch all roles (MongoDB example)

addUserRoutes.get('/fetchRole', async (req, res) => {
  try {
    // Fetch all roles from the Role model (which maps to the 'roles' collection)
    const roles = await Role.find();
    

    return res.json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (err) {
    console.error("Error fetching roles:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch roles",
    });
  }
});


// Fetch role permissions (MongoDB example)

addUserRoutes.get('/getRolePermissions', async (req, res) => {
  const { role_id } = req.query;

  // Ensure the role_id is an integer
  const roleIdInt = parseInt(role_id, 10);

  try {
    // Query for role_id using the Role model
    const role = await Role.findOne({ role_id: roleIdInt });

    if (role) {
      return res.json({
        success: true,
        permissions: role.permission, // Return 'permission' field
      });
    } else {
      return res.status(404).json({
        success: false,
        error: `Role not found or no permissions assigned for role_id: ${roleIdInt}`,
      });
    }
  } catch (err) {
    console.error("Error fetching permissions:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch permissions",
    });
  }
});

  
// Fetch all departments (MongoDB example)
addUserRoutes.get('/fetchDepartment', async (req, res) => {
  try {
    const departments = await Department.find(); // Fetch all departments from the Department model
    return res.json({
      success: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (err) {
    console.error("Error fetching departments:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch departments",
    });
  }
});
// Fetch designations for a specific department (MongoDB example)
addUserRoutes.get('/fetchDesignation', async (req, res) => {
  const { dept_id } = req.query;
  console.log("Department ID received:", dept_id);

  // Log the data type of dept_id

  if (!dept_id) {
    return res.status(400).json({
      success: false,
      error: "Department ID is required",
    });
  }

  try {
    // Query the Designation model for designations in the specific department
    const designations = await Designation.aggregate([
      {
        $match: { dept_id: parseInt(dept_id) }, // Ensure dept_id is treated as a number
      },
      {
        $lookup: {
          from: 'department', // The name of the department collection
          localField: 'dept_id', // Field in Designation that holds the department reference
          foreignField: 'dep_id', // Field in Department collection that matches
          as: 'department_info', // The field to store the populated department details
        },
      },
      {
        $unwind: { path: '$department_info', preserveNullAndEmptyArrays: true }, // Flatten department details
      },
      {
        $project: {
          designation_id: 1,
          designation_name: 1, // Include designation name
          dep_id: 1,
          department_name: { $ifNull: ['$department_info.dep_name', null] },
        },
      },
    ]);

    if (designations.length > 0) {
      return res.json({
        success: true,
        message: "Designations fetched successfully",
        data: designations,
      });
    } else {
      return res.status(404).json({
        success: false,
        error: `No designations found for department ID: ${dept_id}`,
      });
    }
  } catch (err) {
    console.error("Error fetching designations:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch designations",
      details: err.message,
    });
  }
});

// Add new user (MongoDB example)

addUserRoutes.post('/submitUser', async (req, res) => {
  const { empFullName, empPersonalEmail,empConfirmationdate,empofferedCTC, empPhoneNo, empAadhaarNo, empPanCardNo, empDepartment, empDesignation, empJoinDate, empStatus, role, rolePermission, empDob } = req.body;


   const formattedTime = moment().format("YYYY-MM-DD hh:mm A"); // Example: 2025-02-07 12:45 AM
   const last_updated_status = "New";
  const employement_status= 'Probation';
  // const emp_id=  "NIK" + Math.floor(100000 + Math.random() * 900000); // Generate emp_id for MongoDB

  

  // Create a new user instance using Mongoose model
  const newUser = new User({
    emp_full_name: empFullName,
    emp_personal_email: empPersonalEmail,
    emp_phone_no: empPhoneNo,
    emp_addhar_no: empAadhaarNo,
    emp_pan_card_no: empPanCardNo,
    emp_department: empDepartment,
    emp_designation: empDesignation,
    emp_join_date: empJoinDate,
    emp_status: empStatus || "Inactive",
    emp_empstatus:employement_status,
    emp_confirmation_date:empConfirmationdate,
    emp_gender: req.body.empGender,
    emp_dob: empDob,
    emp_offered_ctc:empofferedCTC,
    role_id: role,
    role_permission: rolePermission,
    emp_email: null,
    emp_password: null, // Assuming no password in the form
    manager_id: null,
    team_leader_id: null,
    emp_id:null , // Generated emp_id for future use
    last_updated_time: formattedTime,
    last_updated_status: last_updated_status,
  });

  try {
    // Save the new user data
    const result = await newUser.save();
    return res.json({
      success: true,
      message: "User data submitted successfully",
      data: { id: result.id },
    });
  } catch (err) {
    console.error("Error submitting user data:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to submit user data",
    });
  }
});



// Fetch all employees (MongoDB example)
addUserRoutes.get('/getAllEmployees', async (req, res) => {
  try {
    const employees = await User.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'emp_department',
          foreignField: 'dep_id',
          as: 'department_details',
        },
      },
      {
        $lookup: {
          from: 'designations',
          localField: 'emp_designation',
          foreignField: 'designation_id',
          as: 'designation_details',
        },
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'role_id',
          foreignField: 'role_id',
          as: 'role_details',
        },
      },
      // ✅ Lookup manager name from the master collection (self-reference)
      {
        $lookup: {
          from: 'master', // Self-referencing lookup
          localField: 'manager_id', // Field in this document
          foreignField: 'emp_id', // Matching field in the master collection
          as: 'manager_details',
        },
      },
      // ✅ Lookup team leader name from the master collection (self-reference)
      {
        $lookup: {
          from: 'master', // Self-referencing lookup
          localField: 'team_leader_id', // Field in this document
          foreignField: 'emp_id', // Matching field in the master collection
          as: 'teamleader_details',
        },
      },
      { $unwind: { path: '$department_details', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$designation_details', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$role_details', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$manager_details', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$teamleader_details', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          emp_full_name: 1,
          emp_personal_email: 1,
          emp_phone_no: 1,
          emp_addhar_no: 1,
          emp_department: 1,
          emp_designation: 1,
          role_id: 1,
          emp_email: 1,
          emp_status: 1,
          department_name: { $ifNull: ['$department_details.dep_name', null] },
          designation_name: { $ifNull: ['$designation_details.designation_name', null] },
          role_name: { $ifNull: ['$role_details.role', null] },
          emp_join_date: 1,
          emp_pan_card_no: 1,
          team_leader_id:1,
          manager_id:1,
          manager_name: { $ifNull: ['$manager_details.emp_full_name', null] }, // ✅ Get manager name
          team_leader_name: { $ifNull: ['$teamleader_details.emp_full_name', null] }, // ✅ Get team leader name
          emp_confirmation_date: 1,
          emp_offered_ctc: 1,
          emp_empstatus: 1,
          emp_id: 1,
          emp_dob: 1,
          last_updated_time: 1,
          last_updated_status: 1,
        },
      },
    ]);

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No employees found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully fetched all employee data with populated details",
      data: employees,
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
      details: err.message || err,
    });
  }
});


// Fetch all roles (MongoDB example)

// addUserRoutes.get('/getSingleEmployee/:emp_id', async (req, res) => {
//   const { emp_id } = req.params;

//   if (typeof emp_id !== 'string') {
//       return res.status(400).json({
//           success: false,
//           error: "Invalid emp_id format",
//       });
//   }   

//   try {
//       // Find the employee by emp_id
//       const employee = await User.findOne({ emp_id })
//           .populate('emp_department', 'dep_name') // Populating department info
//           .populate('emp_designation', 'designation_name') // Populating designation info
//           .populate('role_id', 'role permission') // Populating role and permission
//           .populate('team_leader_id', 'emp_full_name') // Populating team leader info
//           .populate('manager_id', 'emp_full_name') // Populating manager info
//           .populate('bank_details') // Populating bank details
//           .populate('personal_information') // Populating personal information
//           .populate('educational_background'); // Populating educational background

//       if (!employee) {
//           return res.status(404).json({
//               success: false,
//               message: "Employee not found",
//           });
//       }

//       return res.status(200).json({
//           success: true,
//           message: "Successfully fetched employee",
//           data: employee,
//       });
//   } catch (err) {
//       console.error("Error fetching employee:", err);
//       return res.status(500).json({
//           success: false,
//           error: "Failed to fetch employee",
//           details: err.message,
//       });
//   }
// });

addUserRoutes.put('/updateUserStatus', async (req, res) => {
  let { id, empStatus, empManager, empTeamLeader, workEmail, empPassword } = req.body;
  const last_updated_status = 'Activated';
  const formattedTime = moment().format("YYYY-MM-DD hh:mm A"); // Example: 2025-02-07 12:45 AM


  // Check if the received id is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Employee ID format"
    });
  }

  try {
    // Now, use the valid ObjectId for querying
    const user = await User.findById(id);  // Directly use the id since it's valid

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Employee not found"
      });
    }

    // Use existing emp_id or generate a new one if not found
    let newEmpId = user.emp_id || null;
    if (!newEmpId) {
      const lastEmp = await User.findOne().sort({ emp_id: -1 }); // Get the last emp_id
      if (lastEmp && lastEmp.emp_id) {
        const lastEmpNumber = parseInt(lastEmp.emp_id.split('-')[1]);
        newEmpId = `NKT-${String(lastEmpNumber + 1).padStart(3, '0')}`;
      } else {
        newEmpId = `NKT-001`;
      }
    }

    // Update employee details
    const updatedUser = await User.findByIdAndUpdate(
      id, // Directly use _id for querying
      {
        $set: {
          emp_status: empStatus,
          manager_id: empManager,
          team_leader_id: empTeamLeader,
          emp_email: workEmail,
          emp_password: empPassword,
          last_updated_status: last_updated_status,
          last_updated_time: formattedTime,
          emp_id: newEmpId,
        }
      },
      { new: true } // Return the updated document
    );

    return res.json({
      success: true,
      message: "Employee details updated successfully",
      empId: updatedUser.emp_id
    });

  } catch (err) {
    console.error("Error updating employee data:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to update employee status",
      details: err
    });
  }
});

addUserRoutes.get("/fetchDesignation", async (req, res) => {
  const { dept_id } = req.query;
  console.log(typeof(dept_id));

  if (!dept_id) {
    return res.status(400).json({
      success: false,
      error: "Department ID is required",
    });
  }

  try {
    const designations = await Designation.find({ dept_id });
    return res.json({
      success: true,
      message: "Designations fetched successfully",
      data: designations,
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch designations",
      details: error.message,
    });
  }
});


// addUserRoutes.get('/fetchDesignation/:id', async (req, res) => {
//     const db = global.dbClient.db('hrmDB'); // Select the database
//     const collection = db.collection('designation'); // Select the collection for designations

//     const { id } = req.params;
//     console.log("Designation ID received:", id);

//     if (!id) {
//         return res.status(400).json({
//             success: false,
//             error: "Missing designation ID parameter",
//         });
//     }

//     try {
//         // Convert id to an integer if it's stored as a number in MongoDB
//         const query = { designation_id: isNaN(id) ? id : parseInt(id) };

//         // Find the designation based on designation_id
//         const designation = await collection.findOne(query);

//         if (!designation) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Designation not found",
//             });
//         }

//         res.json({
//             success: true,
//             message: "Designation fetched successfully",
//             designation,
//         });

//     } catch (err) {
//         console.error("Error fetching designation:", err);
//         return res.status(500).json({
//             success: false,
//             error: "Failed to fetch designation",
//             details: err.message,
//         });
//     }
// });


// POST route to insert data into the Banking collection
addUserRoutes.post('/addBanking', async (req, res) => {
  const { emp_id, bank_name, account_number, ifsc_code, branch_name, account_type } = req.body;

  // Validate the incoming data
  if (!emp_id || !bank_name || !account_number || !ifsc_code || !branch_name || !account_type) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create a new banking document
    const newBanking = new Banking({
      emp_id,
      bank_name,
      account_number,
      ifsc_code,
      branch_name,
      account_type,
    });

    // Save the banking document to the database
    const savedBanking = await newBanking.save();

    // Return a success response
    return res.status(201).json({ message: 'Banking details added successfully', data: savedBanking });
  } catch (error) {
    console.error('Error inserting banking data:', error);
    return res.status(500).json({ message: 'Server error, try again later', error: error.message });
  }
});


addUserRoutes.post('/addEducation', async (req, res) => {
  const { emp_id, degree, institution, year_of_passing } = req.body;

  if (!emp_id || !degree || !institution || !year_of_passing) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const newEducation = new Education({
      emp_id,
      degree,
      institution,
      year_of_passing
    });

    await newEducation.save();
    res.status(201).json({
      message: 'Education details added successfully',
      data: newEducation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// addUserRoutes.get('/getEmployeeDetails/:emp', async (req, res) => {
//   const { emp } = req.params;

//   // Convert emp to string
//   const empIdString = String(emp);
//   console.log(`Emp ID as string: ${empIdString}`);

//   try {
//     const user = await User.find({ });
//     console.log(user);

//     if (!user) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });



addUserRoutes.get('/getSingleEmployeeBy/:emp', async (req, res) => {
  const { emp } = req.params;
  console.log("Searching for emp_id:", emp);

  try {
    // Find employee details
    const user = await User.findOne({ emp_id: emp });
    console.log("User data:", user);

    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Fetch department details
    const department = await Department.findOne({ dep_id: user.emp_department });
    console.log("Department data:", department);

    // Fetch designation details
    const designation = await Designation.findOne({ designation_id: user.emp_designation });
    console.log("Designation data:", designation);

    // Find banking details
    const banking = await Banking.findOne({ emp_id: emp });
    console.log("Banking data:", banking);

    // Find education details
    const education = await Education.findOne({ emp_id: emp });
    console.log("Education data:", education);

    // Find personal details
    const personalData = await PersonalInformation.findOne({ emp_id: emp });
    console.log("Personal data:", personalData);

    // Find manager details
    const manager = await User.findOne({ emp_id: user.manager_id });
    console.log("Manager data:", manager);

    let managerDepartment = null;
    let managerDesignation = null;

    if (manager) {
      managerDepartment = await Department.findOne({ dep_id: manager.emp_department });
      managerDesignation = await Designation.findOne({ designation_id: manager.emp_designation });
    }

    // Find team leader details
    const teamLeader = await User.findOne({ emp_id: user.team_leader_id });
    console.log("Team Leader data:", teamLeader);

    let teamLeaderDepartment = null;
    let teamLeaderDesignation = null;

    if (teamLeader) {
      teamLeaderDepartment = await Department.findOne({ dep_id: teamLeader.emp_department });
      teamLeaderDesignation = await Designation.findOne({ designation_id: teamLeader.emp_designation });
    }

    // Combine all data into one result
    const result = {
      user,
      department,  // Full department details
      designation, // Full designation details
      banking,
      education,
      personalData,
      manager: manager
        ? {
            name: manager.emp_full_name,
            department: managerDepartment ? managerDepartment.dep_name : "Not Assigned",
            designation: managerDesignation ? managerDesignation.designation_name : "Not Assigned",
          }
        : "Not Assigned",
      teamLeader: teamLeader
        ? {
            name: teamLeader.emp_full_name,
            department: teamLeaderDepartment ? teamLeaderDepartment.dep_name : "Not Assigned",
            designation: teamLeaderDesignation ? teamLeaderDesignation.designation_name : "Not Assigned",
          }
        : "Not Assigned",
    };

    // Send the response
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// Insert personal information from request body
addUserRoutes.post("/addPersonalInfo", async (req, res) => {});


// Insert personal information from request body

addUserRoutes.post("/addPersonalInformation", async (req, res) => {
  const {
    emp_id,
    permanent_address,
    permanent_city,
    permanent_state,
    permanent_zip_code,
    current_address,
    current_city,
    current_state,
    current_zip_code,
    alternate_mob_no,
    emergency_person_name,
    emergency_relationship,
    emergency_mob_no,
    emergency_address,
    marital_status,
    blood_group,
    account_holder_name,
    bank_name,
    account_number,
    ifsc_code,
    branch_name,
    education // Expecting an array from frontend
  } = req.body;


  if (!emp_id) {
    return res.status(400).json({ message: "Employee ID is required" });
  }


  try {
    // ✅ Save Personal Information
    const personalInfo = new PersonalInformation({
      emp_id,
      permanent_address,
      permanent_city,
      permanent_state,
      permanent_zip_code,
      current_address,
      current_city,
      current_state,
      current_zip_code,
      alternate_mob_no,
      emergency_person_name,
      emergency_relationship,
      emergency_mob_no,
      emergency_address,
      marital_status,
      blood_group
    });
    await personalInfo.save();

    // ✅ Save Banking Details (if provided)
    let savedBanking = null;
    if (bank_name && account_number && ifsc_code && branch_name) {
      const newBanking = new Banking({
        emp_id,
        account_holder_name,
        bank_name,
        account_number,
        ifsc_code,
        branch_name
      });
      savedBanking = await newBanking.save();
    }

    // ✅ Save Education Details in an array (Fixing your issue)
// Save Education Details (if provided)
if (Array.isArray(education) && education.length > 0) {
  const validEducation = education.filter(edu => edu.degree && edu.institution && edu.year_of_passing);
  
  if (validEducation.length > 0) {
    await Education.findOneAndUpdate(
      { emp_id }, // Find by emp_id
      { $set: { emp_id }, $push: { education: { $each: validEducation } } }, // Append new records
      { new: true, upsert: true } // Create if not exists
    );
  }
}

    // ✅ Update User Master with last_updated_time in "hh:mm A" format
    const formattedTime = moment().format("YYYY-MM-DD hh:mm A"); // Example: 2025-02-07 12:45 AM

    await User.findOneAndUpdate(
      { emp_id: emp_id },
      {
        $set: {
          last_updated_status: "Updated",
          last_updated_time: formattedTime
        }
      },
      { new: true }
    );

    res.status(201).json({
      message: "Personal, Banking, and Education details added successfully, User master updated",
      personalInfo,
      bankingDetails: savedBanking
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "Server error, try again later", error: error.message });
  }
});


addUserRoutes.put('/editEmployeeDetails', async (req, res) => {
  try {
    const { id, newDesignation, newStatus, newMobileNumber, newTeamLeader, newManager } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: "Employee ID is required" });
    }

    // Create an object with only provided fields
    let updateFields = {};
    if (newStatus) updateFields.emp_empstatus = newStatus;
    if (newDesignation) updateFields.emp_designation = newDesignation;
    if (newMobileNumber) updateFields.emp_phone_no = newMobileNumber;
    if (newTeamLeader) updateFields.team_leader_id = newTeamLeader;
    if (newManager) updateFields.manager_id = newManager;

    // If no fields to update, return early
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields provided for update" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { emp_id: id }, // Find user by emp_id
      { $set: updateFields },
      { new: true } // Return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, message: "Employment details updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, error: "Failed to update employment details", details: error.message });
  }
});

//updateEmergencyContact

addUserRoutes.put("/updateEmergencyContact/:id", async (req, res) => {
  try {
    const { id } = req.params; // Corrected param to match route
    const { emergency_person_name, emergency_relationship, emergency_address, emergency_mob_no } = req.body;

    const updatedEmployee = await PersonalInformation.findOneAndUpdate(
      { emp_id: id }, // Find employee by emp_id
      {
        $set: {
          "emergency_person_name": emergency_person_name,
          "emergency_relationship": emergency_relationship,
          "emergency_address": emergency_address,
          "emergency_mob_no": emergency_mob_no,
        },
      },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    res.json({ success: true, data: updatedEmployee });
  } catch (error) {
    console.error("Error updating emergency contact:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});




//updateNamemarital_status

addUserRoutes.put("/updateNamemarital_status/:id", async (req, res) => {
  console.log("id:", req.params.id);
  console.log("body:", req.body);

  try {
    const { id } = req.params;
    const { emp_name, marital_status } = req.body;

    if (!emp_name || !marital_status) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    // Update name in the User model
    const updatedUser = await User.findOneAndUpdate(
      { emp_id: id }, 
      { $set: { emp_full_name: emp_name } }, 
      { new: true }
    );

    // Update marital status in the PersonalInformation model
    const updatedPersonalInfo = await PersonalInformation.findOneAndUpdate(
      { emp_id: id }, 
      { $set: { marital_status: marital_status } }, 
      { new: true }
    );

    if (!updatedUser || !updatedPersonalInfo) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    res.json({
      success: true,
      message: "Name and marital status updated successfully",
      data: { updatedUser, updatedPersonalInfo },
    });

  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


addUserRoutes.put("/updatePersonalIdentity/:id", async (req, res) => {
  try {
    const { id } = req.params; // Employee ID (emp_id)
    const { emp_addhar_no, emp_pan_card_no } = req.body;

    // Check if required fields exist
    if (!emp_addhar_no || !emp_pan_card_no) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    // Find user by emp_id and update the fields
    const updatedUser = await User.findOneAndUpdate(
      { emp_id: id }, // Find by emp_id
      {
        $set: {
          emp_addhar_no: emp_addhar_no,
          emp_pan_card_no: emp_pan_card_no,
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, message: "Personal identity updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating personal identity:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});




addUserRoutes.post("/resigned_employees",async (req, res) => {
  try {
    const {
      emp_id,
      employee_name,
      last_working_day,
      total_work_period,
      last_ctc_drawn,
      last_designation,
      reason_for_resignation,
      feedback,
      exit_interview_done,
      notice_period_served,
      emp_status,
      emp_empstatus,
    } = req.body;

    // Insert into ResignedEmployee collection
    const resignedEmployee = new ResignedEmployee({
      emp_id,
      employee_name,
      last_working_day,
      total_work_period,
      last_ctc_drawn,
      last_designation,
      reason_for_resignation,
      feedback,
      exit_interview_done,
      notice_period_served,
    });

    await resignedEmployee.save();

    // Update Employee status in Employee collection
    await User.findOneAndUpdate(
      { emp_id: emp_id },
      { emp_status: emp_status, emp_empstatus: emp_empstatus }
    );

    res.status(200).json({ success: true, message: "Resignation details saved successfully" });
  } catch (error) {
    console.error("Error saving resignation details:", error);
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
});

// Fetch all resigned employees
addUserRoutes.get('/fetch_resigned_employees',async (req, res) => {
  try {
    const resignedEmployees = await ResignedEmployee.find();
    res.status(200).json(resignedEmployees);
  } catch (error) {
    console.error("Error fetching resigned employees:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});


export default addUserRoutes;

