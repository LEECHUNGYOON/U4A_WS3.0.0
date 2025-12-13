;; =============================================================================
;; Notice
;; =============================================================================
;; - 각 역할('install, uninstall')별 nsh 파일을 분리해서 include 방식으로 관리하려고 했으나,
;; include 지정 시 상대경로 지정에 대한 방법을 찾지 못하여 (빌드시 syntax 오류가 발생) 
;; 하나의 파일에 각 역할에 대한 로직을 관리하게 되었음.
;; =============================================================================

!include "LogicLib.nsh"

;; =============================================================================
;; NSIS Hooks
;; =============================================================================

;; Language Code Definitions
!define LANG_KOREAN 1042
!define LANG_ENGLISH 1033
!define LANG_JAPANESE 1041
!define LANG_CHINESE_SIMPLIFIED 2052
!define LANG_CHINESE_TRADITIONAL 1028

;; -----------------------------------------------------------------------------
;; Pre-Install Hook (설치 전)
;; -----------------------------------------------------------------------------
!macro preInit
  System::Call 'kernel32::GetUserDefaultUILanguage() i .r0'
  
  ${If} $0 == ${LANG_KOREAN}
    StrCpy $1 "${PRODUCT_NAME} (${VERSION})를 설치하시겠습니까?"
  ${ElseIf} $0 == ${LANG_JAPANESE}
    StrCpy $1 "${PRODUCT_NAME} (${VERSION})をインストールしますか？"
  ${ElseIf} $0 == ${LANG_CHINESE_SIMPLIFIED}
  ${OrIf} $0 == ${LANG_CHINESE_TRADITIONAL}
    StrCpy $1 "您要安装${PRODUCT_NAME} (${VERSION})吗？"
  ${Else}
    StrCpy $1 "Do you want to install ${PRODUCT_NAME} (${VERSION})?"
  ${EndIf}
  
  MessageBox MB_YESNO|MB_ICONQUESTION $1 IDYES +2
  Abort
!macroend

;; -----------------------------------------------------------------------------
;; Uninstall Hook (프로그램 Uninstall 시)
;; -----------------------------------------------------------------------------
!macro customUnInstall
  DeleteRegKey HKCU "Software\\U4A"
!macroend