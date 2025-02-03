module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // クライアントからのリクエスト
        destination: 'http://localhost:5001/:path*', // 実際のAPIサーバー
      },
    ];
  },
};
