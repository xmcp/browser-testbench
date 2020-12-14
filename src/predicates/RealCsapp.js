import {catcher, sleep, assert} from '../utils';

const MAX_TRIES=10;
const KEY_DELAY_MS=100;

function fire_kbd_event(key,dom) {
    let e=document.createEvent("Events");
    e.initEvent("keydown",true,true);
    e.which=key;
    dom.dispatchEvent(e);
}

export function RealCsapp({bench}) {
    function iframe_load(e) {
        catcher(bench, async ()=>{
            assert(e.target.contentDocument,'cannot get loaded document');

            let title=e.target.contentDocument.title;
            bench.log('iframe loaded, title = '+title);
            assert(title.indexOf('CS:APP')!==-1,'title should contains "CS:APP"');

            let imgs=Array.from(e.target.contentDocument.querySelectorAll('img'));
            assert(imgs.length===1, 'should have exactly one image on the webpage, but found '+imgs.length);

            bench.done(true);
        });
    }
    function iframe_error(e) {
        bench.log('iframe failed to load','error');
        bench.done(false);
    }

    return (
        <div>
            <h1>Real Page CSAPP Check</h1>
            <p>The homepage of CSAPP book is a simple webpage. Hopefully your proxy can handle it.</p>
            <iframe
                src="/test_files/csapp_3e/home.html"
                onLoad={iframe_load} onError={iframe_error}
                style={{height: '500px', width: '600px', maxWidth: 'unset'}}
            />
        </div>
    )
}