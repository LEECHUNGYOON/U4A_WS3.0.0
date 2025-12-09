/**
 * Electron Remote 기반 단방향 IPC 핸들러
 * - 역할: Renderer -> Main -> Renderer (단방향 전파)
 * - 사용: const { ipcHandler } = require('...'); const ipc = new ipcHandler();
 */

const REMOTE = require('@electron/remote');
const IPCMAIN = REMOTE.require('electron').ipcMain;
const IPCRENDERER = require('electron').ipcRenderer;

class CLIpcHandler {

  constructor() {
    // 인스턴스별 핸들러 격리 관리
    this.handlerMap = new Map();
  }

  /**
   * 이벤트 전송 (Send)
   * - 단방향 전송 (Fire and Forget)
   */
  command(channel, params) {
    IPCRENDERER.send(channel, { params });
  }

  /**
   * 이벤트 수신 (On)
   */
  on(channel, handler) {
    // 중복 등록 방지 (Early Return)
    if (this.handlerMap.has(handler)) {
      return;
    }

    // Main 프로세스 메시지 포맷 언패킹
    const listener = (event, message) => {
      const { params } = message || {};
      handler(event, params);
    };

    // 해제를 위해 원본 함수와 리스너 매핑 저장
    this.handlerMap.set(handler, listener);

    // 전역 버스(Main)에 등록
    IPCMAIN.on(channel, listener);
  }

  /**
   * 리스너 제거 (Off)
   */
  off(channel, handler) {
    const listener = this.handlerMap.get(handler);

    // 등록된 리스너가 없으면 종료 (Early Return)
    if (!listener) {
      return;
    }

    // Main 프로세스에서 제거 및 맵 정리
    IPCMAIN.removeListener(channel, listener);
    this.handlerMap.delete(handler);
  }
}

// 확장성을 고려한 Named Export 방식
module.exports = { CLIpcHandler };