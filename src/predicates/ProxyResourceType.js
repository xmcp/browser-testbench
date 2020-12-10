import {useEffect, useState, useRef} from 'react';
import {catcher, assert, rand} from '../utils';

export function ProxyResourceType({bench}) {
    let [serial,_set_serial]=useState(()=>rand());
    let [passed_num, set_passed_num]=useState(0);
    let ref_text_short=useRef(null);
    let ref_text_long=useRef(null);
    let ref_image=useRef(null);
    let ref_mp3=useRef(null);

    useEffect(()=>{
        bench.log('URL arg is ?'+serial,'debug');
    },[serial]);

    function onfailed(what) {
        bench.log(`failed to load ${what}`,'error');
        bench.done(false);
    }

    function onload_text_short() {
        bench.log('loaded text short');
        catcher(bench,()=>{
            let t=ref_text_short.current.contentDocument.body.textContent;
            bench.log('text short: '+t, 'debug');
            assert(t.indexOf('北京大学')!==-1, 'text short incorrect');
            set_passed_num((n)=>n+1);
        });
    }

    function onload_text_long() {
        bench.log('loaded text long');
        catcher(bench,()=>{
            let t=ref_text_long.current.contentDocument.body.textContent;
            bench.log('text long: '+t.substr(0,30)+'... length='+t.length, 'debug');
            assert(t.substr(0,30)==='LoremIpsumLoremIpsumLoremIpsum' && t.length===500000, 'text long incorrect');
            set_passed_num((n)=>n+1);
        });
    }

    function onload_image() {
        bench.log('loaded image');
        catcher(bench,()=>{
            bench.log('image dimension: '+ref_image.current.naturalWidth+'*'+ref_image.current.naturalHeight, 'debug');
            assert(ref_image.current.naturalHeight===300 && ref_image.current.naturalWidth===300, 'image incorrect');
            set_passed_num((n)=>n+1);
        });
    }

    function onload_mp3() {
        bench.log('loaded mp3');
        catcher(bench,()=>{
            bench.log('mp3 duration: '+ref_mp3.current.duration, 'debug');
            assert(ref_mp3.current.duration>21 && ref_mp3.current.duration<22, 'mp3 incorrect');
            set_passed_num((n)=>n+1);
        });
    }

    useEffect(()=>{
        if(passed_num===4)
            bench.done(true);
    }, [bench, passed_num]);

    return (
        <div>
            <h1>Proxy Resource Type Check</h1>
            <p>In this test, we request 1) a short Unicode text file, 2) a longer (500KB) text file, 3) an image and 4) an MP3 audio from the server.</p>
            <p>Your proxy should handle them correctly.</p>
            <p>Note that HTTP responses may not have a <code>Content-Length</code> header.</p>
            <p>Status: Loaded {passed_num} of them.</p>
            <p>1)</p>
            <iframe
                ref={ref_text_short} title="short text"
                src={'/cgi-bin/forwarder?'+serial+',test_files/text.txt,text/plain;charset=utf-8'}
                onLoad={onload_text_short} onError={()=>onfailed('short text')}
            />
            <p>2)</p>
            <iframe
                ref={ref_text_long} title="long text"
                src={'/cgi-bin/repeater?'+serial+',50000,LoremIpsum,0'}
                onLoad={onload_text_long} onError={()=>onfailed('long text')}
            />
            <p>3)</p>
            <img
                ref={ref_image} alt="img"
                src={'/cgi-bin/forwarder?'+serial+',test_files/cornell-box.png,image/png'}
                onLoad={onload_image} onError={()=>onfailed('image')}
            />
            <p>4)</p>
            <audio
                ref={ref_mp3} muted={true} autoPlay={true} controls={true}
                src={'/cgi-bin/forwarder?'+serial+',test_files/ki-ringtone-mono.mp3,audio/mp3'}
                onCanPlay={onload_mp3} onError={()=>onfailed('mp3')}
            />
        </div>
    )
}