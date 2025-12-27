'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar({ user, currentPath }) {
    const router = useRouter();

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            router.push('/login');
        }
    };

    const menuItems = [
        { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
        { icon: '📚', label: 'Tracks', path: '/admin/tracks' },
        { icon: '📖', label: 'Subjects', path: '/admin/subjects' },
        { icon: '📝', label: 'Topics', path: '/admin/topics' },
        { icon: '❓', label: 'MCQs', path: '/admin/mcqs' },
        { icon: '👥', label: 'Users', path: '/admin/users' },
        { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
        { icon: '💳', label: 'Subscriptions', path: '/admin/subscriptions' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">🧬</div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">ZYGOTE</h2>
                        <p className="text-xs text-gray-500">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = currentPath === item.path || currentPath?.startsWith(item.path + '/');
                        return (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary-50 text-primary-600 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                    <span className="text-xl">🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
