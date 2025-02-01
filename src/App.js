import React from "react";
import {HashRouter as Router} from "react-router-dom";
import DecimalClockCanvas from "./DecimalClockCanvas";


function App() {
  return (
    <Router>
      <DecimalClockCanvas />
    </Router>
  );
}

export default App;
