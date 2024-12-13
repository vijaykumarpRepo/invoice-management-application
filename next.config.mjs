/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
          {
            source: "/", // Match the root URL
            destination: "/dashboard", // Redirect to the dashboard
            permanent: true, // Set to true if this is a permanent redirect (301)
          },
        ];
      },
    
};

export default nextConfig;
