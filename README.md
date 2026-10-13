# React Developer Tools 离线安装包

官方 Chrome Web Store 最新稳定版 **8.0.0**，于 2026-10-13 下载并核对版本。适用于 Chrome 114 及以上，以及兼容 Manifest V3 的 Microsoft Edge。

## 安装（推荐）

1. 下载本仓库的 ZIP 并解压，或下载 `downloads/react-devtools-8.0.0-chrome.zip` 并解压。
2. Chrome 打开 `chrome://extensions/`；Edge 打开 `edge://extensions/`。
3. 开启右上角「开发者模式」，点击「加载已解压的扩展程序」。
4. 选择包含 `manifest.json` 的目录。本仓库中为 `react-devtools-8.0.0-chrome/`。
5. 打开 React 网页，刷新页面，再打开浏览器开发者工具，即可看到 **Components** 和 **Profiler** 面板。

请保留扩展所在目录；浏览器之后仍会从这个目录读取文件。如果已安装其他版本的 React Developer Tools，请先停用旧版本，避免重复运行。

## 文件

- `react-devtools-8.0.0-chrome/`：从官方安装包原样解压的扩展。
- `downloads/react-devtools-8.0.0-chrome.zip`：移除 CRX 容器头后得到的原始 ZIP，适合离线安装。
- `downloads/react-devtools-8.0.0-chrome.crx`：Google 官方更新服务提供的原始签名安装包。Chrome 可能限制商店外的 CRX 安装，优先使用上面的加载目录方式。
- `version.json`：版本、官方下载地址、上游代码修订号。
- `SHA256SUMS`：下载文件的 SHA-256 校验值。macOS/Linux 可运行 `shasum -a 256 -c SHA256SUMS`。

## 官方来源

- [React 官方使用说明](https://react.dev/learn/react-developer-tools)
- [Chrome Web Store](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [上游源码](https://github.com/facebook/react/tree/main/packages/react-devtools-extensions)
- [版本更新记录](https://github.com/facebook/react/blob/main/packages/react-devtools/CHANGELOG.md)

扩展 ID：`fmkadmapgofadopljbjfkapdkoienihi`。上游修订号：`1d34f91dfd`。

这是官方扩展的个人离线镜像，扩展内容未修改。软件版权归 Meta Platforms, Inc. 及相关贡献者所有，遵循 MIT 许可证；见 `LICENSE`。
