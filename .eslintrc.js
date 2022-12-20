module.exports = {
  // 继承 Eslint 规则
  extends: ["eslint:recommended"],
  env: {
    node: true, // 启用node中全局变量
    browser: true, // 启用浏览器中全局变量
  },
  parserOptions: {
    ecmaVersion: 2020, // 支持最新的es规范
    sourceType: "module", // es module
  },
  rules: {
    "no-var": 2, // 不能使用var定义变量
  },
  // Plugins: ["import"], // 解决动态导入语法报错
}