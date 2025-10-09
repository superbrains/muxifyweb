export const extractMetadata = (
  _file: File
): Promise<{
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
}> => {
  return new Promise((resolve) => {
    // This would typically use a library like music-metadata
    // For now, we'll return mock data
    resolve({
      duration: Math.random() * 300, // Random duration up to 5 minutes
      bitrate: 320,
      sampleRate: 44100,
    });
  });
};

export const generateWaveform = (_file: File): Promise<number[]> => {
  return new Promise((resolve) => {
    // This would typically use Web Audio API or a library like wavesurfer.js
    // For now, we'll return mock waveform data
    const waveform = Array.from({ length: 100 }, () => Math.random());
    resolve(waveform);
  });
};

export const validateAudioFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const allowedTypes = [
    "audio/mpeg",
    "audio/wav",
    "audio/flac",
    "audio/aac",
    "audio/mp4",
  ];
  const allowedExtensions = [".mp3", ".wav", ".flac", ".aac", ".m4a"];

  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

  if (
    !allowedTypes.includes(file.type) &&
    !allowedExtensions.includes(fileExtension)
  ) {
    return {
      isValid: false,
      error: "Invalid file type. Please select an audio file.",
    };
  }

  if (file.size > 50 * 1024 * 1024) {
    // 50MB
    return {
      isValid: false,
      error: "File size too large. Maximum size is 50MB.",
    };
  }

  return { isValid: true };
};
