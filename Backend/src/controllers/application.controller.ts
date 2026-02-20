import { Request, Response } from 'express';
import Application from '../models/Application';
import Scheme from '../models/Scheme';
import { ApiResponse, AuthRequest } from '../types';

// Create new application
export const createApplication = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { schemeId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!schemeId) {
      res.status(400).json({
        success: false,
        message: 'Scheme ID is required',
      });
      return;
    }

    // Check if scheme exists
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
      return;
    }

    // Check if user already applied for this scheme
    const existingApplication = await Application.findOne({
      userId,
      schemeId,
    });

    if (existingApplication) {
      res.status(400).json({
        success: false,
        message: 'You have already applied for this scheme',
        data: existingApplication,
      });
      return;
    }

    // Create application
    const application = await Application.create({
      userId,
      schemeId,
      status: 'pending',
      appliedDate: new Date(),
      lastUpdated: new Date(),
      documentsUploaded: [],
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error in createApplication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all applications for a user
export const getUserApplications = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { status } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const filter: any = { userId };

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .sort({ appliedDate: -1 })
      .populate('schemeId', 'name category amount');

    res.status(200).json({
      success: true,
      message: 'Applications fetched successfully',
      data: {
        count: applications.length,
        applications,
      },
    });
  } catch (error) {
    console.error('Error in getUserApplications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get application by ID
export const getApplicationById = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const application = await Application.findOne({
      _id: id,
      userId,
    }).populate('schemeId', 'name category description documents amount applyUrl');

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Application fetched successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error in getApplicationById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update application status (Admin only)
export const updateApplicationStatus = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required',
      });
      return;
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'under-review'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
      return;
    }

    const application = await Application.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          remarks,
          lastUpdated: new Date(),
        },
      },
      { new: true }
    ).populate('schemeId', 'name category');

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all applications (Admin only)
export const getAllApplications = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { status, schemeId, page = 1, limit = 20 } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (schemeId) {
      filter.schemeId = schemeId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const applications = await Application.find(filter)
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('schemeId', 'name category amount')
      .populate('userId', 'name phone state district');

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Applications fetched successfully',
      data: {
        applications,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error in getAllApplications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete application
export const deleteApplication = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const application = await Application.findOneAndDelete({
      _id: id,
      userId,
      status: 'pending', // Only allow deletion of pending applications
    });

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found or cannot be deleted',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteApplication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
