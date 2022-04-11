const PROXY_CONFIG = [
  {
    context: [
      "/api",
    ],
    target: "https://localhost:40433",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
