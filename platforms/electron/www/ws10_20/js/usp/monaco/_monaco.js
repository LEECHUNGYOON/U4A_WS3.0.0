

window.require.config({
    paths: {
    //   'vs': parent.__dirname + '/lib/monaco/vs'   // ✅ 정확한 상대 경로
      'vs': './lib/monaco/vs'   // ✅ 정확한 상대 경로
    }
});

window.require([
    'vs/editor/editor.main',
    // 'vs/language/html/htmlWorker'   // ✅ 추가 필요!
    ], function () {
        /**************

        monaco.editor.defineTheme('u4a-dark-pastel', {
            base: 'vs-dark', // or 'vs' for 밝은 베이스
            inherit: true,
            rules: [
              { token: 'comment', foreground: 'FFFF00', fontStyle: 'italic' },
              { token: 'keyword', foreground: 'C792EA' },
              { token: 'number', foreground: 'F78C6C' },
              { token: 'string', foreground: 'ECC48D' },
              { token: 'operator', foreground: '89DDFF' },
              { token: 'variable', foreground: '82AAFF' },
              { token: 'type', foreground: 'FFCB6B' },
              { token: 'function', foreground: '80CBC4' }
            ],
            colors: {
              'editor.background': '#0F111A',          // 아주 어두운 배경
              'editor.foreground': '#D0D0D0',          // 기본 텍스트
              'editorLineNumber.foreground': '#3A3F4B',
              'editorLineNumber.activeForeground': '#C792EA',
              'editor.selectionBackground': '#2A2D3E',
              'editor.inactiveSelectionBackground': '#2A2D3E88',
              'editorCursor.foreground': '#FFCC00',
              'editorWhitespace.foreground': '#3A3F4B',
              'editorIndentGuide.background': '#2C313A',
              'editorIndentGuide.activeBackground': '#C792EA',
              'editor.lineHighlightBackground': '#1E1E1E50'
            }
        });
          



        // 기본 에디터 설정
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false
        });
        
        // 자동완성을 위한 TypeScript 컴파일러 옵션 설정
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES6,
            allowNonTsExtensions: true
        });


        // JavaScript 스니펫 등록하기
        monaco.languages.registerCompletionItemProvider('javascript', {
            provideCompletionItems: function(model, position) {
                const suggestions = [
                    {
                        label: 'for',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'For Loop'
                    },
                    {
                        label: 'forEach',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '${1:array}.forEach((${2:item}) => {\n\t${3}\n});',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'forEach Loop'
                    },
                    {
                        label: 'if',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'if (${1:condition}) {\n\t${2}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'If Statement'
                    },
                    // 다른 스니펫들 추가
                ];
                
                return {
                    suggestions: suggestions
                };
            }
        });


        ***************/

        

        // Editor 랜더링
        // window.editor =  monaco.editor.create(document.getElementById('editor-left'), {
        window.editor =  monaco.editor.create(document.getElementById('content'), {
            value: 'var ttt = ""; \n\n\n',
            language: 'html',
            theme: 'vs-dark',
            glyphMargin: true,
            automaticLayout: true,
            tabCompletion: 'on',  // 탭 완성 활성화
            snippetSuggestions: 'inline',  // 스니펫 제안 표시 방법
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            wordWrap: "off", // ✅ 줄 바꿈 끄기 → 가로 스크롤 생김!

            scrollbar: {
                verticalScrollbarSize: 7,
                horizontalScrollbarSize: 7,
                // handleMouseWheel: true,
                alwaysConsumeMouseWheel: false
            }

        });


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


        //✅ 라이브 Editor 체인징
        editor.onDidChangeModelContent((event) => {
            // const currentCode = editor.getValue();
            // console.log("✍️ 코드 변경됨:");

            // //변경 포지션 정보 시작라인,시작컬럼
            // event.changes.forEach(change => {
            //     console.log("변경 범위:", change.range);
            //     console.log("변경된 텍스트:", change.text);
            // });

        });



        //✅ Ctrl + 마우스 휠로 폰트 크기 제어
        let currentFontSize = 14;
        const MIN_FONT_SIZE = 10;
        const MAX_FONT_SIZE = 50;

        // ✅ Ctrl + 마우스 휠 이벤트 처리
        editor.getDomNode().addEventListener('wheel', function (e) {
            if (e.ctrlKey) {
                e.preventDefault(); // 브라우저 기본 확대 방지

                if (e.deltaY < 0 && currentFontSize < MAX_FONT_SIZE) {
                    currentFontSize++;
                } else if (e.deltaY > 0 && currentFontSize > MIN_FONT_SIZE) {
                    currentFontSize--;
                }

                editor.updateOptions({ fontSize: currentFontSize });
            }
        }, { passive: false }); // ❗ passive: false → preventDefault() 허용






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


        // ✅ 단축키
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
            console.log('💾 Ctrl+S pressed!');
        });


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
