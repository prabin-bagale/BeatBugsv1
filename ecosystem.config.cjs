module.exports = {
  apps: [
    {
      name: 'beatbugs',
      script: 'npx',
      args: 'next dev -p 3000',
      cwd: '/home/z/my-project',
      watch: false,
      restart_delay: 3000,
    },
  ],
};
