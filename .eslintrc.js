module.exports = {
  root: true,
  env: {
    mocha: true,
    es6: true,
    'shared-node-browser': true
  },
  'extends': [
    'alloy',
    'alloy/typescript'
  ],
  globals: {
    RequestCredentials: true
  },
  rules: {
    "no-param-reassign": "off",
    "no-eq-null": "off",
    eqeqeq: ['error', 'always', { null: 'ignore' }],
  }
}
