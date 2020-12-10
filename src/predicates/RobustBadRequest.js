import {useEffect} from 'react';
import {catcher, sleep, str_repeat, rand, assert} from '../utils';

export function RobustBadRequest({bench}) {
    useEffect(()=>{
        catcher(bench, async ()=>{
            bench.log('1. POST http://pkunews.pku.edu.cn/');
            fetch('http://pkunews.pku.edu.cn/',{method: 'post', mode: 'no-cors'});
            await sleep(100);

            bench.log('2. HEAD http://pkunews.pku.edu.cn/');
            fetch('http://pkunews.pku.edu.cn/',{method: 'head', mode: 'no-cors'});
            await sleep(100);

            bench.log('3. GET https://pkunews.pku.edu.cn/');
            fetch('https://pkunews.pku.edu.cn/',{mode: 'no-cors'});
            await sleep(100);

            bench.log('4. GET http://127.0.0.1.nip.io:65432/');
            fetch('http://127.0.0.1.nip.io:65432/',{mode: 'no-cors'});
            await sleep(100);

            bench.log('5. GET http://maruyama.pico/');
            fetch('http://maruyama.pico/',{mode: 'no-cors'});
            await sleep(100);

            bench.log('6. GET http://pkunews.pku.edu.cn/LoremIpsum...');
            fetch('http://pkunews.pku.edu.cn/'+str_repeat('LoremIpsum',3200),{mode: 'no-cors'});
            await sleep(100);

            bench.log('We will check if the proxy is still working after 2s');
            await sleep(1900);

            let serial=rand();
            bench.log('Finally, GET /cgi-bin/pingpong?'+serial);
            let res=await fetch('/cgi-bin/pingpong?'+serial,{mode: 'same-origin'});
            bench.log('status code = '+res.status+' '+res.statusText);
            assert(res.status===200, 'bad status code, should be 200');

            let t=await res.text();
            bench.log('response body = '+t,'debug');
            assert(t.toLowerCase().indexOf('this is ping-pong service.')!==-1, 'expecting "this is ping-pong service." in body');

            bench.done(true);
        });
    },[bench]);

    return (
        <div>
            <h1>Robust Bad Request Check</h1>
            <p>In this test we make requests that your proxy might not recognize, in particular:</p>
            <ol>
                <li>an HTTP request with POST method</li>
                <li>an HTTP request with HEAD method</li>
                <li>an HTTPS request (your proxy may receive an HTTP request with CONNECT method)</li>
                <li>an HTTP request to a host that cannot be connected to</li>
                <li>an HTTP request to a host that does not exist</li>
                <li>an HTTP request with very long (32KB) URL</li>
            </ol>
            <p>It is perfectly fine not to support them, but your proxy should not crash because of those requests.</p>
        </div>
    );
}