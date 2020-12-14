import {useState, useEffect} from 'react';
import {range, rand, catcher, assert, sleep} from '../utils';

const TOT_PINGS=5;
const PING_INTV_MS=900;
const TOT_FRAMES=2; // https://stackoverflow.com/questions/985431/max-parallel-http-connections-in-a-browser

export function RobustStream({bench}) {
    let [passed_pings,set_passed_pings]=useState(0);
    let [passed_frames,set_passed_frames]=useState(0);
    let [serials,_set_serials]=useState(()=>gen_serials());
    let [url_flipped,set_url_flipped]=useState(false);

    function gen_serials() {
        let ss=range(0,2*TOT_FRAMES).map(()=>rand());
        bench.log('URL args for time-consuming requests: '+JSON.stringify(ss.slice(0,TOT_FRAMES)),'debug');
        bench.log('URL args for time-consuming requests after 1s: '+JSON.stringify(ss.slice(TOT_FRAMES)),'debug');
        return ss;
    }

    useEffect(()=>{
        if(passed_pings<TOT_PINGS)
            catcher(bench, async ()=>{
                await sleep(PING_INTV_MS);

                let serial=rand(8);
                bench.log('pinging server #'+(passed_pings+1)+', URL arg ?'+serial);

                let res=await Promise.race([
                    fetch('/cgi-bin/pingpong?'+serial),
                    new Promise((_, rej)=>{
                        setTimeout(()=>rej(new Error('ping request timeout (1s)')),1000);
                    }),
                ]);
                assert(res.status===200, 'status code = '+res.status+', should be 200');

                let t=await res.text();
                assert(t.toLowerCase().indexOf('this is ping-pong service.')!==-1, 'server respondeded: '+t);
                assert(t.toLowerCase().indexOf(serial)!==-1, 'server did not return correct serial: '+t);

                bench.log('passed check','debug');
                set_passed_pings(passed_pings+1);
            }, ()=>{
                return false;
            });
    },[bench,passed_pings]);

    useEffect(()=>{
        setTimeout(()=>{
            bench.log('reloading these requests');
            set_url_flipped(true);
        },1200);
    },[bench]);

    function frame_onload(idx,e) {
        bench.log('frame '+idx+' loaded');
        catcher(bench, ()=>{
            assert(e.target.contentDocument,'cannot get loaded document');
            let t=e.target.contentDocument.body.textContent;
            assert(t.indexOf('LoremIpsum')===0,'bad content: '+t.substr(200));
            set_passed_frames((n)=>n+1);
        });
    }

    function frame_onerror(idx) {
        bench.log('frame '+idx+' load error','error');
        bench.done(false);
    }

    function abandoned_onload(idx,e) {
        bench.log('frame '+idx+' (before URL change) loaded but it should not','error');
        catcher(bench, ()=>{
            assert(e.target.contentDocument,'cannot get loaded document');
            let t=e.target.contentDocument.body.textContent;
            assert('content: '+t.substr(200),'debug');
        });
        bench.done(false);
    }

    function abandoned_onerror(idx) {
        bench.log('frame '+idx+' (before URL change) load error','error');
        bench.done(false);
    }

    useEffect(()=>{
        if(passed_pings===TOT_PINGS && passed_frames===TOT_FRAMES)
            bench.done(true);
    },[bench,passed_pings,passed_frames])

    return (
        <div>
            <h1>Robust Stream Check</h1>
            <p>In this test, we request {TOT_FRAMES} URLs that will take a long time (3s) to load.</p>
            <p>We will change the URL after 1.2s (when they are still loading), probably bringing a SIGPIPE to your proxy.</p>
            <p>Meanwhile, we routinely request <code>/cgi-bin/pingpong</code> and expect the proxy to serve all requests concurrently.</p>
            <p>Status: Ping check {passed_pings} / {TOT_PINGS}. Long request loaded {passed_frames} / {TOT_FRAMES}.</p>
            <div>
                {range(0,TOT_FRAMES).map((idx)=>(
                    <iframe
                        key={(url_flipped?TOT_FRAMES:0)+idx} title="testing"
                        src={'/cgi-bin/repeater?'+serials[url_flipped?TOT_FRAMES+idx:idx]+',-15,LoremIpsumLoremIpsum,200'}
                        {...(url_flipped ?
                            {onLoad: (e)=>frame_onload(idx,e), onError: ()=>frame_onerror(idx)} :
                            {onLoad: (e)=>abandoned_onload(idx,e), onError: ()=>abandoned_onerror(idx)}
                        )}
                    />
                ))}
            </div>
        </div>
    );
}