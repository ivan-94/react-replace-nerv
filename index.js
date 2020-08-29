const React = require('react');
const ReactDOM = require('react-dom');
const Taro = require('@tarojs/taro');

const Nerv = {};

Object.assign(Nerv, React, ReactDOM);

// 改写 Owner
// 这种行为依赖于 React 的底层行为，所以不推荐
const ReactCurrentOwner = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
delete ReactCurrentOwner.current;
let currentOwnner;
Object.defineProperty(ReactCurrentOwner, 'current', {
  get() {
    return currentOwnner;
  },
  set(v) {
    currentOwnner = v;
    if (v && v.stateNode) {
      v.stateNode.hooks = v.stateNode.hooks || [];
      Taro.Current.current = v.stateNode;
      Taro.Current.index = 0;
    }
  },
});

function getReactOwner() {
  return ReactCurrentOwner.current;
}

const HOOKS = [
  'useCallback',
  'useContext',
  'useDebugValue',
  'useEffect',
  'useImperativeHandle',
  'useLayoutEffect',
  'useMemo',
  'useRef',
  'useState',
  'useReducer',
];

HOOKS.forEach((hook) => {
  Nerv[hook] = function () {
    const owner = getReactOwner();
    if (owner == null) {
      throw new Error('请在组件内使用 Hooks');
    }

    // 类组件, Taro 2.x 会将函数式组件转换为 类组件，所以一般走这里
    if (owner.stateNode) {
      Taro[hook].apply(null, arguments);
    } else {
      // 函数组件
      React[hook].apply(null, arguments);
    }
  };
});

Nerv.nextTick = function (fn) {
  var args = [],
    len = arguments.length - 1;
  while (len-- > 0) args[len] = arguments[len + 1];

  fn = isFunction(fn) ? fn.bind.apply(fn, [null].concat(args)) : fn;
  if (typeof Promise !== 'undefined') {
    return resolved.then(fn);
  }
  var timerFunc = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : setTimeout;
  timerFunc(fn);
};

// Current & getHooks
Nerv.Current = Taro.Current;
Nerv.getHooks = function getHooks(index) {
  if (Taro.Current.current === null) {
    throw new Error(`invalid hooks call: hooks can only be called in a stateless component.`);
  }
  const hooks = Taro.Current.current.hooks;
  if (index >= hooks.length) {
    hooks.push({});
  }
  return hooks[index];
};

// PropTypes
const noop = () => {};
var shim = noop;
shim.isRequired = noop;
function getShim() {
  return shim;
}
var PropTypes = {
  array: shim,
  bool: shim,
  func: shim,
  number: shim,
  object: shim,
  string: shim,
  any: shim,
  arrayOf: getShim,
  element: shim,
  instanceOf: getShim,
  node: shim,
  objectOf: getShim,
  oneOf: getShim,
  oneOfType: getShim,
  shape: getShim,
  exact: getShim,
  PropTypes: {},
  checkPropTypes: noop,
};
PropTypes.PropTypes = PropTypes;
Nerv.PropTypes = PropTypes;

Nerv.default = Nerv;

module.exports = Nerv;
