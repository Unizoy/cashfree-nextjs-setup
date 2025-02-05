import { withContentlayer } from "next-contentlayer2"

import "./env.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
}

export default withContentlayer(nextConfig)
