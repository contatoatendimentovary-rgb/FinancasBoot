{
  "version": 2,
  "routes": [
    { "src": "/api/ia", "dest": "server.js" },
    { "src": "/(.*)", "dest": "/public/$1" }
  ]
}
