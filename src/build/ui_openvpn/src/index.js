import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter as Router } from "react-router-dom";
import App from "./App";
import Header from "./Header";
import registerServiceWorker from "./registerServiceWorker";
// Load css in order
import "bootstrap/dist/css/bootstrap.min.css"; // Include bootstrap's css
import "./index.css"; // Additional modifying rules

function Layout(props) {
  return (
    <Router>
      <div className="App">
        <Header />
        <App />
      </div>
    </Router>
  );
}

ReactDOM.render(<Layout />, document.getElementById("root"));
registerServiceWorker();
