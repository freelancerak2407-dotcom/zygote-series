'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);

        // Check if user is admin or editor
        if (userData.role !== 'admin' && userData.role !== 'editor') {
            alert('Access denied. Admin or Editor role required.');
            localStorage.clear();
            router.push('/login');
            return;
        }

        setUser(userData);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar user={user} currentPath={pathname} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {getPageTitle(pathname)}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                                {user?.fullName?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

function getPageTitle(pathname) {
    const titles = {
        '/admin/dashboard': 'Dashboard',
        '/admin/tracks': 'Manage Tracks',
        '/admin/subjects': 'Manage Subjects',
        '/admin/topics': 'Manage Topics',
        '/admin/mcqs': 'Manage MCQs',
        '/admin/users': 'Manage Users',
        '/admin/analytics': 'Analytics',
        '/admin/subscriptions': 'Subscriptions',
    };

    if (pathname.includes('/edit')) {
        return 'Edit Topic';
    }

    return titles[pathname] || 'Admin Panel';
}
