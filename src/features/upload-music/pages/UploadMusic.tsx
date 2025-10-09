import React from 'react';
import { UploadForm } from '../components/UploadForm';
import { UploadProgress } from '../components/UploadProgress';
import { UploadedList } from '../components/UploadedList';
import { useUploadMusicStore } from '../store/useUploadMusicStore';
import { useUploadMusic } from '../hooks/useUploadMusic';

export const UploadMusic: React.FC = () => {
    const { tracks, uploads } = useUploadMusicStore();
    const { deleteTrack } = useUploadMusic();

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this track?')) {
            await deleteTrack(id);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upload Music</h1>
                <p className="text-gray-600 mt-2">Upload your music tracks to distribute them across platforms.</p>
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Track</h2>
                    <UploadForm />
                </div>

                {uploads.length > 0 && (
                    <UploadProgress uploads={uploads} />
                )}

                {tracks.length > 0 && (
                    <UploadedList tracks={tracks} onDelete={handleDelete} />
                )}
            </div>
        </div>
    );
};

export default UploadMusic;
