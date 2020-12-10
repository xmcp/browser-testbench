import {useEffect} from 'react';
import {catcher, assert, rand} from '../utils';

export function ProxySancheck({bench}) {
    useEffect(()=>{
        catcher(bench, async ()=>{
            let serial=rand();
            let url='/cgi-bin/pingpong?'+serial;
            bench.log('requesting '+url);
            let res=await fetch(url, {mode: 'same-origin', headers: {'X-Louder': "You're my everything"}});

            bench.log('status code = '+res.status+' '+res.statusText);
            assert(res.status===200, 'bad status code, should be 200');

            let res_header_check_server=false;
            for(let [k,v] of res.headers) {
                bench.log('response headers = '+k+': '+v,'debug');
                if(k.toLowerCase()==='server' && v.toLowerCase()==='tiny web server')
                    res_header_check_server=true;
            }
            assert(res_header_check_server, 'expecting "server: tiny web server" in response header. your proxy should pass all response headers to client!');

            let t=await res.text();
            bench.log('response body = '+t,'debug');
            assert(t.toLowerCase().indexOf('this is ping-pong service.')!==-1, 'expecting "this is ping-pong service." in body');
            assert(t.toLowerCase().indexOf('your query string: '+serial)!==-1, 'expecting "Your query string: xxxxxxxx" in body');
            assert(t.toLowerCase().replace(/\s/g,'').indexOf("x-louder:you'remyeverything")!==-1, 'expecting correct X-Louder in body. your proxy should pass all request headers to server!');
            assert(t.toLowerCase().indexOf('gecko/20120305 firefox/10.0.3')!==-1, 'expecting correct User-Agent in body. your proxy should use the string provided in writeup!');

            bench.done(true);
        });
    },[bench]);

    return (
        <div>
            <h1>Proxy Sanity Check</h1>
            <p>In this test, we request <code>/cgi-bin/pingpong</code> and do basic sanity checks on the HTTP response.</p>
            <p>If you fail this test, please make sure:</p>
            <ul>
                <li>This webpage is hosted by TINY server provided in your handout.</li>
                <li>You are browsing this page through your proxy (some browsers ignore proxy settings for localhost URL).</li>
                <li>Your proxy sends the correct <code>User-Agent</code> header as described in writeup.</li>
            </ul>
        </div>
    );
}