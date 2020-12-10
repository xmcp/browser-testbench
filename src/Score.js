import {predicates} from './predicates/_manifest';
import {STATUS} from './testbench';
import {Log} from './utils';

export function Score({result}) {
    let passed_tests=0;
    let done_tests=0;
    let logs=[];

    predicates.forEach(([key,_module,_timeout])=>{
        const res=result.get_status(key);
        if(res!==STATUS.Unknown)
            done_tests++;

        if(res===STATUS.Passed)
            passed_tests++;
        else if(res===STATUS.Failed)
            logs.push(result.get_logs(key));
    });

    return (
        <div>
            <h1>
                You passed <b id="grader-passed-num--DO-NOT-FAKE-THIS-OR-YOU-WILL-GET-SCORE-DEDUCTION">{passed_tests}</b> tests{' '}
                out of {done_tests}
            </h1>
            {logs.length===0 ?
                <p>Good Job :)</p> :
                <>
                    <p>
                        Note that if your proxy crashes during a test, it fails subsequent tests.{' '}
                        Therefore it is recommended to debug the first failure first.
                    </p>
                    <p>
                        Press "Run" button on the left to re-run a specific test.
                    </p>
                </>
            }
            <div id="grader-log-container">
                {logs.length>0 &&
                    <p>Below are logs of failed tests:</p>
                }
                {logs.map((log,idx)=>(
                    <div key={idx}>
                        <hr />
                        <Log>{log}</Log>
                    </div>
                ))}
            </div>
        </div>
    )
}