import { Request, Response } from 'express';
import Scheme from '../models/Scheme';
import User from '../models/User';
import { ApiResponse, AuthRequest, SchemeRecommendation } from '../types';

// Get all schemes
export const getAllSchemes = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { category, isActive = 'true' } = req.query;

    const filter: any = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (isActive === 'true') {
      filter.isActive = true;
    }

    const schemes = await Scheme.find(filter).select('-__v').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Schemes fetched successfully',
      data: {
        count: schemes.length,
        schemes,
      },
    });
  } catch (error) {
    console.error('Error in getAllSchemes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schemes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get scheme by ID
export const getSchemeById = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const scheme = await Scheme.findById(id).select('-__v');

    if (!scheme) {
      res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Scheme fetched successfully',
      data: scheme,
    });
  } catch (error) {
    console.error('Error in getSchemeById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheme',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get recommended schemes for user
export const getRecommendedSchemes = async (
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

    // Fetch user profile
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Fetch all active schemes
    const schemes = await Scheme.find({ isActive: true });

    // Calculate match scores
    const recommendations: SchemeRecommendation[] = [];

    for (const scheme of schemes) {
      let score = 0;
      const matchReasons: string[] = [];

      // State matching (30 points)
      if (
        !scheme.eligibility.states ||
        scheme.eligibility.states.includes('All States') ||
        scheme.eligibility.states.includes(user.state)
      ) {
        score += 30;
        matchReasons.push('Available in your state');
      }

      // Crop matching (25 points)
      if (
        !scheme.eligibility.crops ||
        scheme.eligibility.crops.length === 0 ||
        scheme.eligibility.crops.includes(user.cropType)
      ) {
        score += 25;
        if (scheme.eligibility.crops && scheme.eligibility.crops.includes(user.cropType)) {
          matchReasons.push(`Suitable for ${user.cropType} farmers`);
        }
      }

      // Farmer category matching (25 points)
      if (
        !scheme.eligibility.farmerCategory ||
        scheme.eligibility.farmerCategory.includes(user.farmerCategory)
      ) {
        score += 25;
        matchReasons.push(`Designed for ${user.farmerCategory} farmers`);
      }

      // Land size matching (20 points total)
      if (scheme.eligibility.minLandSize !== undefined) {
        if (user.landSize >= scheme.eligibility.minLandSize) {
          score += 10;
          matchReasons.push('Meets minimum land requirement');
        }
      } else {
        score += 10; // No minimum requirement
      }

      if (scheme.eligibility.maxLandSize !== undefined) {
        if (user.landSize <= scheme.eligibility.maxLandSize) {
          score += 10;
          matchReasons.push('Within land size limit');
        }
      } else {
        score += 10; // No maximum requirement
      }

      // Only include schemes with score >= 50
      if (score >= 50) {
        recommendations.push({
          scheme,
          matchScore: score,
          matchReasons,
        });
      }
    }

    // Sort by score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      message: 'Recommended schemes fetched successfully',
      data: {
        count: recommendations.length,
        recommendations,
      },
    });
  } catch (error) {
    console.error('Error in getRecommendedSchemes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended schemes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create new scheme (Admin only)
export const createScheme = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const schemeData = req.body;

    const scheme = await Scheme.create(schemeData);

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      data: scheme,
    });
  } catch (error) {
    console.error('Error in createScheme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scheme',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update scheme (Admin only)
export const updateScheme = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const scheme = await Scheme.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!scheme) {
      res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Scheme updated successfully',
      data: scheme,
    });
  } catch (error) {
    console.error('Error in updateScheme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheme',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete scheme (Admin only)
export const deleteScheme = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const scheme = await Scheme.findByIdAndDelete(id);

    if (!scheme) {
      res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Scheme deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteScheme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scheme',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
