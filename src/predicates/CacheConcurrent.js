import {useEffect, useState} from 'react';
import {catcher, assert, rand, range, NoCacheImg, setblock} from '../utils';

const COL=5;
const ROW_STAGE_1=3;
const ROW_STAGE_3=3;
const ROW_STAGE_4=3;

export function CacheConcurrent({bench}) {
    let [stage, set_stage]=useState(0);
    let [num_loaded, set_num_loaded]=useState(0);
    let [serials, _set_serials]=useState(()=>gen_serials());
    /*
    0: waiting for setblock(0)
    1: loading first 2 rows
    2: waiting for setblock(1)
    3: loading other rows
    4: loading new rows
    5: done
     */

    function gen_serials() {
        // first COL for stage 1 and 3; other COL for stage 4
        return range(0,2*COL).map(()=>-rand());
    }

    function progress(callback_stage) {
        if(callback_stage===stage)
            set_num_loaded((n)=>n+1);
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
                bench.log('URL args for step 1 and step 3: '+JSON.stringify(serials.slice(0,COL)),'debug')
                bench.log('URL args for step 4: '+JSON.stringify(serials.slice(COL)),'debug')
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
        if(stage===1 && num_loaded===ROW_STAGE_1*COL) {
            set_num_loaded(0);
            set_stage(2);
        } else if(stage===3 && num_loaded===ROW_STAGE_3*COL) {
            set_num_loaded(0);
            set_stage(4);
        } else if(stage===4 && num_loaded===ROW_STAGE_4*COL) {
            set_num_loaded(0);
            set_stage(5);
        }
    }, [stage, num_loaded]);

    return (
        <div>
            <h1>Cache Concurrency Check</h1>
            <p>In this test, we check the caching functionality of your proxy by these steps:</p>
            <ol>
                <li>Load {COL} images with different URL. Each image will be loaded {ROW_STAGE_1} times.</li>
                <li>Tell TINY to stop responding to new requests.</li>
                <li>Load these images again. Each image will be loaded {ROW_STAGE_3} times and they should be served by your proxy.</li>
                <li>Load {COL} new images, {ROW_STAGE_4} times each. These requests should fail because TINY has stopped responding.</li>
                <li>Done :)</li>
            </ol>
            <p>Status: We are on step {stage} now.</p>
            <table border="1">
                <tbody>
                    {stage>=1 &&
                        <>
                            <tr>
                                <td>URL</td>
                                {range(0,COL).map((col)=>(
                                    <td key={col}>
                                        <a href={'/cgi-bin/forwarder?'+serials[col]+',test_files/cornell-box.png,image/png'} target="_blank">
                                            ?{serials[col]}
                                        </a>
                                    </td>
                                ))}
                            </tr>
                            {range(0,ROW_STAGE_1).map((row)=>(
                                <tr key={row}>
                                    <td>Step 1</td>
                                    {range(0,COL).map((col)=>(
                                        <td key={col}>
                                            <NoCacheImg bench={bench}
                                                src={'/cgi-bin/forwarder?'+serials[col]+',test_files/cornell-box.png,image/png'}
                                                onLoad={()=>progress(1)} onError={()=>fail(1)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </>
                    }

                    {stage>=3 &&
                        range(0,ROW_STAGE_3).map((row)=>(
                            <tr key={row}>
                                <td>Step 3</td>
                                {range(0,COL).map((col)=>(
                                    <td key={col}>
                                        <NoCacheImg bench={bench}
                                            src={'/cgi-bin/forwarder?'+serials[col]+',test_files/cornell-box.png,image/png'}
                                            onLoad={()=>progress(3)} onError={()=>fail(3)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))
                    }

                    {stage>=4 &&
                        <>
                            <tr>
                                <td>URL</td>
                                {range(0,COL).map((col)=>(
                                    <td key={col}>
                                        <a href={'/cgi-bin/forwarder?'+serials[COL+col]+',test_files/cornell-box.png,image/png'} target="_blank">
                                            ?{serials[COL+col]}
                                        </a>
                                    </td>
                                ))}
                            </tr>
                            {range(0,ROW_STAGE_4).map((row)=>(
                                <tr key={row}>
                                    <td>Step 4</td>
                                    {range(0,COL).map((col)=>(
                                        <td key={col}>
                                            <NoCacheImg bench={bench}
                                                src={'/cgi-bin/forwarder?'+serials[COL+col]+',test_files/cornell-box.png,image/png'}
                                                onError={()=>progress(4)} onLoad={()=>fail(4)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </>
                    }
                </tbody>
            </table>
        </div>
    )
}