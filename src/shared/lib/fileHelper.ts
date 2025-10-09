export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

export const isAudioFile = (filename: string): boolean => {
  const audioExtensions = ["mp3", "wav", "flac", "aac", "m4a", "ogg"];
  const extension = getFileExtension(filename);
  return audioExtensions.includes(extension);
};

export const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ["mp4", "avi", "mov", "wmv", "mkv", "webm"];
  const extension = getFileExtension(filename);
  return videoExtensions.includes(extension);
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
};

export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  const extension = getFileExtension(file.name);
  return allowedTypes.includes(extension);
};
