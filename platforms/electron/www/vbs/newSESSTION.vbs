'** U4A WorkSpace Controller New Session 실행 **

Rem *********************
Rem *** 오류코드 정의     ***
Rem *********************
Rem *******************************************************
Rem 오류코드  오류내역
Rem *******************************************************
'   E01     SAP GUI 최대 세션수 도달
'   E99     알수 없는 오류 발생


Rem *******************************************************


Rem *********************
Rem *** Public Sector ***
Rem *********************
	Public SID, MANDT, BNAME, APPID, METHD, SPOSI, ISEDT, MAXSS, TCODE, ESID
	Public objWSH, objSapGui, objAppl, objConn, objSess, W_system, Lac, Lcc, Ecp, Msc 
	
	Public sDIM()

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


'ASCII 코드 얻기
Function MyASC(OneChar)
  If OneChar = "" Then MyASC = 0 Else MyASC = Asc(OneChar)
  
End Function


'T-Code Proxy 호출 후 실행 파라메터 설정(레지스트리 기준)
Function SetParamTCP()

    Dim LV_PARA, LV_ENC
	
    Set objWSH = CreateObject("WScript.Shell")

	LV_PARA = APPID & "|" & METHD & "|" & SPOSI & "|" & ISEDT & "|" & TCODE & "|" & ESID
    
	LV_ENC = Base64Encode(LV_PARA)
	
	RegPath = "HKCU\SOFTWARE\U4A\WS\TCProxy\ActionParam"
	objWSH.RegWrite RegPath, LV_ENC, "REG_SZ"
	
End Function


'외부에서 전달된 Arguments 얻기
Function GetArg()
	SID    = WScript.arguments.Item(0) '연결 SID (*필수) => EX) U4A
	MANDT  = WScript.arguments.Item(1) '로그온 클라이언트 (*필수) => EX) 800
	BNAME  = WScript.arguments.Item(2) '로그온 SAP ID (*필수)	 => EX) USER
	
	APPID  = WScript.arguments.Item(3) 'U4A APP ID (*필수) => EX) ZU4A_TS0010
	METHD  = WScript.arguments.Item(4) '네비게이션 대상 이벤트 메소드 (*옵션) => EX) EV_TEST
	SPOSI  = WScript.arguments.Item(5) '네비게이션 대상 이벤트 메소드 소스 라인번호 (*옵션) => EX) 100
	ISEDT  = WScript.arguments.Item(6) '수정모드 여부(예 : X, 아니오 : 공백) 
	TCODE  = WScript.arguments.Item(7) 'SAP TCODE
    MAXSS  = CInt(WScript.arguments.Item(8)) '시스템 허용 최대 세션수
	ESID  = WScript.arguments.Item(9) 'Electron JS 호출처 세션 ID
    
	W_system = SID & MANDT & BNAME '로그인 점검 대상 시스템(SID + 클라이언트 + 사용자ID)
 
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


'APP 컨트롤러 클래서 네비게이션 처리
Function call_ZU4A_CTRL_PROXY()

    Dim LV_PARA, LV_ENC, LO_CRTSESS

	objSess.createSession
	
	WScript.Sleep 1000

    GetLastCHDV()
	
    objSess.SendCommand ("/n/U4A/CTRL_PROXY")

    'LV_PARA = APPID & "|" & METHD & "|" & SPOSI & "|" & ISEDT & "|" & TCODE
	
	'LV_ENC = Base64Encode(LV_PARA)

    'objSess.findById("wnd[0]/usr/txtPA_PARM").text = LV_ENC
    'objSess.findById("wnd[0]/tbar[1]/btn[8]").press

End Function


'new 세션 전 최종 세션값 얻기
Function GetCHDV()

    Dim il, it, a, b
    Dim W_conn, W_Sess

    a = 0
    b = 5

    Redim sDIM(b)

    For il = 0 To objAppl.Children.Count - 1
	
        Set W_conn = objAppl.Children(il + 0)
        
        For it = 0 To W_conn.Children.Count - 1
            Set W_Sess = W_conn.Children(it + 0)

            If W_Sess.Info.SystemName & W_Sess.Info.Client & W_Sess.Info.User = W_system Then 
			   sDIM(a) = W_Sess.Info.SessionNumber 

               If a = b Then
					b = b + 5
					REDIM PRESERVE sDIM(b)
					
			   End If
			   
			   Set objConn = W_conn
               Set objSess = W_Sess

			   a = a + 1
	
            End If
        
        Next 
    
    Next 
				   
End Function


'최종 세션값 얻기
Function GetLastCHDV()

    Dim il, it, a, flg
    Dim W_conn, W_Sess

    if IsObject(objConn) then
		set objConn = Nothing
	end if
	
	if IsObject(objSess) then
		set objSess = Nothing
	end if
	
    For il = 0 To objAppl.Children.Count - 1
	
        Set W_conn = objAppl.Children(il + 0)
        
        For it = 0 To W_conn.Children.Count - 1
            Set W_Sess = W_conn.Children(it + 0)

            If W_Sess.Info.SystemName & W_Sess.Info.Client & W_Sess.Info.User = W_system Then 
			   Msc = W_Sess.Info.SessionNumber
               
			   flg = ""
			   
			   For a = 0 To ubound(sDim)
                    If sDim(a) = W_Sess.Info.SessionNumber Then
					   flg = "X"
                       Exit For
					   
					End If

               Next

               If flg = "" Then
			   	  Set objConn = W_conn
                  Set objSess = W_Sess
				  
			   End If
			   
            End If
        
        Next 
    
    Next 
				   
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

'컨트롤러 클래스 new SESSION 실행
sub newSESSIONexe

	Dim LV_RET, LV_ERR
	
	GetArg() '외부 호출 Arguments 얻기
	
	If Not IsObject(objSapGui) Then
	   Set objSapGui  = GetObject("SAPGUI")
	   Set objAppl = objSapGui.GetScriptingEngine
	   
	End If

	LV_RET = Chk_Session_Cnt() '로그인 세션 카운트 점검

	If LV_RET = "MAX_SESS" Then '최대 세션수 도달
		LV_ERR = ERR_RET("E01", "The maximum number of sessions has been reached.")
		
	End If
	
    GetCHDV() '최종 세션값 얻기
			
    SetParamTCP()          '실행 파라메터 레지스트리 등록

	call_ZU4A_CTRL_PROXY() 'APP 컨트롤러 클래스 네비게이션 호출 실행
	
End Sub

Rem ****************************************
Rem *** End Of Subroutine implementation ***
Rem ****************************************

newSESSIONexe '컨트롤러 클래스 new SESSION 실행