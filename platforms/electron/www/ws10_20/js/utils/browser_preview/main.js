
const EventEmitter = require('events');
const puppeteer = require("puppeteer-core");



const BrowserPreviewStatusCode = {
    NO_URL_FOUND: 'NO_URL_FOUND',
    NO_PAGE_FOUND: 'NO_PAGE_FOUND',
    ALREADY_LAUNCHED: 'ALREADY_LAUNCHED',
    LAUNCH_FAILED: 'LAUNCH_FAILED',
    ABORTED_BY_USER: 'ABORTED_BY_USER',
    REQUEST_ERROR: 'REQUEST_ERROR'
};



class CLBrowserPreview extends EventEmitter {

    constructor(option = {}){
        super();

        // 기본 옵션
        const defaultOptions = {
            url: '',
            launchOptions: {
                headless: false,
                defaultViewport: null
            }
        };

        this.option = {
            ...defaultOptions,
            ...option,
            launchOptions: {
                ...defaultOptions.launchOptions,
                ...(option.launchOptions || {})
            }
        };

        // URL 검증
        if (!this.option.url) {
            throw new Error('URL은 필수입니다. option.url을 설정하세요.');
        }

        // Chrome 실행 경로 검증
        if (!this.option.launchOptions.executablePath) {
            throw new Error('Chrome 실행 경로가 필요합니다. option.launchOptions.executablePath를 설정하세요.');
        }

        this.browser = null;
        this.page = null;

    }

    // 화면에 클릭한 이벤트 데이터
    _fireAction(action) {
        this.emit('action', action);     
    }

    /**
     * [내부] Puppeteer 리스너 등록
     */
    _registerPuppeteerListeners() {

        if (!this.page) return;

        // 페이지 에러
        this.page.on('pageerror', (err) => {
            // if (this.status !== RecorderState.RECORDING) return;
            // this._pushError(BrowserPreviewStatusCode.BROWSER_CONSOLE_ERROR, err.message, { stack: err.stack });
        });

        // 요청 실패
        this.page.on('requestfailed', (req) => {
            // if (this.status !== RecorderState.RECORDING) return;
            // const failure = req.failure();
            // if (failure?.errorText === 'net::ERR_ABORTED') return;
            // this._pushError(BrowserPreviewStatusCode.REQUEST_ERROR, failure?.errorText || 'Failed', { url: req.url(), method: req.method() });
        });

    }

    /**
     * [내부] 브라우저 주입 스크립트 (이벤트 감지 로직 포함)
     */
    _getInjectionScript() {
        return function() {

            // [중복 실행 방지]
            if (window.u4arec) return;

            window.u4arec = {
                onUserAction: (action) => window.__u4arecCallback && window.__u4arecCallback(action)
            };

            // Selector 생성 함수
            function getSelector(el) {
                if (el.id) return '#' + el.id;
                if (el.name) return '[name="' + el.name + '"]';
                if (el.className && typeof el.className === 'string') {
                    const classes = el.className.trim().split(/\s+/).join('.');
                    if (classes) return el.tagName.toLowerCase() + '.' + classes;
                }
                const parent = el.parentElement;
                if (parent) {
                    const index = Array.from(parent.children).indexOf(el) + 1;
                    return getSelector(parent) + ' > ' + el.tagName.toLowerCase() + ':nth-child(' + index + ')';
                }
                return el.tagName.toLowerCase();
            }

            // 이벤트 리스너 등록 함수
            function registerEventListeners() {
                // 1. Click
                document.addEventListener('click', (e) => {
                    
                    console.log("click!!");

                    const actionData = {
                        type: 'click',
                        selector: getSelector(e.target),
                        x: e.clientX,
                        y: e.clientY
                    };

                    if(typeof sap === "undefined"){
                        return;
                    }

                    if(!sap?.ui?.core?.Element?.closestTo){
                        return;
                    }

                    let sSelector = getSelector(e.target);

                    let oControl = sap.ui.core.Element.closestTo(sSelector);
                    if(!oControl){
                        return;
                    }

                    let sOBJID = oControl.data("OBJID");
                    if(!sOBJID){
                        return;
                    }

                    // if (e.target.type === 'checkbox' || e.target.type === 'radio') {
                    //     actionData.checked = e.target.checked;
                    // }

                    const oUiInfo = {
                        OBJID: sOBJID
                    };

                    window.u4arec.onUserAction(oUiInfo);

                }, true);      
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', registerEventListeners);
            } else {
                registerEventListeners();
            }

        };
    }

    // async launchPage() {

    //     debugger;

    //     try {

    //         this.browser = await puppeteer.launch(this.option.launchOptions);

    //         let aLaunchArgs = this.launchOptions.args || [];
    //         if(aLaunchArgs.length !== 0){
    //             let bIsAppMode = aLaunchArgs.some(arg  => arg.startsWith("--app="));
    //             if(bIsAppMode){
    //                 return;
    //             }
    //         }
            

    //         this.page = await this.browser.newPage();

    //         this._registerPuppeteerListeners();

    //         // 브라우저 강제 종료 감지
    //         this.browser.once('disconnected', () => {
    //             this.emit('close');                
    //         });



    //         await this.page.goto(this.option.url);

    //     } catch (error) {
    //         return { RETCD: 'E', STCOD: BrowserPreviewStatusCode.LAUNCH_FAILED, MSGTX: error.message };
    //     }

    //     return { RETCD: 'S' };

    // }

    async launchPage() {
    
        try {
            this.browser = await puppeteer.launch(this.option.launchOptions);

            let aLaunchArgs = this.option.launchOptions.args || [];
            let bIsAppMode = false;
            
            if(aLaunchArgs.length !== 0){
                bIsAppMode = aLaunchArgs.some(arg => arg.startsWith("--app="));
            }

            // 앱 모드면 기존 페이지 가져오기, 아니면 새 페이지 생성
            if(bIsAppMode){
                const pages = await this.browser.pages();
                this.page = pages[0]; // 앱 모드에서는 첫 번째 페이지 사용
            } else {
                this.page = await this.browser.newPage();
                await this.page.goto(this.option.url);
            }

            this._registerPuppeteerListeners();

            // 브라우저 강제 종료 감지
            this.browser.once('disconnected', () => {
                this.emit('close');                
            });

            await this.page.exposeFunction('__u4arecCallback', (action) => {                
                this._fireAction(action);                
            });

            let sInjectScript = this._getInjectionScript();

            this.page.evaluateOnNewDocument(sInjectScript);

        } catch (error) {
            return { RETCD: 'E', STCOD: BrowserPreviewStatusCode.LAUNCH_FAILED, MSGTX: error.message };
        }

        return { RETCD: 'S' };
    }    

}

module.exports = { CLBrowserPreview, BrowserPreviewStatusCode };