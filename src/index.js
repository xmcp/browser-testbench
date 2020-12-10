import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import './index.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        return {error: error};
    }

    render() {
        if(this.state.error)
            return (
                <div>
                    <h1>TestBench Error!</h1>
                    <p>Please report this to your TA.</p>
                    <p
                        id="grader-passed-num--DO-NOT-FAKE-THIS-OR-YOU-WILL-GET-SCORE-DEDUCTION"
                        style={{color: 'white', backgroundColor: 'white'}}>
                        0 {/* report score=0 to driver */}
                    </p>
                    <div id="grader-log-container">
                        <p className="log-line-error"><code>{''+this.state.error}</code></p>
                        <p>Stack Trace:</p>
                        <pre><code>{this.state.error.stack||'(not available)'}</code></pre>
                    </div>
                </div>
            )
        return this.props.children;
    }
}

ReactDOM.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
  document.getElementById('root')
);
