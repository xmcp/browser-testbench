import {useRef, useReducer} from 'react';
import {get_time_str, rand} from './utils';

export const STATUS={
    Running: 'running',
    Passed: 'passed',
    Failed: 'failed',
    Unknown: 'unknown'
}

export function useTestbench(done_callback) {
    const stats=useRef({});

    // dirty react hack: trigger a state change when ref is changed in order to re-render components
    const [_stats_update_time,update_stats_sync]=useReducer(()=>(+new Date()),null);

    function update_stats() {
        //update_stats_sync();
        setTimeout(update_stats_sync,1);
    }

    return {
        clear_stats: ()=>{
            stats.current={};
            update_stats();
        },
        get_status: (bench_key)=>(stats.current[bench_key]||{status:STATUS.Unknown}).status,
        get_logs: (bench_key)=>(stats.current[bench_key]||{logs:['--- no logs ---','debug']}).logs,
        start_bench: (bench_key)=>{
            const runkey=rand(6);
            stats.current[bench_key]={
                status: STATUS.Running,
                logs: [[`[${get_time_str()}] --- Running [${bench_key}]`,'header']],
                runkey: runkey,
            };
            return {
                bench_key: bench_key,
                runkey: runkey,
                log: (text,channel='info')=>{
                    text=`[${get_time_str()} ${channel}] ${text}`;
                    let b=stats.current[bench_key];
                    if(!b || b.runkey!==runkey) {
                        console.log(`IGNORED to log ${bench_key} (${runkey}): ${text}`);
                    } else {
                        console.log(`log ${bench_key} (${runkey}) ${channel}: ${text}`);
                        b.logs.push([text,channel]);
                        update_stats();
                    }
                },
                done: (passed)=>{
                    let status=passed ? STATUS.Passed : STATUS.Failed;
                    let b=stats.current[bench_key];
                    if(!b || b.runkey!==runkey) {
                        console.log(`IGNORED to update status ${bench_key} (${runkey}): ${status}`);
                    } else {
                        console.log(`log ${bench_key} (${runkey}): ${status}`);
                        b.logs.push([`[${get_time_str()}] TEST FINISHED. status = ${status}`,passed?'success':'error']);
                        b.status=status;
                        b.runkey=null;
                        done_callback(bench_key,status);
                        update_stats();
                    }
                },
                get_logs: ()=>{
                    let b=stats.current[bench_key];
                    if(!b) {
                        return [['--- test does not exist ---','debug']];
                    } else if(!b.runkey) {
                        return b.logs.concat([['--- test stopped ---','debug']]);
                    } else if(b.runkey!==runkey) {
                        return [['--- test outdated ---','debug']];
                    } else {
                        return b.logs;
                    }
                },
            };
        },
        kill_bench: (bench_key)=>{
            let b=stats.current[bench_key];
            if(b && b.runkey) {
                console.log(`KILLED ${bench_key} (${b.runkey})`);
                b.runkey=null;
                if(b.status===STATUS.Running)
                    b.status=STATUS.Unknown;
                update_stats();
            }
        }
    };
}