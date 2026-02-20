import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwtUtils';
import { saveOTP, verifyOTP, sendOTP } from '../utils/otpService';
import { ApiResponse, AuthRequest } from '../types';

// Send OTP for registration/login
export const sendOTPController = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number is required',
      });
      return;
    }

    // Generate and save OTP
    const otp = await saveOTP(phone);

    // Send OTP via SMS
    const sent = await sendOTP(phone, otp);

    if (!sent) {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone,
        expiresIn: '10 minutes',
      },
    });
  } catch (error) {
    console.error('Error in sendOTPController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Verify OTP and register/login user
export const verifyOTPController = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { phone, otp, userData } = req.body;

    if (!phone || !otp) {
      res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
      return;
    }

    // Verify OTP
    const isValid = await verifyOTP(phone, otp);

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
      return;
    }

    // Check if user exists
    let user = await User.findOne({ phone });

    if (!user) {
      // Register new user
      if (!userData) {
        res.status(400).json({
          success: false,
          message: 'User data is required for registration',
        });
        return;
      }

      user = await User.create({
        ...userData,
        phone,
        isPhoneVerified: true,
      });
    } else {
      // Update phone verification status
      user.isPhoneVerified = true;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      phone: user.phone,
    });

    res.status(200).json({
      success: true,
      message: user.isNew ? 'Registration successful' : 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          state: user.state,
          district: user.district,
          landSize: user.landSize,
          cropType: user.cropType,
          farmerCategory: user.farmerCategory,
        },
      },
    });
  } catch (error) {
    console.error('Error in verifyOTPController:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get current user profile
export const getProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const user = await User.findById(userId).select('-__v');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update user profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const updates = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Don't allow updating phone number
    delete updates.phone;
    delete updates.isPhoneVerified;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
