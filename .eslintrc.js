module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
};
