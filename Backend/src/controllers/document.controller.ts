import { Response } from 'express';
import Document from '../models/Document';
import Application from '../models/Application';
import { ApiResponse, AuthRequest } from '../types';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
});

// Upload document
export const uploadDocument = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { applicationId, documentType } = req.body;
    const file = req.file;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'File is required',
      });
      return;
    }

    if (!applicationId || !documentType) {
      res.status(400).json({
        success: false,
        message: 'Application ID and document type are required',
      });
      return;
    }

    // Verify application exists and belongs to user
    const application = await Application.findOne({
      _id: applicationId,
      userId,
    });

    if (!application) {
      // Delete uploaded file if application not found
      fs.unlinkSync(file.path);
      
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    // Create document record
    const document = await Document.create({
      applicationId,
      userId,
      documentType,
      fileName: file.originalname,
      fileUrl: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      isVerified: false,
    });

    // Update application with uploaded document
    application.documentsUploaded.push(document._id.toString());
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get documents for an application
export const getApplicationDocuments = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { applicationId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Verify application belongs to user
    const application = await Application.findOne({
      _id: applicationId,
      userId,
    });

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    const documents = await Document.find({ applicationId }).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Documents fetched successfully',
      data: {
        count: documents.length,
        documents,
      },
    });
  } catch (error) {
    console.error('Error in getApplicationDocuments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete document
export const deleteDocument = async (
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

    const document = await Document.findOne({
      _id: id,
      userId,
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found',
      });
      return;
    }

    // Delete file from filesystem
    try {
      if (fs.existsSync(document.fileUrl)) {
        fs.unlinkSync(document.fileUrl);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }

    // Remove document reference from application
    await Application.findByIdAndUpdate(
      document.applicationId,
      { $pull: { documentsUploaded: document._id.toString() } }
    );

    // Delete document record
    await Document.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Verify document (Admin only)
export const verifyDocument = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'isVerified must be a boolean value',
      });
      return;
    }

    const document = await Document.findByIdAndUpdate(
      id,
      { $set: { isVerified } },
      { new: true }
    );

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Document ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: document,
    });
  } catch (error) {
    console.error('Error in verifyDocument:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
