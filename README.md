# React Developer Tools 主版本归档

每个浏览器扩展主版本对应一个分支，收集一个稳定代表版本。主分支提供总索引，并保留 8.0.0 官方离线包。归档日期：2026-10-13。

## 版本与下载

| 分支 | 实际扩展版本 | 安装包来源 | 扩展格式 / 声明的最低版本 | 下载 |
| --- | --- | --- | --- | --- |
| [v8](https://github.com/batype/react-devtools/tree/v8) | 8.0.0 | 官方原包 | MV3 / Chrome ≥ 114 | [下载 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v8.zip) |
| [v7](https://github.com/batype/react-devtools/tree/v7) | 7.0.1 | 官方源码构建 | MV3 / Chrome ≥ 114 | [下载 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v7.zip) |
| [v6](https://github.com/batype/react-devtools/tree/v6) | 6.1.5 | 官方源码构建 | MV3 / Chrome ≥ 114 | [下载 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v6.zip) |
| [v5](https://github.com/batype/react-devtools/tree/v5) | 5.3.1 | 官方源码构建 | MV3 / Chrome ≥ 102 | [下载 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v5.zip) |
| [v4](https://github.com/batype/react-devtools/tree/v4) | 4.28.5 | 官方源码构建 | MV3 / Chrome ≥ 102 | [下载 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v4.zip) |
| [v3](https://github.com/batype/react-devtools/tree/v3) | 3.4.2 | 官方原包 | MV2 / Chrome ≥ 49 | [下载 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v3.zip) |
| [v2](https://github.com/batype/react-devtools/tree/v2) | 2.5.1 | 官方源码构建 | MV2 / Chrome ≥ 49 | [下载 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v2.zip) |
| [v0](https://github.com/batype/react-devtools/tree/v0) | 0.14.6 | 官方原包 | MV2 / Chrome ≥ 43 | [下载 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v0.zip) |

表格中的最低版本来自各包 manifest；Manifest V2 另有下面的限制。

`0.x`、`2.x`、`3.x` 使用 Manifest V2，Chrome 139 及以上已无法加载。归档用于兼容旧环境，不能通过简单更改 manifest_version 迁移到现代浏览器。[Chrome 官方说明](https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline)。Edge 的历史扩展支持取决于实际浏览器版本。

## 安装

1. 在上表选择版本，点击「下载 ZIP」并解压。
2. Chrome 打开 `chrome://extensions/`；Edge 打开 `edge://extensions/`，开启「开发者模式」。
3. 点击「加载已解压的扩展程序」，选择对应分支中包含 `manifest.json` 的 `extension/` 文件夹。
4. 停用其他 React Developer Tools 版本，刷新 React 网页并重新打开开发者工具。

如果下载的是分支 `downloads/` 中的单独安装 ZIP，解压后直接选择包含 manifest.json 的根目录。

若下载的是 main 分支 ZIP，8.0.0 的安装目录仍为 `react-devtools-8.0.0-chrome/`。

## 收集规则与来源

- 仅按浏览器扩展主版本分支整理，不为每个补丁单独建分支；React DevTools 的版本号与 React 本身的版本号不同。
- 浏览器扩展归档包含 `0.x`、`2.x`–`8.x`。官方旧仓库标签和浏览器扩展归档未找到 `1.x`；npm `react-devtools@1.x` 是独立桌面版，不作为 Chrome 扩展收录。
- `v0` 和 `v3` 选用官方 GitHub 现存发布附件，分别是 0.14.6 和 3.4.2，不声称它们是该系列最后一个补丁。
- `v2` 从官方 `v2.5.2` 标签的固定提交构建，包内原始 Chrome manifest 版本为 **2.5.1**。归档按真实扩展版本命名，没有修改 manifest 来伪装版本。
- `v4`–`v7` 从固定官方源码提交构建，ZIP 可以解压加载，但不是商店签名 CRX。构建环境的兼容调整记录在各分支 version.json 以及主分支工作流中。
- `v8` 是 Google 官方更新服务下载的 8.0.0 原包。
- 各分支包含 `extension/`、`downloads/`、`version.json`、`SHA256SUMS` 和对应历史许可证；早期版本如有 PATENTS 也保留。
- 已校验包内版本、运行文件及图标引用、ZIP 完整性、解压内容一致性和 SHA-256；未逐版本进行浏览器运行测试。

## 校验及构建

在任一版本分支根目录运行 `shasum -a 256 -c SHA256SUMS`。

[历史源码构建工作流](https://github.com/batype/react-devtools/actions/workflows/archive-build.yml) 支持选择单个主版本构建。配置见 `scripts/build-versions.json`，每次构建产物保留 30 天；本仓库版本分支中的归档文件不受 Actions 产物保留期限影响。

机器可读的总索引见 `versions.json`。来源、具体构建记录和许可证请查看相应分支。

[React 官方说明](https://react.dev/learn/react-developer-tools) · [当前官方源码](https://github.com/facebook/react/tree/main/packages/react-devtools-extensions) · [旧版官方发布附件](https://github.com/facebook/react-devtools/releases)
