# React Developer Tools 4.28.5

本分支收集 4.x 系列的代表版本 **4.28.5**，从固定的官方源码提交构建。它不是 Chrome Web Store 签名原包。

## 安装

1. [下载本分支 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v4.zip) 并解压，或下载 `downloads/react-devtools-4.28.5-chrome.zip`。
2. Chrome 打开 `chrome://extensions/`，Edge 打开 `edge://extensions/`，开启「开发者模式」。
3. 点击「加载已解压的扩展程序」，选择包含 `manifest.json` 的 `extension/` 目录；若下载的是 downloads 中的 ZIP，则选择其解压根目录。
4. 停用其他 React DevTools 版本，刷新 React 页面并重新打开开发者工具。

使用 Manifest V3。请同时满足 manifest.json 中的 minimum_chrome_version 要求。

## 来源及校验

- 官方源码：https://github.com/facebook/react/tree/ef8a840bd6fbb01f806b3cc297da168d9a91730c
- 完整版本和构建来源：`version.json`。
- 包校验：`shasum -a 256 -c SHA256SUMS`。
- 已检查包内版本、运行文件引用、非空运行文件及 ZIP 完整性；尚未在浏览器中逐版本运行测试。
- 构建方法见 [主分支的归档工作流](https://github.com/batype/react-devtools/actions/workflows/archive-build.yml)。
- 此版本遵循随附的 `LICENSE`。

[返回全部主版本索引](https://github.com/batype/react-devtools)
