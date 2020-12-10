import {useState, useEffect} from 'react';

function fixn(n,x) {
    return (''+x).padStart(n,'0');
}

export function get_time_str() {
    let d=new Date();
    return `${d.getHours()}:${fixn(2,d.getMinutes())}:${fixn(2,d.getSeconds())}.${fixn(3,d.getMilliseconds())}`;
}

export function rand(digits=8) {
    let res='';
    for(let i=0;i<digits;i++)
        res+='1234567891'[Math.floor(Math.random()*9)];
    return res;
}

export function Log({children}) {
    return (
        <div className="log-viewer">{
            children.map(([line,channel],idx)=>(
                <pre key={idx} className={'log-line log-line-'+channel}><code>{line}</code></pre>
            ))
        }</div>
    );
}

export function catcher(inst,fn,onerror=null) {
    try {
        let ret=fn();
        if(ret && (typeof ret.catch)==='function') // fn is async so we get a Promise
            ret
                .catch((error)=>{
                    console.warn(error);
                    if(onerror) {
                        if(onerror(error))
                            return;
                    }
                    inst.log(''+error, 'error');
                    inst.done(false);
                });
    } catch(error) {
        console.warn(error);
        inst.log(''+error, 'error');
        inst.done(false);
    }
}

export function assert(cond,err) {
    if(!cond) {
        throw new Error(err);
    }
}

export function range(a,b) {
    let ret=[];
    for(let i=a;i<b;i++)
        ret.push(i);
    return ret;
}

export function NoCacheImg({src, onLoad, onError, bench}) {
    let [loading, set_loading]=useState(true);
    let [res, set_res]=useState(null);

    useEffect(()=>{
        catcher(bench, async ()=>{
            let serial=rand();
            let res=await fetch(src, {headers: {'x-cache-key': serial}});
            set_res(URL.createObjectURL(await res.blob()));
            set_loading(false);
        });
    }, [bench, src]);

    useEffect(()=>{
        return ()=>{
            if(res)
                URL.revokeObjectURL(res);
        };
    }, [res]);

    if(loading)
        return 'loading...';
    else
        return (
            <img src={res} onLoad={onLoad} onError={onError} alt="img" />
        );
}

export async function setblock(block) {
    let tmp_serial=rand();
    let res=await fetch('/cgi-bin/setblock?'+tmp_serial+','+(block?1:0));
    assert(res.status===200, 'setblock failed with status '+res.status);
    let t=await res.text();
    assert(t==='ok', 'setblock failed with text '+t);
}

export async function sleep(ms) {
    return new Promise((resolve)=>{
        setTimeout(resolve,ms);
    });
}

export function str_repeat(s,n) {
    let out='';
    while(n--)
        out+=s;
    return out;
}