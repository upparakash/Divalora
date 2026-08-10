import multer from "multer";

const IMAGE_MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const VIDEO_MIME_TO_EXT = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const BANNER_MIME_TO_EXT = { ...IMAGE_MIME_TO_EXT, ...VIDEO_MIME_TO_EXT };

export function extForMimeType(mimetype) {
  return IMAGE_MIME_TO_EXT[mimetype];
}

export function extForBannerMimeType(mimetype) {
  return BANNER_MIME_TO_EXT[mimetype];
}

export function isVideoMimeType(mimetype) {
  return mimetype in VIDEO_MIME_TO_EXT;
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    if (!IMAGE_MIME_TO_EXT[file.mimetype]) {
      return cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
    }
    cb(null, true);
  },
});

// Banners can be a photo or a short video, so this allows both — with a
// much larger limit than product photos, since even a short web-optimized
// clip is easily 5-10x a product photo's size.
export const uploadBanner = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    if (!BANNER_MIME_TO_EXT[file.mimetype]) {
      return cb(new Error("Only JPEG, PNG, WEBP images or MP4/WEBM video are allowed"));
    }
    cb(null, true);
  },
});
