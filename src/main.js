// 完整引入 兼容babel解决不了的高版本js
// import 'core-js';
// import 'core-js/es/promise';

import count from './js/count';
import sum from './js/sum';

import "./css/index.css";
import "./less/index.less";
import "./sass/index.sass";
import "./sass/index.scss";
import './css/iconfont.css';

let result = count(2,1);
 let a;
console.log(a ?? '123')
console.log(result);
console.log(sum(1,2,3,4,5))

document.getElementById('btn').onclick = function () {
  // /* webpackChunkName: "math" */ webpack魔法命名
  import(/* webpackChunkName: "math" */ "./js/math").then(({mul}) => {
    // console.log(19, res.default);
    console.log(mul(3,3));
  })
}

// 实际项目中有 vue-loader react-hot-loader来处理js的热模块替换
// 热模块替换
if (module.hot) {
  module.hot.accept("./js/count");
  module.hot.accept("./js/sum");
}

new Promise((resolve) => {
  setTimeout(() => {
    resolve()
  }, 1000)
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}