module.exports = {
  transpilePackages: ['undici', 'firebase', '@firebase/functions'],
  experimental: {
    esmExternals: 'loose'
  }
}
