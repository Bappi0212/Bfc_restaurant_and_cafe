import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Turbopack কনফিগ এখানে এম্পটি অবজেক্ট হিসেবে দিয়ে দিলে এরর চলে যাবে
  turbopack: {}, 
};

export default withPWA(nextConfig);