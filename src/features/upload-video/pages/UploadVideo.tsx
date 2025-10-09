import React from 'react';

export const UploadVideo: React.FC = () => {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upload Video</h1>
                <p className="text-gray-600 mt-2">Upload your video content to share with your audience.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Video Upload</h3>
                    <p className="text-gray-500">Video upload functionality will be implemented here.</p>
                </div>
            </div>
        </div>
    );
};

export default UploadVideo;
