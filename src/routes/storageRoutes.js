// src/routes/storageRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'conship-documents';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://documents.conship.com`;

/**
 * Upload document to R2
 * POST /api/storage/upload
 * Body: FormData with file, requestId, documentType
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { requestId, documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required' });
    }

    if (!documentType) {
      return res.status(400).json({ error: 'documentType is required' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${timestamp}-${hash}.${fileExtension}`;

    // Create the S3 key using requestId/documentType/filename structure
    const key = `${requestId}/${documentType}/${fileName}`;

    console.log('📤 Uploading to R2:', {
      bucket: BUCKET_NAME,
      key: key,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname
    });

    // Upload to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        requestId: requestId,
        documentType: documentType,
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    await r2Client.send(uploadCommand);

    // Generate public URL (if your R2 bucket has public access)
    // Or generate a signed URL for private buckets
    const fileUrl = `${PUBLIC_URL}/${key}`;

    console.log('✅ Upload successful:', fileUrl);

    res.json({
      success: true,
      key: key,
      fileUrl: fileUrl,
      fileName: fileName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      requestId: requestId,
      documentType: documentType,
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
    });
  }
});

/**
 * Get all documents for a request
 * GET /api/storage/documents/:requestId
 */
router.get('/documents/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    console.log('📂 Listing documents for request:', requestId);

    // List all objects with the requestId prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${requestId}/`,
    });

    const response = await r2Client.send(listCommand);
    const documents = [];

    if (response.Contents) {
      for (const object of response.Contents) {
        // Parse the key to extract documentType and filename
        const keyParts = object.Key.split('/');
        const documentType = keyParts[1] || 'unknown';
        const fileName = keyParts[2] || 'unknown';

        documents.push({
          key: object.Key,
          fileUrl: `${PUBLIC_URL}/${object.Key}`,
          documentType: documentType,
          fileName: fileName,
          size: object.Size,
          lastModified: object.LastModified,
          etag: object.ETag,
        });
      }
    }

    console.log(`✅ Found ${documents.length} documents for request ${requestId}`);

    res.json({
      success: true,
      requestId: requestId,
      documentCount: documents.length,
      documents: documents,
    });

  } catch (error) {
    console.error('❌ Error listing documents:', error);
    res.status(500).json({
      error: 'Failed to list documents',
      message: error.message,
    });
  }
});

/**
 * Generate a signed URL for private document access
 * GET /api/storage/signed-url
 * Query: key (the R2 object key)
 */
router.get('/signed-url', async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'key parameter is required' });
    }

    // Generate signed URL valid for 1 hour
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    res.json({
      success: true,
      signedUrl: signedUrl,
      expiresIn: 3600, // seconds
    });

  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    res.status(500).json({
      error: 'Failed to generate signed URL',
      message: error.message,
    });
  }
});

/**
 * Health check for storage service
 * GET /api/storage/health
 */
router.get('/health', async (req, res) => {
  try {
    // Try to list objects (with limit 1) to check R2 connectivity
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1,
    });

    await r2Client.send(listCommand);

    res.json({
      success: true,
      service: 'storage',
      status: 'healthy',
      bucket: BUCKET_NAME,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Storage health check failed:', error);
    res.status(503).json({
      success: false,
      service: 'storage',
      status: 'unhealthy',
      error: error.message,
    });
  }
});

module.exports = router;
