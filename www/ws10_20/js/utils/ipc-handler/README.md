# CLIpcHandler

Cordova Electron 단방향 IPC 핸들러

## 사용법

```javascript
const { CLIpcHandler } = require('./ipc-handler');
const ipc = new CLIpcHandler();

// 전송
ipc.command('save-data', { id: 1, name: 'John' });

// 수신
ipc.on('save-data', (event, params) => {
  console.log('Received:', params);
});

// 제거
function handler(event, params) {
  console.log(params);
}
ipc.on('log', handler);
ipc.off('log', handler);
```

## 실전 예제

```javascript
class FileManager {
  constructor() {
    this.ipc = new CLIpcHandler();
    this.ipc.on('save-file', this.handleSave.bind(this));
  }

  handleSave(event, params) {
    const fs = require('fs');
    fs.writeFileSync(params.path, params.content);
    this.ipc.command('file-saved', { success: true });
  }
}

const fm = new FileManager();
fm.ipc.command('save-file', { path: '/tmp/test.txt', content: 'Hello' });
```
