import {useState, useRef, useEffect} from 'react';

import {useTestbench, STATUS} from './testbench';
import {predicates, benchkey_info} from './predicates/_manifest';
import {Score} from './Score';
import {Log} from './utils';

import './App.css';

function Welcome() {
    return (
        <div>
            <h1>Welcome to Browser TestBench</h1>
            <p>
                This testbench will emulate many web application behaviors in your browser.
            </p>
            <p>
                Set up your proxy, press "Run All Tests" on the left, and see if your proxy can handle them correctly.{' '}
                Run a specific test by pressing "Run" next to it.
            </p>
            <p>
                You can figure out what HTTP requests are actually made during a test by{' '}
                inserting appropriate <code>printf</code> in your proxy program.{' '}
                Other tools including the Network tab from your browser's developer tool might also be helpful. {' '}
                Consult writeup for debugging tips.
            </p>
            <p>
                We will grade Real Pages score based on number of tests your proxy passes.
            </p>
        </div>
    )
}

function App() {
    let auto_conf=useRef({
        is_auto: false,
        fail_fast: false,
    });
    let [is_fail_fast, set_is_fail_fast]=useState(()=>navigator.userAgent.indexOf('proxylab_test_runner')===-1);
    let [current_instance, set_current_instance]=useState(null);

    useEffect(()=>{
        if(auto_conf.current)
            auto_conf.current.fail_fast=is_fail_fast;

        console.log('update fail fast',auto_conf.current);
    },[is_fail_fast]);

    useEffect(()=>{
        document.title='Browser Testbench';
    },[]);

    function done_callback(bench_key,result_status) {
        console.log('done_callback',auto_conf.current,bench_key);
        if(auto_conf.current.is_auto) {
            if(result_status===STATUS.Failed && auto_conf.current.fail_fast) {
                //set_current_instance(null);
                return;
            }
            // otherwise: do next test
            let idx=benchkey_info[bench_key].index;
            if(idx<predicates.length-1) // have next test
                setTimeout(()=>{
                    do_bench(predicates[idx+1][0]);
                },150); // may reduce some race between tests
            else // have done all
                set_current_instance(null);
        }
    }

    let bench=useTestbench(done_callback);

    function do_bench(bench_key) {
        if(current_instance)
            bench.kill_bench(current_instance.bench_key);

        const inst=bench.start_bench(bench_key);
        set_current_instance(inst);

        const timeout=1000*benchkey_info[bench_key].timeout;

        setTimeout(()=>{
            inst.log(`TIMEOUT (${timeout}ms), killed`,'error');
            inst.done(false);
        },timeout);
    }

    function do_manual_bench(bench_key) {
        auto_conf.current.is_auto=false;
        do_bench(bench_key);
    }

    function do_auto_bench() {
        auto_conf.current.is_auto=true;
        bench.clear_stats();
        do_bench(predicates[0][0]);
    }

    let CurrentModule=null;
    if(current_instance) {
        CurrentModule=benchkey_info[current_instance.bench_key].module;
    }

    return (
        <div>
            <div className="ui-sider">
                <p>
                    <button onClick={()=>do_auto_bench()} id="grader-run-btn">Run All Tests</button>
                </p>
                <p>
                    <label>
                        <input type="checkbox" checked={is_fail_fast} onChange={(e)=>set_is_fail_fast(e.target.checked)} />
                        &nbsp;Stop on first failure
                    </label>
                </p>
                <table border={1}>
                    <thead>
                        <tr>
                            <th>Test</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {predicates.map(([k,_module,_timeout])=>(
                            <tr key={k} className={current_instance && current_instance.bench_key===k ? 'bench-current' : ''}>
                                <td>{k}</td>
                                <td className={'bench-status-'+bench.get_status(k)}>
                                    <button onClick={()=>do_manual_bench(k)}>Run</button>
                                    &nbsp;{bench.get_status(k)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="ui-main">
                {current_instance ?
                    <div>
                        <CurrentModule key={current_instance.runkey} bench={current_instance} />
                        <hr />
                        <Log>{current_instance.get_logs()}</Log>
                    </div> :
                    (auto_conf.current.is_auto ? // finished
                        <Score result={bench} /> :
                        <Welcome />
                    )
                }
            </div>
        </div>
    );
}

export default App;
