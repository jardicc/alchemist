// eslint-disable-next-line no-undef
module.exports = (wallaby) => {
  return {
    files: ['src/**/*.ts', 'src/**/*.tsx', '!**/_tests_/**/*'],

    tests: ['**/_tests_/**/*.ts'],

    env: {
      type: 'node'
    },

    testFramework: 'jest',

    workers: {
      initial: 7,
      regular: 5,
      restart: true
    }
  }
}
