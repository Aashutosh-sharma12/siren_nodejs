const argEnvIndex = process.argv.indexOf('--env')
let argEnv = (argEnvIndex !== -1 && process.argv[argEnvIndex + 1]) || ''
const RUN_ENV_MAP = {
  development: {
    instances: 1,
    max_memory_restart: '512M',
    autorestart: false,
    watch: false,
    watch_delay: 3000,
    port: 3001
  },
  test: {
    instances: 2,
    max_memory_restart: '512M',
    autorestart: false,
    watch: false,
    watch_delay: 3000,
    port: 3001
  },
  production: {
    instances: 1,
    max_memory_restart: '1000M',
    autorestart: true,
    watch: false,
    watch_delay: 3000,
    port: 3001
  }
}

if (!(argEnv in RUN_ENV_MAP)) {
  argEnv = 'development'
}

module.exports = {
  apps: [
    {
      name: "Astro-Nodejs",
      script: "./dist/index.js",
      node_args: "--max-old-space-size=4096", // Memory flag
      exec_mode: 'cluster',
      instances: RUN_ENV_MAP[argEnv].instances,
      max_memory_restart: RUN_ENV_MAP[argEnv].max_memory_restart,
      out_file: "./pm2logs/out.log",
      error_file: "./pm2logs/error.log",
      merge_logs: true,
      log_date_format: "DD-MM HH:mm:ss Z",
      log_type: "json",
      env_development: {
        NODE_ENV: 'development',
        PORT: RUN_ENV_MAP[argEnv].port,
        watch: RUN_ENV_MAP[argEnv].watch,
        watch_delay: RUN_ENV_MAP[argEnv].watch_delay,
        ignore_watch: [
          "./node_modules",
          "./app/views",
          "./public",
          "./.DS_Store",
          "./package.json",
          "./yarn.lock",
          "./samples",
          "./src"
        ]
      },
      env_test: {
        NODE_ENV: 'test',
        PORT: RUN_ENV_MAP[argEnv].port,
        watch: RUN_ENV_MAP[argEnv].watch,
        watch_delay: RUN_ENV_MAP[argEnv].watch_delay,
        ignore_watch: [
          "./node_modules",
          "./app/views",
          "./public",
          "./.DS_Store",
          "./package.json",
          "./yarn.lock",
          "./samples",
          "./src"
        ]
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: RUN_ENV_MAP[argEnv].port,
        watch: RUN_ENV_MAP[argEnv].watch,
        watch_delay: RUN_ENV_MAP[argEnv].watch_delay,
        ignore_watch: [
          "./node_modules",
          "./app/views",
          "./public",
          "./.DS_Store",
          "./package.json",
          "./yarn.lock",
          "./samples",
          "./src"
        ]
      },
    },
  ],
};
