module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  'extends': [
    'eslint-config-alloy/typescript'
  ],
  globals: {},
  rules: {
    // @fixable 一个缩进必须用两个空格替代
    'indent': [
      'error',
      2,
      {
        SwitchCase: 1,
        flatTernaryExpressions: true
      }
    ]
  }
}
