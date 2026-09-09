import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, too small for a reference photo straight off a
      // phone camera. createMemberOrderAction (src/lib/actions/orders.ts)
      // uploads photos through a Server Action, not a route handler.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
