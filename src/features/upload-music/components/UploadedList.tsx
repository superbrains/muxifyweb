import React from 'react';
import { Table } from '@shared/components';
import { formatDate, formatFileSize } from '@shared/lib';
import type { MusicTrack } from '@shared/types';

interface UploadedListProps {
    tracks: MusicTrack[];
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
}

export const UploadedList: React.FC<UploadedListProps> = ({ tracks, onDelete, onEdit }) => {
    const columns = [
        {
            key: 'title' as keyof MusicTrack,
            title: 'Title',
            render: (value: string, record: MusicTrack) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{record.artist}</div>
                </div>
            ),
        },
        {
            key: 'genre' as keyof MusicTrack,
            title: 'Genre',
            render: (value: string) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {value}
                </span>
            ),
        },
        {
            key: 'fileSize' as keyof MusicTrack,
            title: 'Size',
            render: (value: number) => formatFileSize(value),
        },
        {
            key: 'status' as keyof MusicTrack,
            title: 'Status',
            render: (value: string) => {
                const statusClasses = {
                    completed: 'bg-green-100 text-green-800',
                    processing: 'bg-yellow-100 text-yellow-800',
                    failed: 'bg-red-100 text-red-800',
                    uploading: 'bg-blue-100 text-blue-800',
                };
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[value as keyof typeof statusClasses]}`}>
                        {value}
                    </span>
                );
            },
        },
        {
            key: 'createdAt' as keyof MusicTrack,
            title: 'Uploaded',
            render: (value: string) => formatDate(value),
        },
        {
            key: 'actions' as keyof MusicTrack,
            title: 'Actions',
            render: (_value: any, record: MusicTrack) => (
                <div className="flex space-x-2">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(record.id)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(record.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                            Delete
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Uploaded Tracks</h3>
            </div>
            <div className="p-6">
                <Table data={tracks} columns={columns} />
            </div>
        </div>
    );
};
