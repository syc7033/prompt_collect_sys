module.exports = {
  apps: [{
    name: "prompt-system-frontend",
    script: "npm",
    args: "run dev",
    watch: false,
    cwd: "/home/dev/PromptSystem/frontend",
    interpreter: "/home/dev/.nvm/versions/node/v16.20.2/bin/node",
    env: {
      NODE_ENV: "development",
      NEXT_PUBLIC_API_URL: "http://www.promptsystemsyc.asia:8000",
      NODE_PATH: "/home/dev/PromptSystem/frontend/node_modules",
      BABEL_ENV: "development",  // 添加Babel环境变量
      NEXT_BABEL_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production",
      NEXT_PUBLIC_API_URL: "http://www.promptsystemsyc.asia:8000",
      NODE_PATH: "/home/dev/PromptSystem/frontend/node_modules"
    }
  }]
}
