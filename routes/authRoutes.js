// import express from 'express';
// import db from '../config/dbControl.js';

// const authRouter = express.Router();

// // Login route
// authRouter.post('/login', (req, res) => {
//   const { email, password } = req.body;
//   console.log(req.body);
  
//   const query =
//     'SELECT * FROM master m RIGHT JOIN role_and_permission r ON m.role_id = r.role_id WHERE m.emp_email = ? AND m.emp_password = ?';

//   db.query(query, [email, password], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: 'Database error', error: err });
//     }

//     if (result.length === 0) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const user = result[0];
   
    
//     // Directly send the user data as a JSON response
//     return res.json({
      // isAuthenticated: true,
      // emp_id: user.emp_id,
      // emp_full_name: user.emp_full_name,
      // emp_personal_email: user.emp_personal_email,
      // emp_phone_no: user.emp_phone_no,
      // emp_addhar_no: user.emp_addhar_no,
      // emp_pan_card_no: user.emp_pan_card_no,
      // emp_department: user.emp_department,
      // emp_designation: user.emp_designation,
      // emp_join_date: user.emp_join_date,
      // emp_status: user.emp_status,
      // role_id: user.role_id,
      // role_permission: user.role_permission,
      // emp_email: user.emp_email,
      // emp_password: user.emp_password,
      // role: user.role,
      // permission: user.permission,
      // total_leave: user.total_leave  // Ensure total_leave is here
//     });
//   });
// });


// // Logout route
// authRouter.post('/logout', (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).json({ message: 'Failed to log out' });
//     }
//     res.clearCookie('isAuthenticated');
//     return res.json({ message: 'Logged out successfully' });
//   });
// });

// // Check session route (for front-end validation)
// authRouter.get('/session', (req, res) => {
//   if (req.session.user) {
//     return res.json({
//       isAuthenticated: true,
//       user: req.session.user,
//     });
//   } else {
//     return res.status(401).json({ isAuthenticated: false });
//   }
// });



// authRouter.put('/updateUserPassword', (req, res) => {
//   const { empId, oldPassword, newPassword } = req.body;

//   // Input validation
//   if (!empId || !oldPassword || !newPassword) {
//       return res.status(400).json({
//           success: false,
//           message: 'All fields are1 required'
//       });
//   }

//   // First check if employee exists and verify old password
//   const checkQuery = 'SELECT * FROM master WHERE emp_id = ? AND emp_password = ?';
  
//   db.query(checkQuery, [empId, oldPassword], (error, results) => {
//       if (error) {
//           console.error('Error checking employee:', error);
//           return res.status(500).json({
//               success: false,
//               message: 'Database error'
//           });
//       }

//       if (results.length === 0) {
//           return res.status(401).json({
//               success: false,
//               message: 'Invalid current password'
//           });
//       }

//       // Update password
//       const updateQuery = 'UPDATE master SET emp_password = ? WHERE emp_id = ?';
      
//       db.query(updateQuery, [newPassword, empId], (updateError, updateResults) => {
//           if (updateError) {
//               console.error('Error updating password:', updateError);
//               return res.status(500).json({
//                   success: false,
//                   message: 'Error updating password'
//               });
//           }

//           if (updateResults.affectedRows > 0) {
//               return res.status(200).json({
//                   success: true,
//                   message: 'Password updated successfully'
//               });
//           } else {
//               return res.status(500).json({
//                   success: false,
//                   message: 'Failed to update password'
//               });
//           }
//       });
//   });
// });

// export default authRouter;


import express from 'express';
import User from '../models/User.js'; // User model
import Role from '../models/Role.js'; // Role model

const authRouter = express.Router();

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ emp_email: email });
console.log(user);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the provided password matches the stored password (without hashing)
    if (user.emp_password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Fetch the role associated with the user
    const role = await Role.findOne({ role_id: user.role_id });
    console.log(role.name);
    
    if (!role) {
      return res.status(403).json({ message: 'Role not found' });
    }

    // Send user data along with role and permission details
    return res.json({
      isAuthenticated: true,
      emp_id: user.emp_id,
      emp_full_name: user.emp_full_name,
      emp_personal_email: user.emp_personal_email,
      emp_phone_no: user.emp_phone_no,
      emp_addhar_no: user.emp_addhar_no,
      emp_pan_card_no: user.emp_pan_card_no,
      emp_department: user.emp_department,
      emp_designation: user.emp_designation,
      emp_join_date: user.emp_join_date,
      emp_status: user.emp_status,
      role_id: user.role_id,
      role_permission: role.permission,  // Corrected to access role permission from the 'role' object
      emp_email: user.emp_email,
      emp_password: user.emp_password,
      role: role.role,  // Corrected to access role from the 'role' object
      permission: role.permission,  // Ensure total_leave is here
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

authRouter.put('/updateUserPassword', async (req, res) => {
  try {
      const { empId, oldPassword, newPassword } = req.body;

      // Input validation
      if (!empId || !oldPassword || !newPassword) {
          return res.status(400).json({
              success: false,
              message: 'All fields are required'
          });
      }

      // Find user by empId and check old password
      const user = await User.findOne({ emp_id: empId, emp_password: oldPassword });

      if (!user) {
          return res.status(401).json({
              success: false,
              message: 'Invalid current password'
          });
      }

      // Update password
      user.emp_password = newPassword;
      await user.save();

      return res.status(200).json({
          success: true,
          message: 'Password updated successfully'
      });

  } catch (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({
          success: false,
          message: 'Server error'
      });
  }
});
export default authRouter;


