import React from 'react';
import type { UploadProgress as UploadProgressType } from '../types/uploadMusic.d';

interface UploadProgressProps {
    uploads: UploadProgressType[];
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ uploads }) => {
    if (uploads.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Progress</h3>
            <div className="space-y-4">
                {uploads.map((upload) => (
                    <div key={upload.fileId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                                File ID: {upload.fileId}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${upload.status === 'completed' ? 'bg-green-100 text-green-800' :
                                upload.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    upload.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                }`}>
                                {upload.status}
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${upload.progress}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{upload.progress}% complete</span>
                            <span>
                                {upload.status === 'uploading' && 'Uploading...'}
                                {upload.status === 'processing' && 'Processing...'}
                                {upload.status === 'completed' && 'Completed'}
                                {upload.status === 'failed' && 'Failed'}
                            </span>
                        </div>

                        {upload.error && (
                            <div className="mt-2 text-sm text-red-600">
                                Error: {upload.error}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
