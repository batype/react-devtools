# React Developer Tools 3.4.2

3.x 主版本系列的归档分支，实际版本 **3.4.2**。安装包来自官方发布渠道，扩展文件原样解压。

## 下载与安装

1. [下载本分支 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v3.zip) 并解压，或下载 `downloads/react-devtools-3.4.2-chrome.zip`。
2. Chrome 打开 `chrome://extensions/`；Edge 打开 `edge://extensions/`，开启「开发者模式」。
3. 点击「加载已解压的扩展程序」，选择包含 `manifest.json` 的 `extension/` 目录；若下载的是 downloads 中的 ZIP，则选择其解压根目录。
4. 停用其他 React DevTools 版本，刷新 React 网页并重新打开开发者工具。

本版本采用 Manifest V2，Chrome 139 及以上无法加载。仅供兼容旧环境的历史归档；Edge 的支持情况取决于实际浏览器版本。

## 来源与校验

- [官方安装包来源](https://github.com/facebook/react-devtools/releases/download/3.4.2/chrome-extension.zip)
- [对应上游源码](https://github.com/facebook/react-devtools/tree/3.4.2)
- `version.json` 记录实际版本、归档来源与浏览器要求。
- `SHA256SUMS` 保存下载文件校验值，可运行 `shasum -a 256 -c SHA256SUMS`。
- 已检查包内版本及 ZIP 完整性；未逐版本进行浏览器运行测试。
- 早期系列选用官方现存发布附件，未声称收录该系列最后一个补丁版本。
- 许可证见 `LICENSE`；如果附有 `PATENTS`，也一并保留。

[返回全部主版本索引](https://github.com/batype/react-devtools)
