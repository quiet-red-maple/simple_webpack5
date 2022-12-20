module.exports = {
  // 智能预设 能够编译es6语法
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage', // 按需加载自动引入
        corejs: 3,
      }, // 配置之后看不到打包出来的corejs是因为babel会判断browserlist里指定的范围
    ],
  ],
}