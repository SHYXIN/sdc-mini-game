# sdc-mini-game

搜打撤 — 微信小游戏，俯视角 2D 像素风撤离型射击游戏。

## 项目概述

- **平台：** 微信小游戏
- **视角：** Top-Down 2D 像素风
- **核心循环：** 搜索物资 → 战斗 → 撤离
- **单局时长：** 3-5 分钟
- **GDD：** `docs/GDD.md`

## 技术约束

- 初始包 4MB，分包总共 20MB
- 纯 PVE，无多人联机
- 个人开发者，无支付资质，纯广告变现

## Agent skills

### Issue tracker

GitHub Issues（`SHYXIN/sdc-mini-game`）。See `docs/agents/issue-tracker.md`.

### Triage labels

默认五标签：`needs-triage` / `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`。See `docs/agents/triage-labels.md`.

### Domain docs

Single-context：`CONTEXT.md` + `docs/adr/` 在仓库根目录。See `docs/agents/domain.md`.
