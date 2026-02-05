# API 接口

## API 配置

### 基础配置

```typescript
// src/api/request.ts
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_PREFIX,  // https://diary-api.id.life
  timeout: 10000,
});
```

### 请求拦截器

自动添加认证头：

```typescript
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 响应拦截器

自动解包响应数据：

```typescript
instance.interceptors.response.use(
  (response) => response.data,  // 直接返回 data
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

## 认证 API

文件：`src/api/auth.ts`

### 获取用户信息

```typescript
export const getUserProfile = (): Promise<GitHubUser> => {
  return request.get('/auth/me');
};

// 响应类型
interface GitHubUser {
  id: number;
  login: string;        // GitHub 用户名
  name: string;         // 显示名称
  avatar_url: string;   // 头像 URL
  email: string;
}
```

### OAuth 登录入口

```typescript
// 非 API 调用，直接重定向
window.location.href = `${API_PREFIX}/auth/github`;
```

## GitHub 备份 API

文件：`src/api/github.ts`

### 保存备份

```typescript
export const saveBackupList = (data: {
  content: any;      // 备份数据对象
  fileName: string;  // 文件名
}): Promise<void> => {
  return request.post('/github-backups', data);
};
```

### 获取备份列表

```typescript
export const getBackupList = (): Promise<BackupInfo[]> => {
  return request.get('/github-backups');
};

// 响应类型
interface BackupInfo {
  name: string;        // 文件名
  content: string;     // 备份内容（JSON 字符串）
  sha: string;         // Git SHA
  createdAt: string;   // 创建时间
}
```

### React Query Hook

```typescript
export const useBackupList = () => {
  return useQuery({
    queryKey: ['github-backups'],
    queryFn: getBackupList,
    enabled: true,
  });
};
```

## 备份数据格式

### 保存到云端的数据结构

```typescript
interface BackupData {
  entryTypes: {
    entryTypesArray: EntryType[];
  };
  entryInstances: {
    entryInstancesMap: { [dateStr: string]: EntryInstance[] };
  };
  reminderRecords: {
    reminderRecords: ReminderRecord[];
  };
  uiState: UIState;
  _persist: {
    version: number;
    rehydrated: boolean;
  };
  exportMeta: {
    exportedAt: string;
    exportSource: string;
    version: string;
  };
}
```

### 备份文件名格式

```
diary-backup-{YYYYMMDD-HHmmss}.json
```

## 数据导出工具

文件：`src/utils/localStorageExport.ts`

### 导出当前状态

```typescript
// 从 localStorage 导出
export const exportLocalStorageToDatabase = (): BackupData => {
  return {
    entryTypes: JSON.parse(localStorage.getItem('entryTypes.entryTypesArray') || '[]'),
    entryInstances: JSON.parse(localStorage.getItem('entryInstances.entryInstancesMap') || '{}'),
    reminderRecords: JSON.parse(localStorage.getItem('reminderRecords.reminderRecords') || '[]'),
    // ...
  };
};

// 从内存状态导出
export const exportMemoryStateToDatabase = (store: JotaiStore): BackupData => {
  return {
    entryTypes: store.get(entryTypesArrayAtom),
    entryInstances: store.get(entryInstancesMapAtom),
    // ...
  };
};
```

### 验证导出数据

```typescript
export const validateExportData = (data: any): boolean => {
  // 检查必需字段
  if (!data.entryTypes?.entryTypesArray) return false;
  if (!data.entryInstances?.entryInstancesMap) return false;
  // ...
  return true;
};
```

## 数据导出 Hook

文件：`src/hooks/useDataExport.ts`

```typescript
export const useDataExport = () => {
  // 复制到剪贴板
  const copyToDatabaseString = async () => {
    const data = exportLocalStorageToDatabase();
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('已复制到剪贴板');
  };

  // 下载为文件
  const downloadExportAsFile = () => {
    const data = exportLocalStorageToDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary-export-${getDatetimeStringShortFormatFromNow()}.json`;
    a.click();
  };

  // 保存到云端
  const saveToDatabase = async () => {
    const data = exportLocalStorageToDatabase();
    await saveBackupList({
      content: data,
      fileName: `diary-backup-${getDatetimeStringShortFormatFromNow()}.json`,
    });
    toast.success('已保存到云端');
  };

  return {
    copyToDatabaseString,
    downloadExportAsFile,
    saveToDatabase,
  };
};
```

## 备份数据转换器

文件：`src/utils/backupDataConverter.ts`

用于转换旧版 Redux 格式的备份到新版 Jotai 格式：

```typescript
// 检测备份格式
export const detectBackupFormat = (content: string): 'redux' | 'jotai' => {
  try {
    const data = JSON.parse(content);
    if (data._persist && typeof data.entryTypes === 'string') {
      return 'redux';  // 旧版 Redux persist 格式
    }
    return 'jotai';    // 新版 Jotai 格式
  } catch {
    return 'jotai';
  }
};

// 转换旧版备份
export const convertOldReduxBackup = (content: string): BackupData => {
  const data = JSON.parse(content);
  return {
    entryTypes: {
      entryTypesArray: JSON.parse(data.entryTypes || '[]'),
    },
    entryInstances: {
      entryInstancesMap: JSON.parse(data.entryInstances || '{}'),
    },
    // ...
  };
};

// 转换并恢复备份
export const convertAndRestoreBackup = async (content: string) => {
  const format = detectBackupFormat(content);
  const data = format === 'redux'
    ? convertOldReduxBackup(content)
    : JSON.parse(content);

  // 恢复到 localStorage
  localStorage.setItem('entryTypes.entryTypesArray', JSON.stringify(data.entryTypes.entryTypesArray));
  localStorage.setItem('entryInstances.entryInstancesMap', JSON.stringify(data.entryInstances.entryInstancesMap));
  // ...

  // 刷新页面以加载新数据
  window.location.reload();
};
```

## API 端点汇总

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/auth/github` | GET | 发起 GitHub OAuth | 否 |
| `/auth/me` | GET | 获取当前用户信息 | 是 |
| `/github-backups` | GET | 获取备份列表 | 是 |
| `/github-backups` | POST | 创建新备份 | 是 |

## 错误处理

```typescript
try {
  await saveBackupList(data);
  toast.success('保存成功');
} catch (error) {
  if (error.response?.status === 401) {
    // 未认证，跳转登录
    logout();
  } else {
    toast.error('保存失败: ' + error.message);
  }
}
```

## 环境变量配置

```bash
# .env.local
NEXT_PUBLIC_API_PREFIX=https://diary-api.id.life

# 开发环境可能使用
# NEXT_PUBLIC_API_PREFIX=http://localhost:3001
```
