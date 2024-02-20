/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
        {
            source: "/",
            destination: "/user/login",
            permanent: true,
        },
        ];
    },
};

export default nextConfig;
