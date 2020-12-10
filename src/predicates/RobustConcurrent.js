import {useState, useEffect} from 'react';
import {rand, range, catcher, assert} from '../utils';

const ROWS=10;

export function RobustConcurrent({bench}) {
    let [serials,_set_serials]=useState(()=>gen_serials());
    let [passed_num, set_passed_num]=useState(0);

    function gen_serials() {
        let ss=range(0,ROWS).map(()=>rand());
        bench.log('URL args for each row: '+JSON.stringify(ss),'debug');
        return ss;
    }

    function onfailed(row,what) {
        bench.log(`failed to load ${what} on row ${row}`,'error');
        bench.done(false);
    }

    function onload_text_short(row,e) {
        bench.log('loaded text short on row '+row);
        catcher(bench,()=>{
            let t=e.target.contentDocument.body.textContent;
            bench.log('text short: '+t, 'debug');
            assert(t.indexOf('北京大学')!==-1, 'text short incorrect');
            set_passed_num((n)=>n+1);
        });
    }

    function onload_text_long(row,e) {
        bench.log('loaded text long on row '+row);
        catcher(bench,()=>{
            let t=e.target.contentDocument.body.textContent;
            bench.log('text long: '+t.substr(0,30)+'... length='+t.length, 'debug');
            assert(t.substr(0,30)==='LoremIpsumLoremIpsumLoremIpsum' && t.length===120000, 'text long incorrect');
            set_passed_num((n)=>n+1);
        });
    }

    function onload_image(row,e) {
        bench.log('loaded image on row '+row);
        catcher(bench,()=>{
            bench.log('image dimension: '+e.target.naturalWidth+'*'+e.target.naturalHeight, 'debug');
            assert(e.target.naturalHeight===300 && e.target.naturalWidth===300, 'image incorrect');
            set_passed_num((n)=>n+1);
        });
    }

    function onload_mp3(row,e) {
        bench.log('loaded mp3 on row '+row);
        catcher(bench,()=>{
            bench.log('mp3 duration: '+e.target.duration, 'debug');
            e.target.pause();
            assert(e.target.duration>21 && e.target.duration<22, 'mp3 incorrect');
            set_passed_num((n)=>n+1);
        });
    }

    useEffect(()=>{
        if(passed_num===ROWS*4)
            bench.done(true);
    },[bench,passed_num]);

    return (
        <div>
            <h1>Robust Concurrency Check</h1>
            <p>In this test, we load all 4 files described in <code>proxy-resource-type</code>, {ROWS} times each.</p>
            <p>It should be easy to pass this test unless your proxy crashes.</p>
            <p>Status: Loaded {passed_num} of them.</p>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>text (short)</th>
                        <th>text (long)</th>
                        <th>image</th>
                        <th>MP3</th>
                    </tr>
                </thead>
                <tbody>
                    {range(0,ROWS).map((idx)=>(
                        <tr key={idx}>
                            <td>{idx+1}</td>
                            <td>
                                <iframe
                                    title="short text"
                                    src={'/cgi-bin/forwarder?'+serials[idx]+',test_files/text.txt,text/plain;charset=utf-8'}
                                    onLoad={(e)=>onload_text_short(idx+1,e)} onError={()=>onfailed(idx+1,'short text')}
                                />
                            </td>
                            <td>
                                <iframe
                                    title="long text"
                                    src={'/cgi-bin/repeater?'+serials[idx]+',6000,LoremIpsumLoremIpsum,0'}
                                    onLoad={(e)=>onload_text_long(idx+1,e)} onError={()=>onfailed(idx+1,'long text')}
                                />
                            </td>
                            <td>
                                <img
                                    alt="img"
                                    src={'/cgi-bin/forwarder?'+serials[idx]+',test_files/cornell-box.png,image/png'}
                                    onLoad={(e)=>onload_image(idx+1,e)} onError={()=>onfailed(idx+1,'image')}
                                />
                            </td>
                            <td>
                                <audio
                                    muted={true} autoPlay={true} controls={true}
                                    src={'/cgi-bin/forwarder?'+serials[idx]+',test_files/ki-ringtone-mono.mp3,audio/mp3'}
                                    onCanPlay={(e)=>onload_mp3(idx+1,e)} onError={()=>onfailed(idx+1,'mp3')}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}