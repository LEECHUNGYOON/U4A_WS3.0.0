'** U4A WorkSpace Controller Class 실행 **

Rem *********************
Rem *** Public Sector ***
Rem *********************

	Public HostIP, SID, SNO, MANDT, BNAME, PASS, LANGU, APPID, METHD, SPOSI, ISEDT, ConnStr, W_system
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
	HostIP = WScript.arguments.Item(0) '연결 Host IP (*필수)
	SID    = WScript.arguments.Item(1) '연결 SID (*필수)
	SNO    = WScript.arguments.Item(2) '연결 SNo (*필수)
	MANDT  = WScript.arguments.Item(3) '로그온 클라이언트 (*필수)
	BNAME  = WScript.arguments.Item(4) '로그온 SAP ID (*필수)
	PASS   = WScript.arguments.Item(5) '로그온 SAP ID 비번 (*필수)
	LANGU  = WScript.arguments.Item(6) '로그온 언어키 (*필수)
	APPID  = WScript.arguments.Item(7) 'U4A APP ID (*필수)
	METHD  = WScript.arguments.Item(8) '네비게이션 대상 이벤트 메소드 (*옵션)
	SPOSI  = WScript.arguments.Item(9) '네비게이션 대상 이벤트 메소드 소스 라인번호 (*옵션)
	ISEDT  = WScript.arguments.Item(10) '수정모드 여부(예 : X, 아니오 : 공백)

End Function

'SAP GUI 연결 문자열 설정
Function SetConnStr()
	ConnStr = "/H/" & HostIP & "/S/32" & SNO

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
        .StatusbarVisible = False
        
    End With
        			
			
    'SAP Login인 안된 경우 로그인 시도
    If objAppl.Children.Count = 0 Then
        
        w_ret = SAP_Login()

        If w_ret <> "S" Then
			Attach_Session = "E" '로그인 실패
			
            MsgBox "Login failed!!", vbCritical, "Error!!"
            
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
    
	objSess.findById("wnd[0]").resizeWorkingPane 113,33,false
	'objSess.findById("wnd[0]").maximize
	objSess.findById("wnd[0]/usr/txtRSYST-MANDT").Text = MANDT
	objSess.findById("wnd[0]/usr/txtRSYST-BNAME").Text = BNAME
	objSess.findById("wnd[0]/usr/pwdRSYST-BCODE").Text = PASS
	objSess.findById("wnd[0]/usr/txtRSYST-LANGU").Text = LANGU
	objSess.findById("wnd[0]").sendVKey 0

    SAP_Login = "S" '로그인 성공

End Function

'APP 컨트롤러 클래서 네비게이션 처리
Function call_ZU4A_CTRL_PROXY()

    Dim LV_PARA, LV_ENC

    objSess.findById("wnd[0]").maximize
	'objSess.findById("wnd[0]/tbar[0]/okcd").text = "/NZU4A_CTRL_PROXY"
	'objSess.findById("wnd[0]/tbar[0]/btn[0]").press
    objSess.SendCommand ("/nZU4A_CTRL_PROXY")

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

Rem **************************************
Rem *** End Of Function implementation ***
Rem **************************************

Rem *********************************
Rem *** Subroutine implementation ***
Rem *********************************

'SAP GUI 실행 처리
Sub StartSAPGUI

	Dim LV_CNT, LV_SAPGUI, LV_RET

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
		
	End If

    objWSH.SendKeys "% n" 'SAP GUI 창 축소하기

	LV_RET = Attach_Session() '로그인 세션 연결

	IF LV_RET = "1" Then '세션 연결 즉, 기존 로그인 세션을 찾지 못한 경우 다시 로그인 시도
	  
        LV_RET = SAP_Login()

        If LV_RET <> "S" Then
            MsgBox "Login failed!!", vbCritical, "Error!!"
            
            Exit Sub
            
        End If

		LV_RET = Attach_Session() '로그인 세션 연결

	End If

    '로그인 처리 리턴 코드에 따른 로직 분기
	Select Case LV_RET
	Case "1"
		MsgBox "Login session not found.", vbExclamation, "Error!!"
		Exit Sub
		
	Case "2"

	Case "E"
		MsgBox "Login failed!!", vbCritical, "Error!!"
		Exit Sub
		
	Case Else
		MsgBox "An unknown error has occurred.", vbCritical, "Error!!"
		Exit Sub
		
	End Select

	call_ZU4A_CTRL_PROXY() 'APP 컨트롤러 클래스 네비게이션 호출 실행

End Sub

Rem ****************************************
Rem *** End Of Subroutine implementation ***
Rem ****************************************

StartSAPGUI 'SAP GUI 실행 (로그인 처리 포함)