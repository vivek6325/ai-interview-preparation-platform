import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import Resume from '../models/Resume.js';

/**
 * Resume Controller
 * Handles candidate resume uploads, persistence in MongoDB with in-memory fallback,
 * history retrieval, and safe file lifecycle deletion.
 */

// Local uploads directory path
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// In-memory fallback cache for dev/offline mode when MongoDB connection is unavailable
const inMemoryResumes = new Map();

/**
 * Helper function to safely delete a file from disk without throwing uncaught exceptions.
 * @param {string} fileName - Stored file name in uploads directory
 */
export function safeDeleteDiskFile(fileName) {
  if (!fileName) return false;
  try {
    const filePath = path.resolve(UPLOADS_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ [File Lifecycle] Deleted file from disk: ${fileName}`);
      return true;
    }
  } catch (err) {
    console.warn(`⚠️ [File Lifecycle] Could not delete disk file '${fileName}':`, err.message);
  }
  return false;
}

/**
 * Handles POST /api/resume/upload
 * Process successful resume upload and returns file metadata.
 */
export async function uploadResumeFile(req, res, next) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file attached.'
      });
    }

    const uploadDate = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      file: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadDate
      }
    });
  } catch (err) {
    console.error('❌ [Resume Controller] Error processing upload:', err);
    next(err);
  }
}

/**
 * Handles POST /api/resume/save
 * Saves or updates structured candidate resume and generated questions in MongoDB
 * (with in-memory fallback if database connection is offline).
 */
export async function saveResume(req, res) {
  try {
    const {
      resumeId,
      originalFileName,
      storedFileName,
      fileType,
      fileSize,
      parsedText,
      extractedData,
      interviewQuestions,
      status
    } = req.body;

    if (!originalFileName && !storedFileName) {
      return res.status(400).json({
        success: false,
        message: 'Original and stored file names are required to save resume data.'
      });
    }

    const ext = fileType || (originalFileName?.endsWith('.docx') ? 'DOCX' : 'PDF');
    const userId = (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) ? req.user._id : null;
    const isDbConnected = mongoose.connection.readyState === 1;

    let resumeDoc = null;

    if (isDbConnected) {
      try {
        if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
          resumeDoc = await Resume.findByIdAndUpdate(
            resumeId,
            {
              ...(userId && { userId }),
              originalFileName,
              storedFileName,
              fileType: ext.toUpperCase(),
              fileSize: fileSize || 0,
              parsedText: parsedText || '',
              extractedData: extractedData || {},
              interviewQuestions: interviewQuestions || [],
              status: status || 'questions_generated'
            },
            { new: true }
          );
        }

        if (!resumeDoc) {
          resumeDoc = new Resume({
            ...(userId && { userId }),
            originalFileName: originalFileName || 'Resume.pdf',
            storedFileName: storedFileName || originalFileName || 'resume.pdf',
            fileType: ext.toUpperCase(),
            fileSize: fileSize || 0,
            parsedText: parsedText || '',
            extractedData: extractedData || {},
            interviewQuestions: interviewQuestions || [],
            status: status || 'extracted'
          });
          await resumeDoc.save();
        }
      } catch (dbErr) {
        console.warn('⚠️ [Resume Controller] MongoDB write failed, using fallback:', dbErr.message);
      }
    }

    // Fallback to in-memory store if DB is offline or write timed out
    if (!resumeDoc) {
      const generatedId = resumeId || `mem_resume_${Date.now()}`;
      resumeDoc = {
        _id: generatedId,
        userId,
        originalFileName: originalFileName || 'Resume.pdf',
        storedFileName: storedFileName || originalFileName || 'resume.pdf',
        fileType: ext.toUpperCase(),
        fileSize: fileSize || 0,
        parsedText: parsedText || '',
        extractedData: extractedData || {},
        interviewQuestions: interviewQuestions || [],
        status: status || 'extracted',
        uploadDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryResumes.set(generatedId, resumeDoc);
    }

    console.log(`💾 [Resume Controller] Saved resume record (ID: ${resumeDoc._id})`);

    return res.status(200).json({
      success: true,
      message: 'Resume saved successfully.',
      resumeId: resumeDoc._id,
      resume: resumeDoc
    });
  } catch (err) {
    console.error('❌ [Resume Controller] Save Error:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Unable to save resume record.'
    });
  }
}

/**
 * Handles GET /api/resume
 * Returns all uploaded resumes for the user from MongoDB (or in-memory cache).
 */
export async function getResumes(req, res) {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let resumes = [];

    if (isDbConnected) {
      try {
        const validUserId = (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) ? req.user._id : null;
        const filter = validUserId ? { userId: validUserId } : {};
        resumes = await Resume.find(filter).sort({ createdAt: -1 }).lean();
      } catch (dbErr) {
        console.warn('⚠️ [Resume Controller] MongoDB read failed, using fallback:', dbErr.message);
      }
    }

    // Combine with in-memory records
    if (resumes.length === 0 && inMemoryResumes.size > 0) {
      resumes = Array.from(inMemoryResumes.values()).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    console.log(`📜 [Resume Controller] Fetched ${resumes.length} resume history records.`);

    return res.status(200).json({
      success: true,
      count: resumes.length,
      resumes
    });
  } catch (err) {
    console.error('❌ [Resume Controller] Fetch Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve resume history.'
    });
  }
}

/**
 * Handles GET /api/resume/:id
 * Returns single resume metadata, extracted information, generated questions, and status.
 */
export async function getResumeById(req, res) {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;
    let resume = null;

    if (isDbConnected && mongoose.Types.ObjectId.isValid(id)) {
      try {
        resume = await Resume.findById(id).lean();
      } catch (dbErr) {
        console.warn('⚠️ [Resume Controller] MongoDB findById failed:', dbErr.message);
      }
    }

    if (!resume && inMemoryResumes.has(id)) {
      resume = inMemoryResumes.get(id);
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      resume
    });
  } catch (err) {
    console.error('❌ [Resume Controller] GetById Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve resume details.'
    });
  }
}

/**
 * Handles DELETE /api/resume/:id
 * Deletes MongoDB resume record AND removes stored binary file from disk.
 */
export async function deleteResume(req, res) {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    let resume = null;

    if (isDbConnected && mongoose.Types.ObjectId.isValid(id)) {
      try {
        resume = await Resume.findById(id);
      } catch (dbErr) {
        console.warn('⚠️ [Resume Controller] MongoDB findById for delete failed:', dbErr.message);
      }
    }

    if (!resume && inMemoryResumes.has(id)) {
      resume = inMemoryResumes.get(id);
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume record not found.'
      });
    }

    // Delete stored file from disk
    if (resume.storedFileName) {
      safeDeleteDiskFile(resume.storedFileName);
    }

    // Delete record from MongoDB
    if (isDbConnected && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await Resume.findByIdAndDelete(id);
      } catch (dbErr) {
        console.warn('⚠️ [Resume Controller] MongoDB delete failed:', dbErr.message);
      }
    }

    inMemoryResumes.delete(id);

    console.log(`🗑️ [Resume Controller] Deleted resume record (ID: ${id})`);

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.'
    });
  } catch (err) {
    console.error('❌ [Resume Controller] Delete Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete resume.'
    });
  }
}

export default {
  uploadResumeFile,
  saveResume,
  getResumes,
  getResumeById,
  deleteResume
};
