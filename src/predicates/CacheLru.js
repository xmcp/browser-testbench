import {useEffect, useState} from 'react';
import {catcher, setblock, rand, range, NoCacheImg} from '../utils';

const TOT_COUNT=30;
const CHECK_COUNT=3;

export function CacheLru({bench}) {
    let [stage, set_stage]=useState(0);
    let [num_loaded, set_num_loaded]=useState(0);
    let [serials, _set_serials]=useState(()=>gen_serials());
    /*
    0: setblock(0)
    1: sequentially load images [0,TOT_COUNT)
    2: setblock(1)
    3: load images [TOT_COUNT-CHECK_COUNT,TOT_COUNT), which should load
    4: load images [0,CHECK_COUNT), which should fail
    5: done
     */

    function gen_serials() {
        // first COL for stage 1 and 3; other COL for stage 4
        return range(0,TOT_COUNT).map(()=>-rand());
    }

    function progress(callback_stage) {
        if(callback_stage===stage) {
            set_num_loaded((n)=>n+1);
        }
    }
    function fail(callback_stage) {
        bench.log('failed at step '+callback_stage, 'error');
        catcher(bench,()=>setblock(false));
        bench.done(false);
    }

    useEffect(()=>{
        bench.log('step '+stage);
        catcher(bench, async ()=>{
            if(stage===0) {
                await setblock(false);
                bench.log('URL args for each image: '+JSON.stringify(serials),'debug');
                set_num_loaded(0);
                set_stage(1);
            } else if(stage===2) {
                await setblock(true);
                set_num_loaded(0);
                set_stage(3);
            } else if(stage===5) {
                await setblock(false);
                bench.done(true);
            }
        });
    }, [bench, stage]);

    useEffect(()=>{
        if(stage===1 && num_loaded===TOT_COUNT) {
            set_num_loaded(0);
            set_stage(2);
        } else if(stage===3 && num_loaded===CHECK_COUNT) {
            set_num_loaded(0);
            set_stage(4);
        } else if(stage===4 && num_loaded===CHECK_COUNT) {
            set_num_loaded(0);
            set_stage(5);
        }
    }, [stage, num_loaded]);

    return (
        <div>
            <h1>Cache LRU Check</h1>
            <p>In this test, we check the LRU nature of your caching proxy by these steps:</p>
            <ol>
                <li>Load images #0 ~ #{TOT_COUNT-1} in a nearly sequential manner. Each image is of 50KB large so it should be added into cache.</li>
                <li>Tell TINY to stop responding to new requests.</li>
                <li>Load images #{TOT_COUNT-CHECK_COUNT} ~ #{TOT_COUNT-1} again. They should be served by your proxy.</li>
                <li>Load images #0 ~ #{CHECK_COUNT-1}. They should be evicted from cache; therefore these requests will fail.</li>
                <li>Done :)</li>
            </ol>
            <p>We are on step {stage} now.</p>
            {stage>=1 &&
                <div>
                    <h2>Step 1</h2>
                    <p>{range(0, (stage===1 ? Math.min(num_loaded+2, TOT_COUNT) : TOT_COUNT)).map((idx) => (
                        <span key={idx} style={{display: 'inline-block'}}>
                                <p>Image #{idx} ↓</p>
                                <p>
                                    <NoCacheImg bench={bench}
                                                src={'/cgi-bin/forwarder?'+serials[idx]+',test_files/cornell-box.png,image/png'}
                                                onLoad={() => progress(1)} onError={() => fail(1)}
                                    />
                                </p>
                            </span>
                    ))}</p>
                </div>
            }
            {stage>=3 &&
            <div>
                <h2>Step 3</h2>
                <p>{range(TOT_COUNT-CHECK_COUNT, TOT_COUNT).map((idx) => (
                    <span key={idx} style={{display: 'inline-block'}}>
                            <p>Image #{idx} ↓</p>
                            <p>
                                <NoCacheImg bench={bench}
                                            src={'/cgi-bin/forwarder?'+serials[idx]+',test_files/cornell-box.png,image/png'}
                                            onLoad={() => progress(3)} onError={() => fail(3)}
                                />
                            </p>
                        </span>
                ))}</p>
            </div>
            }
            {stage>=4 &&
                <div>
                    <h2>Step 4</h2>
                    <p>{range(0, CHECK_COUNT).map((idx) => (
                        <span key={idx} style={{display: 'inline-block'}}>
                            <p>Image #{idx} ↓</p>
                            <p>
                                <NoCacheImg bench={bench}
                                            src={'/cgi-bin/forwarder?'+serials[idx]+',test_files/cornell-box.png,image/png'}
                                            onError={()=>progress(4)} onLoad={()=>fail(4)}
                                />
                            </p>
                        </span>
                    ))}</p>
                </div>
            }

        </div>
    )
}