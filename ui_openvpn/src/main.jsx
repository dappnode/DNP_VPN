import { createRoot } from "react-dom/client";
import App from "./App";
import Header from "./Header";
// Load css in order
import "bootstrap/dist/css/bootstrap.min.css"; // Include bootstrap's css
import "./index.css"; // Additional modifying rules

function Layout() {
  return (
    <div className="App">
      <Header />
      <App />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Layout />);
