const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost/VetoNest/public/index.php',
            changeOrigin: true,
            secure: false,
            ws: true,
            onProxyReq: (proxyReq, req, res) => {
                // Log proxy requests for debugging
                console.log('Proxying:', req.method, req.url);
            },
            onProxyRes: (proxyRes, req, res) => {
                // ─── FIX: Rewrite cookie domain and path ──────────────────────
                const setCookie = proxyRes.headers['set-cookie'];
                if (setCookie) {
                    // Rewrite cookies to work with localhost:3000
                    proxyRes.headers['set-cookie'] = setCookie.map(cookie => {
                        // Replace domain and ensure path is correct
                        return cookie
                            .replace(/domain=[^;]+;?/i, 'domain=localhost;')
                            .replace(/path=[^;]+;?/i, 'path=/;')
                            .replace(/secure;?/i, '');
                    });
                    console.log('Rewritten cookies:', proxyRes.headers['set-cookie']);
                }
            }
        })
    );
};