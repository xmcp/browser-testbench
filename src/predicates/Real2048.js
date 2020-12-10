import {catcher, sleep, assert} from '../utils';

const MAX_TRIES=10;
const KEY_DELAY_MS=100;

function fire_kbd_event(key,dom) {
    let e=document.createEvent("Events");
    e.initEvent("keydown",true,true);
    e.which=key;
    dom.dispatchEvent(e);
}

export function Real2048({bench}) {
    function iframe_load(e) {
        catcher(bench, async ()=>{
            let title=e.target.contentDocument.title;
            bench.log('iframe loaded, title = '+title);
            assert(title==='2048','title should be "2048"');

            for(let i=1;i<=MAX_TRIES*4;i++) {
                await sleep(KEY_DELAY_MS);
                fire_kbd_event(37+i%4,e.target.contentDocument);

                let elem=e.target.contentDocument.querySelector('.tile-container .tile-8');
                if(elem) {
                    bench.log('we got an 8 after '+i+' moves');
                    bench.done(true);
                    return;
                }
            }
            bench.log('still no 8 after '+MAX_TRIES*4+' moves','error');
            bench.log('iframe text content = '+e.target.contentDocument.body.textContent,'debug');
            bench.done(false);
        });
    }
    function iframe_error(e) {
        bench.log('iframe failed to load','error');
        bench.done(false);
    }

    return (
        <div>
            <h1>Real Page 2048 Check</h1>
            <p>Let's take a break and play 2048 now. We will automatically play the game by emulating keyboard events.</p>
            <p>Because 2048 is so hard :( , you pass this test after we get an 8.</p>
            <iframe
                src="/test_files/2048-AI-master/index.html"
                onLoad={iframe_load} onError={iframe_error}
                style={{height: '500px', width: '400px', maxWidth: 'unset'}}
            />
        </div>
    )
}