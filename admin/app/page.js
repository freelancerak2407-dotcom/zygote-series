'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login
        router.push('/login');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">🧬</div>
                <h1 className="text-3xl font-bold text-primary-500">ZYGOTE</h1>
                <p className="text-gray-600 mt-2">Admin Portal</p>
            </div>
        </div>
    );
}
