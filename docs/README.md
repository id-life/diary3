# Diary3 项目交接文档

> 文档创建日期：2026-02-05

## 文档目录

| 编号 | 文档名称 | 说明 |
|------|----------|------|
| 01 | [项目概述](./01-项目概述.md) | 项目基本信息、技术栈、命令、目录概览 |
| 02 | [目录结构详解](./02-目录结构详解.md) | 完整目录树、页面路由映射、关键文件说明 |
| 03 | [核心数据模型](./03-核心数据模型.md) | EntryType、EntryInstance、ReminderRecord 等类型定义 |
| 04 | [状态管理](./04-状态管理.md) | Jotai 原子架构、localStorage 同步、使用示例 |
| 05 | [认证系统](./05-认证系统.md) | GitHub OAuth 流程、Token 管理、路由保护 |
| 06 | [组件架构](./06-组件架构.md) | 组件目录结构、核心组件详解、通信模式 |
| 07 | [API接口](./07-API接口.md) | API 配置、认证接口、备份接口、数据导出 |
| 08 | [开发指南](./08-开发指南.md) | 环境准备、开发命令、常见任务、调试技巧 |
| 09 | [交接注意事项](./09-交接注意事项.md) | 项目状态、待完成工作、已知问题、快速上手 |

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 设置 NEXT_PUBLIC_API_PREFIX

# 3. 启动开发服务器
pnpm dev

# 4. 访问 http://localhost:3000
```

## 项目概览

**Diary3** 是一个个人习惯追踪应用，主要功能：

- 习惯管理（创建、编辑、删除）
- 每日记录打卡
- 数据可视化统计
- 连续记录追踪
- 提醒功能
- GitHub OAuth 认证
- 云端数据备份

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS |
| 状态管理 | Jotai |
| 数据获取 | TanStack React Query |
| 图表 | Recharts |
| 表单 | React Hook Form + Zod |
| 认证 | GitHub OAuth |

## 相关文档

- [CLAUDE.md](../CLAUDE.md) - Claude Code 项目说明
- [REFACTORING_PLAN.md](../REFACTORING_PLAN.md) - 重构计划和进度

## 项目状态

### 已完成 (3/7 阶段)

- ✅ 依赖清理
- ✅ 认证系统统一
- ✅ Redux → Jotai 迁移

### 待完成

- ⏳ localStorage 冲突修复
- ⏳ 死代码清理
- ⏳ 测试验证
- ⏳ 最终完善

详情见 [交接注意事项](./09-交接注意事项.md)。

## 关键文件速查

| 需求 | 文件 |
|------|------|
| 数据类型 | `src/entry/types-constants.ts` |
| 状态原子 | `src/atoms/` |
| 认证逻辑 | `src/hooks/useGitHubOAuth.ts` |
| API 配置 | `src/api/request.ts` |
| 全局样式 | `src/styles/globals.css` |
| 页面路由 | `src/app/` |
