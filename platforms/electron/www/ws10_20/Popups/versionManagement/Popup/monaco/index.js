window.require.config({
    paths: {    
      'vs': MONACO_VS_ROOT_PATH   // ✅ 정확한 상대 경로
    }
});


/*************************************************************
 * @function - 비교 코드 출력
 *************************************************************/
function _setCompareCode(oPARAM) {

    if (!oPARAM) {
        return;
    }

    let sSourceA = oPARAM?.sourceA || "";
    let sSourceB = oPARAM?.sourceB || "";
    let aDeltaX = oPARAM?.deltaX || [];
    let aDeltaY = oPARAM?.deltaY || [];

    let originModel = monaco.editor.createModel(sSourceA, "abap");
    let targetModel = monaco.editor.createModel(sSourceB, "abap");

    window.editor.setModel({
        original: originModel,
        modified: targetModel
    });

} // end of _setCompareCode


/*************************************************************
 * @function - 에디터 DOM이 생성되는 시점을 감지
 *************************************************************/
function _waitForEditorDomNode(editor, callback) {

    const interval = setInterval(() => {
        const domNode = editor.getDomNode();
        if (domNode) {
            clearInterval(interval);
            callback(domNode);
        }
    }, 50);
    
} // end of _waitForEditorDomNode


window.require([
    'vs/editor/editor.main',
    ], function () {

    var oTheme = {
        "base": "vs",
        "inherit": true,
        "rules": [
            {
                "token": "comment",
                "foreground": "000000",
                "fontStyle": "italic"
            },
            {
                "token": "constant",
                "foreground": "005cc5",
                "fontStyle": "None"
            },
            {
                "token": "keyword",
                "foreground": "0000ff",
                "fontStyle": "None"
            },
            {
                "token": "string",
                "foreground": "00AA00",
                "fontStyle": "None"
            },
            {
                "token": "type",
                "foreground": "000000",
                "fontStyle": "None"
            },
            {
                "token": "variable",
                "foreground": "e36209",
                "fontStyle": "None"
            }
        ],
        "colors": {
            "editor.foreground": "#24292e",
            "editor.background": "#eef6f9"
        }
    };

    monaco.editor.defineTheme(oTheme.base,
        oTheme
    );
    

    //✅ font 기본 사이즈
    const DEFAUT_FONT_SIZE = 20;

    window.editor = monaco.editor.createDiffEditor(document.getElementById('content'), {
        theme: oTheme.base,
        fontSize: DEFAUT_FONT_SIZE,
        enableSplitViewResizing: true,
        renderSideBySide: true,
        automaticLayout: true,
    });

    // 코드 변경 위치 Navigator 생성
    window.diffNavigator = monaco.editor.createDiffNavigator(window.editor, {
        followsCaret: true, // 커서 이동 시 동기화
        ignoreCharChanges: false, // 문자 단위 차이도 포함
        alwaysRevealFirst: true, // 첫 번째 변경점 자동 스크롤
    });

    // 코드 변경된 부분 스크롤 이동
    window.nav = monaco.editor.createDiffNavigator(window.editor, {
        followsCaret: true,
        ignoreCharChanges: false,
        alwaysRevealFirst: true
    });

    // 원본 에디터에 입력 막기
    editor.getOriginalEditor().updateOptions({ readOnly: true });

    // 비교 에디터에 입력 막기
    editor.getModifiedEditor().updateOptions({ readOnly: true });


    /***********************************************************************
     * ➡️ 마우스 휠로 에디터 폰트 사이즈 크기 조절 기능
     ***********************************************************************/
    let currentFontSize = DEFAUT_FONT_SIZE;

    // 에디터 중, Origin Editor가 로드 완료되는 시점에 마우스 휠 이벤트로 확대 축소 기능 추가
    _waitForEditorDomNode(editor.getOriginalEditor(), (oDom) => {
        
        const MIN_FONT_SIZE = 10;
        const MAX_FONT_SIZE = 50;

        let oOriginEditor = editor.getOriginalEditor();
        let oModifiedEditor = editor.getModifiedEditor();

        oDom.addEventListener("wheel", function (e) { 

            if (e.ctrlKey) {

                if (e.deltaY < 0 && currentFontSize < MAX_FONT_SIZE) {
                    currentFontSize++;
                } else if (e.deltaY > 0 && currentFontSize > MIN_FONT_SIZE) {
                    currentFontSize--;
                }

                oOriginEditor.updateOptions({ fontSize: currentFontSize });
                oModifiedEditor.updateOptions({ fontSize: currentFontSize });
            }

        }, { passive: false });

    });


    // 에디터 중, Modified Editor가 로드 완료되는 시점에 마우스 휠 이벤트로 확대 축소 기능 추가
    _waitForEditorDomNode(editor.getModifiedEditor(), (oDom) => {

        const MIN_FONT_SIZE = 10;
        const MAX_FONT_SIZE = 50;

        let oOriginEditor = editor.getOriginalEditor();
        let oModifiedEditor = editor.getModifiedEditor();

        oDom.addEventListener("wheel", function (e) {

            if (e.ctrlKey) {

                if (e.deltaY < 0 && currentFontSize < MAX_FONT_SIZE) {
                    currentFontSize++;
                } else if (e.deltaY > 0 && currentFontSize > MIN_FONT_SIZE) {
                    currentFontSize--;
                }

                oOriginEditor.updateOptions({ fontSize: currentFontSize });
                oModifiedEditor.updateOptions({ fontSize: currentFontSize });
            }

        }, { passive: false });

    });


    // 에디터가 로드 완료되었다고 부모에게 알려준다.
    let oMsgEvt = new MessageEvent("EDITOR_LOAD", { data: { ACTCD: "EDITOR_LOAD" } });
    if (oAPP?.attr?.oCustomEvtDom) {
        oAPP.attr.oCustomEvtDom.dispatchEvent(oMsgEvt);
    }

    return;



    /***********************************************************************
     * ✅ 단축키
     ***********************************************************************/         

        // const pressedKeys = new Set();

        editor.onKeyDown((e) => {            

         

        });

        // // 키 해제
        // editor.onKeyUp((e) => {
            

        // });

        // 폰트 기본사이즈 변경
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0, () => {      
            editor.setDefaultFontSize();
        });


        // 단축키 동작 금지 대상 ---
        // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.F3, () => {});
        // editor.addCommand(monaco.KeyCode.F3, () => {});




    /***********************************************************************
     * ✅ 우클릭 이벤트 설정
     ***********************************************************************/           
        editor.onContextMenu((e) => {

         
        });




        //✅ 우클릭 기본 탑재 메뉴 끄기
        editor.updateOptions({
            contextmenu: false // ✅ 기본 메뉴 끄기 false
        });



		// // ✅ 포커스 IN (에디터에 진입했을 때)
		// editor.onDidFocusEditorText(() => {
		// 	console.log("📌 에디터 포커스 IN");
		// });
		
		// // ✅ 포커스 OUT (에디터 밖으로 나갔을 때)
		// editor.onDidBlurEditorText(() => {
		// 	console.log("📤 에디터 포커스 OUT");
		// });



        // // 에디터가 로드 완료되었다고 부모에게 알려준다.
        // let oMsgEvt = new MessageEvent("EDITOR_LOAD", { data: { ACTCD: "EDITOR_LOAD" } });
        // if(oAPP?.attr?.oCustomEvtDom){
        //     oAPP.attr.oCustomEvtDom.dispatchEvent(oMsgEvt);
        // }

        return;



   
        //✅ 스크롤 옵션 설정
        editor.updateOptions({
            scrollbar: {
              verticalScrollbarSize: 7,  // 세로 스크롤 두께
              horizontalScrollbarSize: 7, // 가로 스크롤 두께
            //   handleMouseWheel: true,
              alwaysConsumeMouseWheel: false
            }
        });


        // ✅ 테마 동적 변경

        var themeList = ['vs', 'vs-dark', 'hc-black']  //현재 테마 리스트 - 자체적으로 관리는 않함 개인적으로 관리해야함 

        //var _theme = editor._themeService._theme.themeData.base;  //<-- 현재 적용된 테마 
        monaco.editor.setTheme('vs'); // 밝은 테마
        monaco.editor.setTheme('vs-dark'); // 어두운 테마


        // //✅ 주석 동적 처리
        //      현재 _theme = editor._themeService._theme.themeData.base
                // 읽어서 _theme + "user" 명으로 해서 아래 로직을 동적으로 생성하고 수행해야할듯
        // monaco.editor.defineTheme('custom-theme', {
        //     base: 'vs-dark', // or 'vs'
        //     inherit: true,
        //     rules: [
        //       { token: 'comment', foreground: 'ff5555', fontStyle: 'italic' }
        //     ],
        //     colors: {}
        //   });
          
        // monaco.editor.setTheme('custom-theme');


        //✅ 테마 변경 이벤트
        const themeService = editor._themeService;
        themeService.onDidColorThemeChange((newTheme) => {
          console.log("🎨 테마가 변경됨:", newTheme.themeName);
          // 원하는 로직 실행
        });



        // ✅ 라인 숫자 옆 아이콘 설정 
        const decorations = editor.deltaDecorations([], [
            {
              range: new monaco.Range(2, 1, 2, 1), // 2번째 줄
              options: {
                isWholeLine: true,
                glyphMarginClassName: 'my-icon-gutter' // 커스텀 클래스 삽입
              }
            }
        ]);



        // //✅ 특정 Line 디자인 설정
        // editor.deltaDecorations([], [
        //     {
        //       range: new monaco.Range(2, 1, 3, 1), // 3번째 줄 전체
        //       options: {
        //         isWholeLine: true,
        //         className: 'my-line-highlight' // ✅ CSS로 처리할 클래스
        //       }
        //     }
        // ]);


        //✅ 우클릭 이벤트 설정
        editor.onMouseDown((e) => {
            if (e.event.rightButton) {
               
                //e.target.element  <-- dom 오브젝트
                const position = e.target.position;

                console.log('🖱️ 우클릭 위치:', position);
                console.log('🖱️ 우클릭 위치:', e.target.element);
          
            }
        });

        //✅ 우클릭 기본 탑재 메뉴 끄기
        editor.updateOptions({
            contextmenu: false // ✅ 기본 메뉴 끄기 false
        });


        //✅ 우클릭 기본 메뉴에 메뉴 추가
        //   서브 메뉴 지원않함!!!
        editor.addAction({
            id: 'explain-with-ai',
            label: '🧠 커스텀 메뉴 추가!!!!',
            // contextMenuGroupId: 'navigation',
            contextMenuGroupId: '1_shhong',
            contextMenuOrder: 1, //그룹 내 위치 (작을수록 위에)
            run: function(ed) {
                const selection = ed.getSelection();
                const selectedText = ed.getModel().getValueInRange(selection);
                alert('🧠 선택한 코드:\n' + selectedText);
            }
        });



        // //✅ Editor 영역 잠금/해제 처리 
        // editor.updateOptions({
        //     readOnly: false    
        // });        

        // //Editor 잠김 상태 여부 
        // editor.getOption(monaco.editor.EditorOption.readOnly);


        //✅ 현재 커서 위치 가져오기
        const position = editor.getPosition();
        console.log("현재 줄:", position.lineNumber);
        console.log("현재 칼럼:", position.column);

        //✅ 현재 커서 위치 이동 
        editor.setPosition({ lineNumber: 5, column: 1 }); // 5번째 줄, 첫 번째 칼럼로 이동
        editor.focus(); // 커서 반짝이게 하려면 focus도 같이


        //✅ 현재 커서 자동 감지하려면 (커서가 이동할 때마다)
        editor.onDidChangeCursorPosition((e) => {
            const pos = e.position;
            console.log(`📍 커서 위치 → 줄 ${pos.lineNumber}, 칼럼 ${pos.column}`);
        });



        //✅ 선택된 영역의 텍스트 가져오기
        const selection = editor.getSelection();
        const selectedText = editor.getModel().getValueInRange(selection);
        console.log("📋 선택된 텍스트:\n", selectedText);
        
        //✅ 특정 영역 블럭 선택 처리 1, 1 → 4번째 줄의 첫 번째 문자
        editor.setSelection(new monaco.Range(1, 1, 4, 1));
        editor.focus();


        //✅ 선택된 영역 자동 감지하려면 (선택 바뀔 때마다)
        editor.onDidChangeCursorSelection((e) => {

            const range = e.selection;
            const text = editor.getModel().getValueInRange(range);

            if (text) {
              console.log("🔸 선택됨:", text);
            }

            if (text.trim().length > 0) {
                console.log("🔸 선택됨:", text);
            } 
            
        });


        //✅ 미니맵 켜기/끄기 
        editor.updateOptions({
            minimap: { enabled: true }  //false 끄기
        });

        //✅ 미니맵 설정 전체 예시
        editor.updateOptions({
            minimap: {
              enabled: true,              // 켜기/끄기
              side: 'right',              // 'right' or 'left'
              size: 'proportional',       // 'proportional' | 'fill' | 'fit'
              renderCharacters: true,     // true면 실제 코드 모양 렌더링
              showSlider: 'mouseover'        // 'always' or 'mouseover'
            }
        });


        //✅ 텍스트 붙여넣기 
        editor.onDidPaste((event) => {
            console.log("붙여넣은 내용:", event.range);
        });


        // ✅ 외부 드래그 처리 (예: 텍스트 끌어오기)
        (()=>{

            const container = editor.getDomNode();

            container.addEventListener('dragover', (e) => {
              e.preventDefault(); // 기본 동작 막기
            });
            
            container.addEventListener('drop', (e) => {
              e.preventDefault();
            
              const text = e.dataTransfer.getData('text/plain');
              const position = editor.getPosition();

              editor.executeEdits('', [
                {
                  range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                  text: text,
                  forceMoveMarkers: true
                }
              ]);
            
              editor.focus();
    
            });

        })();


        // ✅ 로컬PC 파일 드롭 
        (()=>{
        
            const container = editor.getDomNode();

            // 🔁 드래그 오버 시 기본 동작 막기
            container.addEventListener('dragover', function (e) {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            });
            
            // 📥 드롭 이벤트 처리
            container.addEventListener('drop', function (e) {
              e.preventDefault();
            
              const file = e.dataTransfer.files[0];
              if (!file) return;
                
              //파일 확장자 필터
              if (!file.name.endsWith('.txt') && !file.name.endsWith('.js')) {
                alert("지원하지 않는 파일 형식입니다.");
                return;
              }

              const reader = new FileReader();
            
              reader.onload = function (event) {
                const text = event.target.result;
                editor.setValue(text); // 📌 Monaco Editor에 텍스트 삽입
              };
            
              reader.readAsText(file); // 📥 파일 내용 읽기
            });

        })();


        // ✅ 꾸밈프린트
        editor.getAction('editor.action.formatDocument').run();


        // ✅ 꾸밈프린트 - 커스텀 ? 확인 다시 해야함!!!!!!!!!!!
        monaco.languages.register({ id: 'html' });
        monaco.languages.registerDocumentFormattingEditProvider('html', {
            provideDocumentFormattingEdits: function(model, options, token) {
              console.log('📦 포맷 요청 들어옴!');
              const original = model.getValue();
              const formatted = original.toUpperCase(); // 그냥 대문자로 바꾸는 테스트
          
              return [
                {
                  range: model.getFullModelRange(),
                  text: formatted
                }
              ];
            }
        });


        // ✅ 언어 변경 방법 (실행 중에 변경)
        monaco.editor.setModelLanguage(editor.getModel(), 'javascript');


   


        // ✅ 코드 액션이 동작하는 설정
        editor.updateOptions({
            lightbulb: {
              enabled: true
            }
        });

        // ✅ 코드 액션 - 에디터 상에 전구아이콘 클릭시 callback 메뉴 팝업처리
        monaco.languages.registerCodeActionProvider('javascript', {
            provideCodeActions: function(model, range, context, token) {
              return {
                actions: [
                  {
                    title: '💡 이 줄을 콘솔로 출력하기',
                    kind: 'quickfix',
                    diagnostics: [],
                    edit: {
                      edits: [
                        {
                          resource: model.uri,
                          edit: {
                            range: range,
                            text: `console.log(${model.getValueInRange(range)});`
                          }
                        }
                      ]
                    },
                    isPreferred: true
                  }
                ],
                dispose: () => {}
              };
            }
        });


        // ✅ 예제: 특정 키워드에 툴팁 달기
        monaco.languages.registerHoverProvider('javascript', {
            provideHover: function(model, position) {
              const wordInfo = model.getWordAtPosition(position);
              if (!wordInfo) return;
          
              const word = wordInfo.word;
          
              // 예시: 특정 단어에만 툴팁 표시
              if (word === 'ttt') {
                return {
                  range: new monaco.Range(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn),
                  contents: [
                    { value: '**ttt 변수**' },
                    { value: '메롱메롱메롱' }
                  ]
                };
              }
            }
        });
          

        //✅ Monaco Hover UI를 끄고, 직접 HTML 요소로 툴팁을 만들기"
        // function showCustomTooltip(x, y, html) {
        //     const tooltip = document.getElementById('custom-tooltip');
        //     tooltip.innerHTML = html;
        //     tooltip.style.left = `${x + 10}px`;
        //     tooltip.style.top = `${y + 10}px`;
        //     tooltip.style.display = 'block';
        // }

        // function hideCustomTooltip() {
        //     document.getElementById('custom-tooltip').style.display = 'none';
        // }

        // editor.onMouseMove((e) => {
        //     const pos = e.target.position;
        //     const word = editor.getModel().getWordAtPosition(pos);
          
        //     if (word?.word === 'ttt') {
        //       showCustomTooltip(e.event.browserEvent.pageX, e.event.browserEvent.pageY, '<b>HTML 툴팁</b>');
        //     } else {
        //       hideCustomTooltip();
        //     }
        // });


        //Monaco Editor 내부에 결과 박스 삽입하기
        const outputWidget = {
            domNode: null,
          
            getId: function () {
              return 'my.custom.inline.output';
            },
          
            getDomNode: function () {
              if (!this.domNode) {
                this.domNode = document.createElement('div');
                this.domNode.style.background = '#222';
                // this.domNode.style.border = '2px solid black';
                // this.domNode.style.border = '3px dashed red'; // 점선 빨간색 테두리
                this.domNode.style.border = '3px solid red'; // 점선 빨간색 테두리
                // this.domNode.style.width = "100%";
                this.domNode.style.color = 'white';
                this.domNode.style.padding = '6px 12px';
                this.domNode.style.borderRadius = '6px';
                this.domNode.style.marginTop = '1px';
                this.domNode.innerText = '📤 FIX 라인 ==================================';
              }
              return this.domNode;
            },
          
            getPosition: function () {
              return {
                position: {
                  lineNumber: 1,
                  column: 50
                },
                preference: [
                  monaco.editor.ContentWidgetPositionPreference.BELOW
                ]
              };
            }
          };


        editor.addContentWidget(outputWidget);


});