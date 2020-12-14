import {ProxySancheck} from './ProxySancheck';
import {ProxyResourceType} from './ProxyResourceType';
import {ProxySpeed} from './ProxySpeed';
import {CacheConcurrent} from './CacheConcurrent';
import {CacheLru} from './CacheLru';
import {RobustStream} from './RobustStream';
import {RobustConcurrent} from './RobustConcurrent';
import {RobustBadRequest} from './RobustBadRequest';
import {Real2048} from './Real2048';
import {RealCsapp} from './RealCsapp';

export const predicates=[
    // key, module, timeout (sec)
    ['proxy-sancheck', ProxySancheck, 2],
    ['proxy-resource-type', ProxyResourceType, 3],
    ['proxy-speed', ProxySpeed, 4],
    ['real-csapp', RealCsapp, 3],
    ['real-2048', Real2048, 6],
    ['cache-concurrent', CacheConcurrent, 5],
    ['cache-lru', CacheLru, 5],
    ['robust-concurrent',RobustConcurrent, 8],
    ['robust-bad-request',RobustBadRequest, 4],
    ['robust-stream',RobustStream, 8],
];

export let benchkey_info={};
predicates.forEach(([bench_key,module,timeout],idx)=>{
    benchkey_info[bench_key]={
        index: idx,
        module: module,
        timeout: timeout,
    };
});