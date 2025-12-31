/** @type {import('next').NextConfig} */
const nextConfig = {
    // Image optimization configuration
    images: {
        domains: [
            'localhost',
            // Add your S3 bucket domain here when configured
            // Example: 'zygote-uploads.s3.amazonaws.com',
            // Or use your CloudFront domain
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.s3.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: '**.cloudfront.net',
            },
        ],
    },

    // Environment variables exposed to the browser
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    },

    // Strict mode for better development experience
    reactStrictMode: true,

    // Disable x-powered-by header for security
    poweredByHeader: false,

    // Compression
    compress: true,

    // Production optimizations
    swcMinify: true,

    // Redirects
    async redirects() {
        return [
            {
                source: '/',
                destination: '/admin/dashboard',
                permanent: false,
            },
        ];
    },

    // Headers for security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
