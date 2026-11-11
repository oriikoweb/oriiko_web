const fs = require("node:fs");
const path = require("node:path");

try {
  const msPkgPath = path.resolve(__dirname, "../node_modules/magic-string/package.json");
  if (!fs.existsSync(msPkgPath)) {
    process.exit(0);
  }

  const msPkg = JSON.parse(fs.readFileSync(msPkgPath, "utf8"));
  const cjsPath = path.resolve(__dirname, "../node_modules/magic-string/dist/index.cjs");
  const mjsPath = path.resolve(__dirname, "../node_modules/magic-string/dist/index.mjs");

  if (!fs.existsSync(cjsPath) && fs.existsSync(mjsPath)) {
    const babel = require("next/dist/compiled/babel/core");
    const pluginTransform = require("next/dist/compiled/babel/plugin-transform-modules-commonjs");
    const mjsCode = fs.readFileSync(mjsPath, "utf8");
    const transpiled = babel.transformSync(mjsCode, {
      plugins: [pluginTransform],
    });
    fs.writeFileSync(cjsPath, transpiled.code, "utf8");
  }

  let modified = false;
  if (msPkg.main !== "./dist/index.cjs") {
    msPkg.main = "./dist/index.cjs";
    modified = true;
  }

  if (typeof msPkg.exports === "object" && msPkg.exports !== null) {
    if (typeof msPkg.exports["."] === "string") {
      msPkg.exports["."] = {
        import: "./dist/index.mjs",
        require: "./dist/index.cjs",
        types: "./dist/index.d.mts",
      };
      modified = true;
    } else if (typeof msPkg.exports["."] === "object" && !msPkg.exports["."].require) {
      msPkg.exports["."].require = "./dist/index.cjs";
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(msPkgPath, JSON.stringify(msPkg, null, 2), "utf8");
  }
} catch (err) {
  console.warn("Could not patch magic-string:", err);
}
