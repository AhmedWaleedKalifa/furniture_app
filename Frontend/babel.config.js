//work without style
// // babel.config.js
// module.exports = function (api) {
//     api.cache(true);
//     return {
//       presets: ['babel-preset-expo'],
     
//     };
//   };

module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel"
      ],
    };
  };
  