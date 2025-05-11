/** @type {import('next').NextConfig} */
const nextConfig = {images: {
  remotePatterns: [
    {
      protocol: "https",  // or "http" if applicable
      hostname: "your-image-domain.com", // Replace with your image domain (e.g., example.com)
    },
  ],
  
  },};

export default nextConfig;
