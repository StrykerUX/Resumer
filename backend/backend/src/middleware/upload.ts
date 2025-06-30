import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.memoryStorage();

// Enhanced file filter with better security checks
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  // Check MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF y DOCX'), false);
  }

  // Check file extension
  const allowedExtensions = ['.pdf', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Extensión de archivo no válida'), false);
  }

  // Check filename for suspicious patterns
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|scr|pif|jar|com)$/i,
    /[<>:"|?*]/,
    /\x00/,
    /^\./,
    /\.{2,}/
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
    return cb(new Error('Nombre de archivo no válido'), false);
  }

  cb(null, true);
};

// Validate file content based on magic bytes
export const validateFileContent = (buffer: Buffer, mimetype: string): boolean => {
  const magicBytes = buffer.subarray(0, 8);
  
  if (mimetype === 'application/pdf') {
    // PDF magic bytes: %PDF
    const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46]);
    return magicBytes.subarray(0, 4).equals(pdfSignature);
  }
  
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // DOCX magic bytes: PK (ZIP signature, since DOCX is a ZIP file)
    const zipSignature = Buffer.from([0x50, 0x4B]);
    return magicBytes.subarray(0, 2).equals(zipSignature);
  }
  
  return false;
};

// Calculate file size limits based on user plan
export const getFileSizeLimit = (userPlan: string): number => {
  const limits = {
    free: 3 * 1024 * 1024,    // 3MB for free users
    basic: 5 * 1024 * 1024,   // 5MB for basic users
    premium: 10 * 1024 * 1024  // 10MB for premium users
  };
  
  return limits[userPlan as keyof typeof limits] || limits.free;
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max (will be checked per user plan later)
    files: 1, // Only one file at a time
    fieldSize: 1024, // 1KB field size limit
    fieldNameSize: 100, // Field name size limit
    headerPairs: 20 // Limit header pairs
  }
});