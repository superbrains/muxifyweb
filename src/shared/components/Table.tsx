import React from 'react';

interface Column<T> {
    key: keyof T;
    title: string;
    render?: (value: any, record: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyText?: string;
    onRowClick?: (record: T) => void;
    className?: string;
}

export const Table = <T extends Record<string, any>>({
    data,
    columns,
    loading = false,
    emptyText = 'No data available',
    onRowClick,
    className = ''
}: TableProps<T>) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                {emptyText}
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.align === 'center' ? 'text-center' :
                                    column.align === 'right' ? 'text-right' : 'text-left'
                                    }`}
                                style={{ width: column.width }}
                            >
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((record, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onRowClick?.(record)}
                        >
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.align === 'center' ? 'text-center' :
                                        column.align === 'right' ? 'text-right' : 'text-left'
                                        }`}
                                >
                                    {column.render
                                        ? column.render(record[column.key], record)
                                        : record[column.key]
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
