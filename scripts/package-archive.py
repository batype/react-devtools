import json, sys, zipfile, hashlib, shutil
from pathlib import Path
src, dest, expected, upstream, revision = sys.argv[1:]
src, dest = Path(src), Path(dest)
m = json.loads((src / 'manifest.json').read_text())
assert m['version'] == expected, (expected, m['version'])
refs = [m['devtools_page']]
bg = m.get('background', {})
refs += bg.get('scripts', [])
if bg.get('service_worker'): refs.append(bg['service_worker'])
for cs in m.get('content_scripts', []): refs += cs.get('js', []) + cs.get('css', [])
for f in refs: assert (src / f).is_file(), f
assert all((src / f).stat().st_size for f in refs), 'Empty runtime file'
dest.mkdir(parents=True, exist_ok=True)
shutil.copytree(src, dest / 'extension', dirs_exist_ok=True)
(dest / 'downloads').mkdir(exist_ok=True)
zpath = dest / 'downloads' / ('react-devtools-' + expected + '-chrome.zip')
with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
 for f in sorted(src.rglob('*')):
  if f.is_file(): z.write(f, f.relative_to(src).as_posix())
with zipfile.ZipFile(zpath) as z: assert z.testzip() is None
meta = {'version': expected, 'branch': 'v'+expected.split('.')[0], 'kind': 'source-build', 'upstream_repository': upstream, 'source_revision': revision, 'source_url': 'https://github.com/'+upstream+'/tree/'+revision, 'manifest_version': m['manifest_version'], 'minimum_chrome_version': m.get('minimum_chrome_version'), 'archive_date': '2026-10-13', 'validation': ['manifest version', 'manifest runtime paths', 'nonempty runtime files', 'ZIP CRC'], 'runtime_browser_test': False}
(dest / 'version.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2)+'\n')
license_path = Path('upstream/LICENSE')
shutil.copy2(license_path, dest / 'LICENSE')
shas = [hashlib.sha256(f.read_bytes()).hexdigest()+'  '+f.relative_to(dest).as_posix() for f in sorted((dest / 'downloads').iterdir())]
(dest / 'SHA256SUMS').write_text('\n'.join(shas)+'\n')
compat = ('本版本使用 Manifest V2。Chrome 139 及以上不能加载；仅供兼容旧环境的历史归档。Edge 的支持情况取决于实际浏览器版本。' if m['manifest_version'] == 2 else '使用 Manifest V3。请同时满足 manifest.json 中的 minimum_chrome_version 要求。')
readme = f'''# React Developer Tools {expected}

本分支收集 {expected.split('.')[0]}.x 系列的代表版本 **{expected}**，从固定的官方源码提交构建。它不是 Chrome Web Store 签名原包。

## 安装

1. [下载本分支 ZIP](https://github.com/batype/react-devtools/archive/refs/heads/v{expected.split('.')[0]}.zip) 并解压，或下载 `downloads/react-devtools-{expected}-chrome.zip`。
2. Chrome 打开 `chrome://extensions/`，Edge 打开 `edge://extensions/`，开启「开发者模式」。
3. 点击「加载已解压的扩展程序」，选择包含 `manifest.json` 的 `extension/` 目录；若下载的是 downloads 中的 ZIP，则选择其解压根目录。
4. 停用其他 React DevTools 版本，刷新 React 页面并重新打开开发者工具。

{compat}

## 来源及校验

- 官方源码：https://github.com/{upstream}/tree/{revision}
- 完整版本和构建来源：`version.json`。
- 包校验：`shasum -a 256 -c SHA256SUMS`。
- 已检查包内版本、运行文件引用、非空运行文件及 ZIP 完整性；尚未在浏览器中逐版本运行测试。
- 构建方法见 [主分支的归档工作流](https://github.com/batype/react-devtools/actions/workflows/archive-build.yml)。
- 此版本遵循随附的 `LICENSE`。

[返回全部主版本索引](https://github.com/batype/react-devtools)
'''
(dest / 'README.md').write_text(readme)
print(json.dumps(meta))
