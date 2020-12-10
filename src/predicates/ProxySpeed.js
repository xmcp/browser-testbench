import {useEffect, useState} from 'react';
import {catcher, assert, rand} from '../utils';

export function ProxySpeed({bench}) {
    let [req, set_req]=useState(0);

    useEffect(()=>{
        catcher(bench, async ()=>{
            for(let i=1; i<=100; i++) {
                let serial=rand();
                bench.log('request #'+i+': URL arg ?'+serial,'debug');
                let res=await fetch('/cgi-bin/pingpong?'+serial);
                assert(res.status===200, 'in request #'+i+': status code is '+res.status+', expecting 200');
                let t=await res.text();
                assert(t.indexOf('ping-pong service')!==-1, 'in request #'+i+': incorrect body: '+t);
            }
            bench.done(true);
        });
    }, [bench]);

    return (
        <div>
            <h1>Proxy Speed Check</h1>
            <p>In this test, we fire 100 requests sequentially. Your proxy should get this work done quickly.</p>
        </div>
    )
}