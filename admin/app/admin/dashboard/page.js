'use client';

import { useState, useEffect } from 'react';
import { tracksAPI, subjectsAPI, topicsAPI } from '@/lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalTracks: 0,
        totalSubjects: 0,
        totalTopics: 0,
        totalMCQs: 0,
        totalUsers: 0,
        activeSubscriptions: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const tracksRes = await tracksAPI.getAll();
            setStats((prev) => ({ ...prev, totalTracks: tracksRes.data?.length || 0 }));

            // You can add more API calls here for other stats
            setLoading(false);
        } catch (error) {
            console.error('Failed to load stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                    <div className="grid grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ZYGOTE Admin</h2>
                <p className="text-gray-600">Manage your medical learning platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Tracks"
                    value={stats.totalTracks}
                    icon="📚"
                    color="bg-blue-500"
                />
                <StatsCard
                    title="Total Subjects"
                    value={stats.totalSubjects}
                    icon="📖"
                    color="bg-green-500"
                />
                <StatsCard
                    title="Total Topics"
                    value={stats.totalTopics}
                    icon="📝"
                    color="bg-purple-500"
                />
                <StatsCard
                    title="Total MCQs"
                    value={stats.totalMCQs}
                    icon="❓"
                    color="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon="👥"
                    color="bg-indigo-500"
                />
                <StatsCard
                    title="Active Subscriptions"
                    value={stats.activeSubscriptions}
                    icon="💳"
                    color="bg-teal-500"
                />
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickActionCard
                        title="Create Track"
                        description="Add a new MBBS year track"
                        icon="➕"
                        href="/admin/tracks"
                    />
                    <QuickActionCard
                        title="Create Subject"
                        description="Add a new subject"
                        icon="➕"
                        href="/admin/subjects"
                    />
                    <QuickActionCard
                        title="Create Topic"
                        description="Add a new topic"
                        icon="➕"
                        href="/admin/topics"
                    />
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, color }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function QuickActionCard({ title, description, icon, href }) {
    return (
        <a
            href={href}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start gap-4">
                <div className="text-3xl">{icon}</div>
                <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </div>
        </a>
    );
}
