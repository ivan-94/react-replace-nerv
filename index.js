const react = require("react");
const reactDom = require("react-dom");

console.log(reactDom)

const Nerv = {
  ...react,
  ...reactDom,
};

// TODO: nexttick
// TODO: options
// TODO: PropTypes
// TODO: getHooks ReactCurrentOwner.current
// Current
// Taro 2.x 会将函数式组件转换为类组件，所以要区分。
// 这里要重写 Component 注入 Hooks？ withHooks？
// module 形式

Nerv.default = Nerv;

module.exports = Nerv;
