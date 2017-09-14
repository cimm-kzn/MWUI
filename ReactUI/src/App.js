import React, { Component } from 'react';
import MarvinEditor from './components/MarvinEditor';

class App extends Component {
  render() {
    return (
      <div className="container">
        { this.props.children }
        <MarvinEditor />
      </div>
    );
  }
}

export default App;
