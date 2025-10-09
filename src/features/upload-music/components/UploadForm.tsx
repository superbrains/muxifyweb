import React, { useState } from 'react';
import { Button, Input } from '@shared/components';
import { useUploadMusic } from '../hooks/useUploadMusic';
import { validateFileType, validateFileSize, formatFileSize } from '@shared/lib';
import { MAX_FILE_SIZES, FILE_TYPES } from '@app/lib/constants';

export const UploadForm: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        album: '',
        genre: '',
        releaseDate: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { uploadMusic, loading } = useUploadMusic();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!validateFileType(file, [...FILE_TYPES.audio])) {
            setErrors(prev => ({ ...prev, file: 'Please select a valid audio file (MP3, WAV, FLAC, AAC, M4A)' }));
            return;
        }

        // Validate file size
        if (!validateFileSize(file, MAX_FILE_SIZES.audio)) {
            setErrors(prev => ({ ...prev, file: `File size must be less than ${formatFileSize(MAX_FILE_SIZES.audio)}` }));
            return;
        }

        setSelectedFile(file);
        setErrors(prev => ({ ...prev, file: '' }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.artist) newErrors.artist = 'Artist is required';
        if (!formData.genre) newErrors.genre = 'Genre is required';
        if (!selectedFile) newErrors.file = 'Please select a file';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !selectedFile) return;

        await uploadMusic({
            ...formData,
            file: selectedFile,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Track Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={errors.title}
                    placeholder="Enter track title"
                    required
                />

                <Input
                    label="Artist"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    error={errors.artist}
                    placeholder="Enter artist name"
                    required
                />

                <Input
                    label="Album"
                    name="album"
                    value={formData.album}
                    onChange={handleInputChange}
                    placeholder="Enter album name (optional)"
                />

                <Input
                    label="Genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    error={errors.genre}
                    placeholder="Enter genre"
                    required
                />

                <Input
                    label="Release Date"
                    name="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    placeholder="Select release date"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <span>Upload a file</span>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept=".mp3,.wav,.flac,.aac,.m4a"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">MP3, WAV, FLAC, AAC, M4A up to 50MB</p>
                        {selectedFile && (
                            <p className="text-sm text-gray-900 mt-2">
                                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                            </p>
                        )}
                    </div>
                </div>
                {errors.file && (
                    <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                )}
            </div>

            <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline">
                    Cancel
                </Button>
                <Button type="submit" loading={loading}>
                    Upload Music
                </Button>
            </div>
        </form>
    );
};
