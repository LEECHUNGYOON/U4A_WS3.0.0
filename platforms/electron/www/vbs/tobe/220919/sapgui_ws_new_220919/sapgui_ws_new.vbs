'** U4A WorkSpace Controller Class 실행 **

Rem *********************
Rem *** 오류코드 정의     ***
Rem *********************
Rem *******************************************************
Rem 오류코드  오류내역
Rem *******************************************************
'   E01     SAP GUI 최대 세션수 도달
'   E02     SAP GUI 로그인 실패
'   E03     SAP GUI 로그인 세션을 찾을 수 없습니다
'   E99     알수 없는 오류 발생


Rem *******************************************************



Rem *********************
Rem *** Public Sector ***
Rem *********************

	Public HOSTIP, SVPORT, MSSEVR, MSPORT, SAPRUT, SID, MANDT, BNAME, PASS, LANGU, APPID, METHD, SPOSI, ISEDT, ISMLGN, MAXSS, ConnStr, W_system
	
	Public objWSH, objSapGui, objAppl, objConn, objSess
	
Rem ****************************
Rem *** End Of Public Sector ***
Rem ****************************


Rem *******************************
Rem *** Function implementation ***
Rem *******************************

'Base64 인코딩 펑션
Function Base64Encode(inData)
  'rfc1521
  '2001 Antonin Foller, Motobit Software, http://Motobit.cz
  Const Base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  Dim cOut, sOut, I
  
  'For each group of 3 bytes
  For I = 1 To Len(inData) Step 3
    Dim nGroup, pOut, sGroup
    
    'Create one long from this 3 bytes.
    nGroup = &H10000 * Asc(Mid(inData, I, 1)) + _
      &H100 * MyASC(Mid(inData, I + 1, 1)) + MyASC(Mid(inData, I + 2, 1))
    
    'Oct splits the long To 8 groups with 3 bits
    nGroup = Oct(nGroup)
    
    'Add leading zeros
    nGroup = String(8 - Len(nGroup), "0") & nGroup
    
    'Convert To base64
    pOut = Mid(Base64, CLng("&o" & Mid(nGroup, 1, 2)) + 1, 1) + _
      Mid(Base64, CLng("&o" & Mid(nGroup, 3, 2)) + 1, 1) + _
      Mid(Base64, CLng("&o" & Mid(nGroup, 5, 2)) + 1, 1) + _
      Mid(Base64, CLng("&o" & Mid(nGroup, 7, 2)) + 1, 1)
    
    'Add the part To OutPut string
    sOut = sOut + pOut
    
    'Add a new line For Each 76 chars In dest (76*3/4 = 57)
    'If (I + 2) Mod 57 = 0 Then sOut = sOut + vbCrLf
  Next
  Select Case Len(inData) Mod 3
    Case 1: '8 bit final
      sOut = Left(sOut, Len(sOut) - 2) + "=="
    Case 2: '16 bit final
      sOut = Left(sOut, Len(sOut) - 1) + "="
  End Select
  Base64Encode = sOut
  
End Function

Function MyASC(OneChar)
  If OneChar = "" Then MyASC = 0 Else MyASC = Asc(OneChar)
  
End Function


'외부에서 전달된 Arguments 얻기
Function GetArg()
	HOSTIP = WScript.arguments.Item(0) '연결 Host IP (*필수) => EX) 10.10.10.10 또는 EEQ 
	SVPORT = WScript.arguments.Item(1) 'Service Port (*필수) => EX) 3200
	SID    = WScript.arguments.Item(2) '연결 SID (*필수) => EX) U4A
	
    MSSEVR = WScript.arguments.Item(3) 'Message Server (*옵션) => EX) 10.10.10.10 또는 msg.server.com
	MSPORT = WScript.arguments.Item(4) 'Message Server Port (*옵션) => EX) 3600
	SAPRUT = WScript.arguments.Item(5) 'SAP Route (*옵션) => EX) /H/10.10.10.10/S/3299
	
	MANDT  = WScript.arguments.Item(6) '로그온 클라이언트 (*필수) => EX) 800
	BNAME  = WScript.arguments.Item(7) '로그온 SAP ID (*필수)	 => EX) USER
	PASS   = WScript.arguments.Item(8) '로그온 SAP ID 비번 (*필수) => EX) Password
	LANGU  = WScript.arguments.Item(9) '로그온 언어키 (*필수)   => EX) KO
	
	APPID  = WScript.arguments.Item(10) 'U4A APP ID (*필수) => EX) ZU4A_TS0010
	METHD  = WScript.arguments.Item(11) '네비게이션 대상 이벤트 메소드 (*옵션) => EX) EV_TEST
	SPOSI  = WScript.arguments.Item(12) '네비게이션 대상 이벤트 메소드 소스 라인번호 (*옵션) => EX) 100
	ISEDT  = WScript.arguments.Item(13) '수정모드 여부(예 : X, 아니오 : 공백) 
	
	REM ** 다중 로그인 여부 **
	REM    1: SAP GUI 다중 로그인 정보 없음, 
	REM    2: SAP GUI 다중 로그인 정보 있음(* 시스템 허용)
	REM    X: SAP GUI 다중 로그인 시스템 허용 안함
	ISMLGN = WScript.arguments.Item(14) 
 
 	MAXSS = CInt(WScript.arguments.Item(15)) '시스템 허용 최대 세션수
	
End Function


'SAP GUI 연결 문자열 설정
Function SetConnStr()

	If SAPRUT <> "" Then
		ConnStr = SAPRUT

	End If

	IF MSSEVR <> "" Then
		if HOSTIP <> "" Then
			ConnStr = ConnStr & "/M/" & MSSEVR & "/S/" & MSPORT & "/G/" & HOSTIP

		Else
			ConnStr = ConnStr & "/M/" & MSSEVR & "/S/" & MSPORT & "/G/SPACE"

		End If

	Else
		ConnStr = ConnStr & "/H/" & HOSTIP & "/S/" & SVPORT

	End If

'MsgBox ConnStr

End Function


'SAP GUI Logon Pad 경로 얻기(레지스트리 기준)
Function GetSAPGuiPath()
	RegPath = "HKCR\SapFront.App\protocol\StdFileEditing\server\"
	'GetSAPGuiPath = objWSH.regread(RegPath) 'SAP GUI Logon Path
	GetSAPGuiPath = Replace(objWSH.regread(RegPath),"saplgpad.exe","saplogon.exe")
	
End Function


'SAP GUI "Enable scripting" 플래그 점검 및 설정(레지스트리 기준)
Function ChkEnaScript()

	RegPath = "HKCU\SOFTWARE\SAP\SAPGUI Front\SAP Frontend Server\Security\DefaultAction"
	objWSH.RegWrite RegPath, "0", "REG_DWORD"

	RegPath = "HKCU\SOFTWARE\SAP\SAPGUI Front\SAP Frontend Server\Security\SecurityLevel"
	objWSH.RegWrite RegPath, "0", "REG_DWORD"
	
	RegPath = "HKCU\SOFTWARE\SAP\SAPGUI Front\SAP Frontend Server\Security\UserScripting"
	objWSH.RegWrite RegPath, "1", "REG_DWORD"

	RegPath = "HKCU\SOFTWARE\SAP\SAPGUI Front\SAP Frontend Server\Security\WarnOnAttach"
	objWSH.RegWrite RegPath, "0", "REG_DWORD"

	RegPath = "HKCU\SOFTWARE\SAP\SAPGUI Front\SAP Frontend Server\Security\WarnOnConnection"
	objWSH.RegWrite RegPath, "0", "REG_DWORD"
	
End Function


'로그인 Session 카운트 점검
Function Chk_Session_Cnt()

	Dim W_syst, W_conn, W_Sess
	Dim a
	
	W_syst = SID & MANDT & BNAME '로그인 점검 대상 시스템(SID + 클라이언트 + 사용자ID)
	
    For il = 0 To objAppl.Children.Count - 1
        Set W_conn = objAppl.Children(il + 0)
        
        For it = 0 To W_conn.Children.Count - 1
            Set W_Sess = W_conn.Children(it + 0)
        
            If W_Sess.Info.SystemName & W_Sess.Info.Client & W_Sess.Info.User = W_syst Then
                a = a + 1
				
            End If
        
        Next 
    
    Next 

    If MAXSS <= a Then
	    Chk_Session_Cnt = "MAX_SESS"
		
	End If

End Function


'SAP 로그인 점검 및 로그인 처리
Function Attach_Session()
    
    Dim w_ret
    Dim il, it
    Dim W_conn, W_Sess
      
	Attach_Session = ""
	  
    If IsObject(objSess) Then
        If objSess.Info.SystemName & objSess.Info.Client = W_system Then
            Attach_Session = "2" '로그인 및 기존 세션 연결 성공
            Exit Function
                   
        End If
    
    End If
    
    If not IsObject(objSapGui) Then
       Set objSapGui = GetObject("SAPGUI")
       Set objAppl = objSapGui.GetScriptingEngine
	   
    End If
        	
    '세션 영역 가시/비가시 처리
    With objAppl
        .TitlebarVisible  = False
        .ToolbarVisible   = True
        .StatusbarVisible = True
        
    End With
        			
			
    'SAP Login인 안된 경우 로그인 시도
    If objAppl.Children.Count = 0 Then
        
        w_ret = SAP_Login()

        If w_ret <> "S" Then
			Attach_Session = "E" '로그인 실패
			
            'MsgBox "Login failed!!", vbCritical, "Error!!"
            
            Exit Function
            
        End If

    End If
            
    '로그인된 세션중 대상 세션 점검
	
	Attach_Session = "1" '로그인 성공 단, 기존 로그인 된 세션 여부 검색 대상임.
	
	W_system = SID & MANDT & BNAME '로그인 점검 대상 시스템(SID + 클라이언트 + 사용자ID)
	
    For il = 0 To objAppl.Children.Count - 1
        Set W_conn = objAppl.Children(il + 0)
        
        For it = 0 To W_conn.Children.Count - 1
            Set W_Sess = W_conn.Children(it + 0)
        
            If W_Sess.Info.SystemName & W_Sess.Info.Client & W_Sess.Info.User = W_system Then
                Set objConn = objAppl.Children(il + 0)
                
                Set objSess = W_Sess
                Attach_Session = "2" '로그인 및 기존 세션 연결 성공
                
                Exit For
                
            End If
        
        Next 
    
    Next 
    
End Function


'SAP Login 처리
Function SAP_Login()
    
	SAP_Login = ""
	
    Set objConn = objAppl.OpenConnectionByConnectionString(ConnStr)

    If not IsObject(objConn) Then
        Exit Function
    
    End If

    Set objSess = objConn.Children(0)
    
	'objSess.findById("wnd[0]").resizeWorkingPane 113,33,false
	objSess.findById("wnd[0]").JumpForward
	objSess.findById("wnd[0]").maximize
	objSess.findById("wnd[0]/usr/txtRSYST-MANDT").Text = MANDT
	objSess.findById("wnd[0]/usr/txtRSYST-BNAME").Text = BNAME
	objSess.findById("wnd[0]/usr/pwdRSYST-BCODE").Text = PASS
	objSess.findById("wnd[0]/usr/txtRSYST-LANGU").Text = LANGU
	objSess.findById("wnd[0]").sendVKey 0

    '다중 로그인 팝업 처리
	If ISMLGN = "2" Then
		objSess.findById("wnd[1]/usr/radMULTI_LOGON_OPT2").select
		objSess.findById("wnd[1]/tbar[0]/btn[0]").press
	
	End If
	
    SAP_Login = "S" '로그인 성공

End Function


'APP 컨트롤러 클래서 네비게이션 처리
Function call_ZU4A_CTRL_PROXY()

    Dim LV_PARA, LV_ENC
    
	'objSess.findById("wnd[0]/tbar[0]/okcd").text = "/N/U4A/CTRL_PROXY"
	'objSess.findById("wnd[0]/tbar[0]/btn[0]").press
    objSess.SendCommand ("/n/U4A/CTRL_PROXY")

	'objSess.findById("wnd[0]/usr/txtPA_APPID").text = APPID
	'objSess.findById("wnd[0]/usr/txtPA_EVTMT").text = METHD
	'objSess.findById("wnd[0]/usr/txtPA_POSI").text = SPOSI
	
	'If ISEDT = "X" Then
		'objSess.findById("wnd[0]/usr/chkPA_ISEDT").selected = true
	
	'Else
		'objSess.findById("wnd[0]/usr/chkPA_ISEDT").selected = false
	
	'End If
	
	'objSess.findById("wnd[0]/tbar[1]/btn[8]").press

    LV_PARA = APPID & "|" & METHD & "|" & SPOSI & "|" & ISEDT
	
	LV_ENC = Base64Encode(LV_PARA)

    objSess.findById("wnd[0]/usr/txtPA_PARM").text = LV_ENC
    objSess.findById("wnd[0]/tbar[1]/btn[8]").press

End Function


'오류 코드 메시지 리턴
Function ERR_RET(isECD, isEMSG)

	dim LV_RET
	
	LV_RET = isECD & "|" & isEMSG

    MsgBox IsEMSG, vbCritical, "terminated"

	Err.Clear
	Err.Raise 999, "Error Occurred", LV_RET
	
End Function

Rem **************************************
Rem *** End Of Function implementation ***
Rem **************************************

Rem *********************************
Rem *** Subroutine implementation ***
Rem *********************************

'SAP GUI 실행 처리
Sub StartSAPGUI

	Dim LV_CNT, LV_SAPGUI, LV_RET, LV_ERR

	Rem ** 호출 시 스크립트 매개변수 지정

	GetArg() '외부 호출 Arguments 얻기
	SetConnStr() 'SAP GUI 연결 문자열 설정("/H/"+[호스트IP]+"/S/32"+[SNO])

	Set objWSH = CreateObject("WScript.Shell")

	If IsObject(objWSH) Then

		LV_SAPGUI = GetSAPGuiPath() 'SAP GUI Logon Pad 프로그램 Path
		
		ChkEnaScript() 'SAP GUI "Enable Scripting" 플래그 설정
		
		Set proc = objWSH.Exec(LV_SAPGUI)

		do While proc.status <> 0
			WScript.Sleep 150
			
		loop

		do While LV_CNT < 100
			If not objWSH.AppActivate("SAP Logon") Then
				WScript.Sleep 150
			End If
			
			LV_CNT = LV_CNT + 1	
			
		loop
		
		objWSH.SendKeys "% n" 'SAP GUI 창 축소하기
			
	End If
	
	LV_RET = Attach_Session() '로그인 세션 연결

	IF LV_RET = "1" Then '세션 연결 즉, 기존 로그인 세션을 찾지 못한 경우 다시 로그인 시도
	  
        LV_RET = SAP_Login()

        If LV_RET <> "S" Then
            'MsgBox "Login failed!!", vbCritical, "Error!!"            
            'Exit Sub
			LV_ERR = ERR_RET("E02", "Login failed!!")
            
        End If

		LV_RET = Attach_Session() '로그인 세션 연결

	End If

    '로그인 처리 리턴 코드에 따른 로직 분기
	Select Case LV_RET
	Case "1"
		'MsgBox "Login session not found.", vbExclamation, "Error!!"
		'Exit Sub
		LV_ERR = ERR_RET("E03", "Login session not found.")
		
	Case "2"
		objSess.findById("wnd[0]").JumpForward
		objSess.findById("wnd[0]").maximize

	Case "E"
		'MsgBox "Login failed!!", vbCritical, "Error!!"
		'Exit Sub
		LV_ERR = ERR_RET("E02", "Login failed!!")
		
	Case Else
		'MsgBox "An unknown error has occurred.", vbCritical, "Error!!"
		'Exit Sub
		LV_ERR = ERR_RET("E99", "An unknown error has occurred.")
		
	End Select

    LV_RET = ""
	LV_RET = Chk_Session_Cnt() '로그인 세션 카운트 점검

	If LV_RET = "MAX_SESS" Then '최대 세션수 도달
		LV_ERR = ERR_RET("E01", "The maximum number of sessions has been reached.")
		
	End If
	
	call_ZU4A_CTRL_PROXY() 'APP 컨트롤러 클래스 네비게이션 호출 실행
	
End Sub

Rem ****************************************
Rem *** End Of Subroutine implementation ***
Rem ****************************************

StartSAPGUI 'SAP GUI 실행 (로그인 처리 포함)