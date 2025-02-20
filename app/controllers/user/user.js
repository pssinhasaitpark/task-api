const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {jwtAuthentication} = require("../../helpers");
const { emails} = require("../../helpers");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { authVailidation } = require("../../joivalidators");
const {handleResponse}=require("../../helpers/handleResponse")


exports.registerUser = async (req, res) => {
  try {
    const result = await authVailidation.authSchema.validateAsync(req.body);
    const { email, password, mobile_no } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return handleResponse(res, 400,"User is already registered");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const role_id = 5;

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        mobile_no,
        role_id: parseInt(role_id, 10),
      },
    });

    await emails.sendRegistrationEmail(newUser.email);

    return handleResponse(res, 201, "User registered successfully", newUser);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return handleResponse(res, 500, err.message || "An unexpected error occurred");
    }
  }
};
 
exports.loginUser = async (req, res) => {
  try {
    const result = await authVailidation.loginSchema.validateAsync(req.body);
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!existingUser) {
      return handleResponse(res, 404, "User is not registered");
    }

    const isValidPassword = await bcrypt.compare(password, existingUser.password);

    if (!isValidPassword) {
      return handleResponse(res, 401, "Email/password is not valid");
    }
   
   if(existingUser.role_id===1){
    const token=await jwtAuthentication.signAccessToken(existingUser.id, existingUser.role_id);
    const encryptedToken = jwtAuthentication.encryptToken(token);
    return handleResponse(res, 200, "Admin Dashboard", { encryptedToken });
   }


   else if(existingUser.role_id===2){
    const accessToken = await jwtAuthentication.signAccessToken(existingUser.id, existingUser.role_id);
    const encryptedToken = jwtAuthentication.encryptToken(accessToken);
    return handleResponse(res, 200, "Seller Dashboard", { encryptedToken });
   }

   else if(existingUser.role_id===3){
    const accessToken = await jwtAuthentication.signAccessToken(existingUser.id, existingUser.role_id);
    const encryptedToken = jwtAuthentication.encryptToken(accessToken);
    return handleResponse(res, 200, "Builder Dashboard", { encryptedToken });
   }   

   else if(existingUser.role_id===4){
    const accessToken = await jwtAuthentication.signAccessToken(existingUser.id, existingUser.role_id);
    const encryptedToken = jwtAuthentication.encryptToken(accessToken);
    return handleResponse(res, 200, "Agent Dashboard", { encryptedToken });
   }   

   else if(existingUser.role_id===4){
    const accessToken = await jwtAuthentication.signAccessToken(existingUser.id, existingUser.role_id);
    const encryptedToken = jwtAuthentication.encryptToken(accessToken);
    return handleResponse(res, 200, "User Dashboard", { encryptedToken });
   }   
     



   const accessToken = await jwtAuthentication.signAccessToken(existingUser.id, existingUser.role_id);
   const encryptedToken = jwtAuthentication.encryptToken(accessToken);
    return handleResponse(res, 200, "User Login successful", { token: encryptedToken });


  } catch (err) {
    return handleResponse(res, err.status || 500, err.message || "An unexpected error occurred");
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: {  // Changed from role_management to role
          select: {
            role: true,
          },
        },
      },
    });

    return handleResponse(res, 200, "All Users with Role Details", { users });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "An unexpected error occurred");
  }
};


exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      console.error("Error executing query: Missing id");
      return handleResponse(res, 400, "Id is required.");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: id,  // No need to parse since id is already a string
      },
      include: {
        role: true, // Include role details if needed
      },
    });

    if (!user) {
      return handleResponse(res, 404, "User not found with the provided id.");
    }
    return handleResponse(res, 200, "User found", { user });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "An unexpected error occurred");
  }
};


exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = parseInt(id, 10);
    const { email, password, mobileno,first_name,last_name} = req.body;
    

    let imageUrls = [];
        if (req.files && req.files.length > 0) {
          const uploadPromises = req.files.map((file) => cloudinary.uploadImageToCloudinary(file.buffer));
          imageUrls = await Promise.all(uploadPromises);
        }
    

    if (!id) {
      console.error("Error executing query: Missing id");
      return handleResponse(res, 400, "Id is required.");
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return handleResponse(res, 400, "User is not found with provided id");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        email: email,
        password: hashPassword,
        mobileno: mobileno,
        first_name:first_name,
        last_name:last_name,
        image: imageUrls,
      },
    });

    if (!updatedUser) {
      return handleResponse(res, 404, "User not found with the provided id.");
    }

    return handleResponse(res, 200, "User Updated Successfully");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "An unexpected error occurred");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      console.error("Error executing query: Missing id");
      return handleResponse(res, 400, "Id is required.");
    }
    
    const userId = parseInt(id, 10);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return handleResponse(res, 404, "User not found with the provided id.");
    }

    await prisma.user.delete({
      where: {
        id: userId
      },
    });

    return handleResponse(res, 200, "User deleted successfully");
  } catch (error) {
    console.error(error);
    return handleResponse(res, 500, error.message || "An unexpected error occurred");
  }
};

exports.forgatePassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await authVailidation.forgatePasswordSchema.validateAsync(req.body);

    const user = await prisma.user.findUnique({
      where: {
        email: email
      },
    });

    if (!user) {
      return handleResponse(res, 404, "User is not registered");
    }

    const resetToken = await jwtAuthentication.signResetToken(email);  
    await emails.sendResetEmail(user.email, resetToken);

    return handleResponse(res, 200, "Password reset email sent successfully", { token: resetToken });
  } catch (error) {
    console.error(error);
    return handleResponse(res, 400, error.message || "An error occurred during the password reset process");
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const { token } = req.query;


  try {
    await authVailidation.resetSchema.validateAsync(req.body);
  } catch (validationError) {
    return handleResponse(res, 400, validationError.details[0].message);
  }

  try {
    if (newPassword !== confirmPassword) {
      return handleResponse(res, 400, 'Passwords do not match');
    }

    let decoded;
    try {
      decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);

    } catch (err) {
      return handleResponse(res, 400, 'Invalid or expired token');
    }

    if (!decoded || !decoded.email) {
      return handleResponse(res, 400, 'Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return handleResponse(res, 404, 'User not found');
    }

    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return handleResponse(res, 400, 'Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: user.email },
      data: { password: hashedPassword },
    });

    return handleResponse(res, 200, 'Password has been successfully reset');
  } catch (err) {
    console.error('Error resetting password:', err);
    return handleResponse(res, 400, err.message || 'An error occurred during the password reset process');
  }
};



