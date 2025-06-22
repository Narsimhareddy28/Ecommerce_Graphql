export default {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test/setup.js']

};