module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/postcss.config.ts [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/[root-of-the-server]__1snju7z._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/postcss.config.ts [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];