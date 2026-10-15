![Comment Anchors](media/extension_logo.png)

[English](README.md) | 简体中文

在注释或字符串中添加锚点，即可在代码上下文中创建书签。锚点可用于跟踪 TODO、记录说明、创建可折叠区域，或构建简单的导航，帮助你更轻松地浏览文件。

你可以在侧边栏中查看当前文件或整个工作区的锚点。

Comment Anchors 提供了丰富的配置选项，可根据个人工作流进行定制，提升工作效率。以下是完整的功能介绍。

### 维护说明

我们目前不打算亲自对该项目进行重大更新或添加新功能，因为我们已转向其他项目。不过，我们仍会不定期审阅并合并社区提交的 Pull Request。

[了解详情](https://github.com/StarlaneStudios/vscode-comment-anchors/issues/218)。

### 更新日志

请查看[更新日志](CHANGELOG.md)。

## 源码阅读教程

想了解扩展的启动流程、锚点解析与缓存、侧边栏视图及各项核心功能的代码位置，请阅读[Comment Anchors 源码阅读教程](CODE_READING_GUIDE.zh-CN.md)。

# 功能概览

- 可在任何语言的文件中添加锚点
- 在锚点侧边栏中查看锚点列表
- 自定义锚点名称、颜色、高亮颜色等（参见下方示例）
- 单击锚点即可滚动到对应位置
- 使用快捷键跳转到上一个或下一个锚点
- 通过命令快速切换标签的可见性
- 查看整个工作区中的锚点
- 设置锚点的可见范围：整个工作区或仅当前文件
- 使用区域锚点创建层级结构
- 通过 Epic 将锚点归入自定义列表
- 将工作区内的所有锚点导出为 JSON 或 CSV

# 使用方法

默认设置包含以下标签：

- ANCHOR - 用于标记文件中的一个章节
- TODO - 尚待完成的事项
- FIXME - 需要修复的问题
- STUB - 用于生成的默认代码片段
- NOTE - 针对特定代码段的重要说明
- REVIEW - 需要进一步审查的事项
- SECTION - 用于定义区域（参见“层级锚点”）
- LINK - 用于创建可打开文件的链接（参见“链接锚点”）

你也可以添加自定义锚点。只需在注释中写入标签名称，并在其后添加说明文字，扩展就会自动检测该锚点，并将其添加到锚点列表中。

你还可以使用 `Alt + PageUp` 或 `Alt + PageDown` 在当前文件的锚点之间快速导航。

![预览](media/preview.gif)

## 锚点类型

每种锚点类型都可以分别设置高亮颜色、背景颜色等，并可在设置中自定义。你可以添加或移除标签，也可以让多个标签共用相同的图标或颜色。图标和高亮支持任意十六进制颜色，方便按个人习惯配置。

![所有标签](media/all-anchors.png)

如果要停用一个或多个默认标签，只需将其 `enabled` 属性设为 `false`（参见配置部分）。

## 工作区锚点

除了显示当前文件中的锚点，侧边栏还会显示在整个工作区内找到的锚点。这些锚点按文件分组，可用于快速导航。

可以通过每个标签的 `scope` 属性控制标签是否显示在工作区列表中（参见配置部分）。

![工作区锚点](media/workspace-anchors.png)

## Anchor Epics

Epic 可以将类、方法以及整个代码区域中的锚点归入个人列表。只需为锚点添加 Epic，即可将其放入相应列表。你还可以选择提供序号，自定义锚点的排序顺序。

![Epics](media/epics.png)

### 延迟加载

工作区锚点通常会在启动时扫描；对于文件和文件夹较多的项目，这可能会增加加载时间。此时可以启用延迟加载，在手动触发后再开始扫描。

可在设置中启用工作区延迟加载（参见配置部分）。

![延迟加载](media/lazy-workspace.gif)

## 层级锚点

区域锚点可将相关的 Comment Anchors 归为一组，并在锚点侧边栏中折叠显示。这类锚点与普通锚点基本相同，但需要指定结束标签：在同类型标签前加上感叹号即可。

![层级锚点](media/folding.png)

将标签配置中的 `behavior` 属性设为 `"region"`，即可将其设置为区域标签（参见配置部分）。

默认提供的区域标签为 `SECTION`。

## 标签自定义

Comment Anchors 支持丰富的标签自定义选项，包括修改默认标签。你可以创建适合自己工作流的标签。

完整属性列表请参阅配置部分。

![自定义标签](media/custom-tags.png)

![区分大小写的锚点](media/case-sensitive-anchors.png)

## 链接锚点

你可以在注释中链接到文件。使用默认的 `LINK` 标签，并提供相对路径或绝对路径。链接锚点会显示为可点击的 CodeLens，方便在编辑器中快速打开目标文件。

将 `behavior` 设为 `"link"`，即可创建自定义链接标签。

### 链接到指定行

在路径末尾添加 `:` 和行号即可跳转到指定行。

示例：`// LINK some/file.txt:50`

### 链接到指定锚点

在路径末尾添加 `#` 和锚点 ID，即可跳转到目标文件中的某个锚点。锚点 ID 可以通过 `id` 属性指定，也可以直接填写为属性值。使用 `|` 分隔多个 ID，即可让同一个锚点拥有多个别名。

示例：`// LINK some/file.txt#my-anchor`  
目标位置：`// ANCHOR[my-anchor|alias] 这是跳转目标！`（等同于 `// ANCHOR[id=my-anchor|alias]`）

也支持先写锚点 ID、再用 `--` 指定文件路径：`// LINK #my-anchor -- some/file.txt`。该形式适用于路径中包含空格的情况。

也可以省略路径，直接链接到当前文件中的锚点或行。

示例：`// LINK #error-handling`

### 链接到当前文件中的多个锚点

使用 `LINKS` 标签，并在其后填写以 `|` 分隔的锚点 ID。每个 ID 都会成为一个可点击链接，跳转到当前文件中对应的锚点。

示例：`// LINKS anchor1|anchor2|anchor3`

![链接锚点](media/link-anchors.png)

## 显示光标位置

启用 `commentAnchors.showCursor` 设置后，文件锚点视图中会显示当前光标位置，便于了解光标相对于锚点所在的位置。

![光标位置](media/cursor.png)

## IntelliSense 支持

Comment Anchors 支持通过 IntelliSense 自动补全锚点标签。

![IntelliSense](media/intelli-sense.png)

# 命令

> **列出已配置的锚点标签**

在预览选项卡中显示所有已配置的标签，便于创建自定义标签时参考。

> **切换 Comment Anchors 的可见性**

切换 Comment Anchors 的显示状态。注意：此命令会更新设置中的相应选项。

> **导出所有工作区锚点**

将工作区中的所有锚点导出为 CSV 或 JSON 文件。

# 配置

使用 `commentAnchors.parseDelay` 设置停止输入后、锚点解析器启动前的延迟时间（毫秒）。增大该值可能有助于改善性能。默认值为 `200`。

```json
{
  "commentAnchors.parseDelay": 200
}
```

使用 `commentAnchors.scrollPosition` 设置跳转到锚点后锚点在编辑器中的位置。默认值为 `top`。

```json
{
  "commentAnchors.scrollPosition": "top"
}
```

使用 `commentAnchors.showCursor` 控制是否在文件锚点视图中显示当前光标位置。默认值为 `false`。

```json
{
  "commentAnchors.showCursor": false
}
```

使用 `commentAnchors.tagHighlights.enabled` 控制是否高亮标签。默认值为 `true`。

```json
{
  "commentAnchors.tagHighlights.enabled": true
}
```

使用 `commentAnchors.workspace.enabled` 启用或禁用工作区范围的锚点扫描。启用后，所有包含锚点的文件会显示在“工作区锚点”视图中。默认值为 `true`。

```json
{
  "commentAnchors.workspace.enabled": true
}
```

使用 `commentAnchors.workspace.lazyLoad` 设置是否延迟加载工作区锚点，直到手动确认后才开始扫描。对于大型工作区，建议启用。默认值为 `true`。

```json
{
  "commentAnchors.workspace.lazyLoad": true
}
```

使用 `commentAnchors.workspace.maxFiles` 设置工作区锚点列表中索引和显示的文件数量上限。默认值为 `50`。

```json
{
  "commentAnchors.workspace.maxFiles": 50
}
```

使用 `commentAnchors.workspace.matchFiles` 指定 Comment Anchors 要扫描的文件。合理配置此项可以显著提升性能；默认情况下会扫描大多数文件。

```json
{
  "commentAnchors.workspace.matchFiles": "**/*"
}
```

使用 `commentAnchors.workspace.excludeFiles` 指定要排除扫描的文件。默认配置只排除少数目录。

```json
{
  "commentAnchors.workspace.excludeFiles": "**/{node_modules,.git,.idea,target,out,build,bin,obj,vendor}/**/*"
}
```

使用 `commentAnchors.workspace.pathFormat` 设置工作区锚点树中的路径显示方式：显示完整路径、将文件夹缩写为首字母，或隐藏路径。默认值为 `full`。

```json
{
  "commentAnchors.workspace.pathFormat": "full"
}
```

使用 `commentAnchors.tags.provideAutoCompletion` 启用或禁用锚点标签的自动补全。默认值为 `true`。

```json
{
  "commentAnchors.tags.provideAutoCompletion": true
}
```

使用 `commentAnchors.tags.displayInSidebar` 控制标签是否显示在侧边栏列表中。默认值为 `true`。

```json
{
  "commentAnchors.tags.displayInSidebar": true
}
```

使用 `commentAnchors.tags.displayInGutter` 控制是否显示行号槽图标。默认值为 `true`。

```json
{
  "commentAnchors.tags.displayInGutter": true
}
```

使用 `commentAnchors.tags.displayInRuler` 控制是否在滚动条概览标尺中显示彩色标记。默认值为 `true`。

```json
{
  "commentAnchors.tags.displayInRuler": true
}
```

使用 `commentAnchors.tags.displayLineNumber` 控制侧边栏中是否显示行号。默认值为 `true`。

```json
{
  "commentAnchors.tags.displayLineNumber": true
}
```

使用 `commentAnchors.tags.displayTagName` 控制侧边栏中是否显示标签名称。默认值为 `true`。

```json
{
  "commentAnchors.tags.displayTagName": true
}
```

使用 `commentAnchors.tags.rulerStyle` 设置概览标尺中的标记样式。默认值为 `center`。

```json
{
  "commentAnchors.tags.rulerStyle": "center"
}
```

使用 `commentAnchors.tags.sortMethod` 设置侧边栏中的锚点排序方式。设为 `line` 时按行号排序（默认）；设为 `type` 时按标签类型排序。

```json
{
  "commentAnchors.tags.sortMethod": "line"
}
```

使用 `commentAnchors.tags.expandSections` 设置是否自动展开锚点树中的区域。

```json
{
  "commentAnchors.tags.expandSections": true
}
```

使用 `commentAnchors.tags.separators` 设置可接受的分隔符列表。

```json
{
  "commentAnchors.tags.separators": [" ", ": ", " - "]
}
```

使用 `commentAnchors.epic.provideAutoCompletion` 启用或禁用 Epic 自动补全。默认值为 `true`。

```json
{
  "commentAnchors.epic.provideAutoCompletion": true
}
```

使用 `commentAnchors.epic.seqStep` 设置自动补全时在当前最大序号基础上递增的步长。默认值为 `1`。

```json
{
  "commentAnchors.epic.seqStep": 1
}
```

## 自定义锚点标签

使用 `commentAnchors.tags.anchors` 配置锚点标签。每个标签可使用以下属性：

- `scope`（必需）- 标签的显示范围。设为 `file` 时仅显示在“文件锚点”列表中；设为 `hidden` 时不显示在锚点列表中
- `highlightColor` - 标签的高亮颜色
- `backgroundColor` - 标签的背景颜色
- `iconColor` - 图标颜色；也可设为 `auto`，由当前主题自动选择。默认使用 `highlightColor`
- `styleMode` - 自定义注释中被高亮的部分
- `borderStyle` - 标签边框样式（参见 [CSS border 属性](https://www.w3schools.com/cssref/pr_border.asp)）
- `borderRadius` - 边框圆角（需要同时设置 `borderStyle`）
- `ruler` - 设为 `false` 时覆盖全局设置
- `textDecorationStyle` - 标签文本装饰样式（参见 [CSS text-decoration 属性](https://www.w3schools.com/cssref/pr_text_text-decoration.php)）
- `isBold` - 是否加粗标签
- `isItalic` - 是否将标签设为斜体
- `behavior` - 标签行为：`link`（链接）、`region`（区域）或 `anchor`（普通锚点）
- `enabled` - 是否启用标签，可用于禁用默认或自定义标签

```json
"commentAnchors.tags.anchors": {
  "ANCHOR": {
    "scope": "file",
    "iconColor": "default",
    "highlightColor": "#A8C023",
    "styleMode": "comment"
  }
}
```

要禁用一个或多个默认标签，可以将相应标签的 `enabled` 属性设为 `false`：

```json
"commentAnchors.tags.anchors": {
  "ANCHOR": {
    "enabled": false
  }
}
```

如果只希望标签提供高亮，而不在锚点侧边栏中显示，请将 `scope` 设为 `hidden`：

```json
"commentAnchors.tags.anchors": {
  "NOTE": {
    "scope": "hidden"
  }
}
```

## 图标颜色

启动时，扩展会根据标签中指定的颜色生成锚点图标。图标颜色默认使用标签的 `highlightColor`，也可以通过 `iconColor` 单独指定。将 `iconColor` 设为 `auto` 后，VS Code 会根据当前主题自动选择图标颜色（黑色或白色）。

除了十六进制颜色外，还可以使用以下颜色名称作为快捷值：

| 颜色    | 十六进制值 |
| :------ | ---------: |
| blue    |  `#3ea8ff` |
| blurple |  `#7d5afc` |
| red     |  `#F44336` |
| purple  |  `#BA68C8` |
| teal    |  `#00cec9` |
| orange  |  `#ffa100` |
| green   |  `#64DD17` |
| pink    |  `#e84393` |
| emerald |  `#2ecc71` |
| yellow  |  `#f4d13d` |

# 问题反馈

如果发现 Comment Anchors 存在问题或希望添加功能，可以在 GitHub 仓库中[提交 Issue 或建议](https://github.com/StarlaneStudios/vscode-comment-anchors/issues)。

如需直接交流，也可以加入 [Starlane Studios Discord](https://discord.gg/exaQDX2)，那里有许多扩展开发者。

## 性能较差？

Comment Anchors 会扫描整个工作区以查找标签。当工作区包含大量文件（例如依赖目录或日志文件）时，扫描可能影响性能。建议调整 `matchFiles` 和 `excludeFiles` 设置，以限制扫描的目录和文件。

如果不需要工作区锚点，也可以在设置中将其禁用。

# 参与贡献

欢迎通过 Fork [GitHub 仓库](https://github.com/StarlaneStudios/vscode-comment-anchors)并提交 Pull Request，为 Comment Anchors 做出贡献。

## 喜欢 Comment Anchors 吗？

欢迎打赏，支持项目开发！

PayPal：https://paypal.me/ExodiusStudios

### **感谢使用 Comment Anchors！❤️**
