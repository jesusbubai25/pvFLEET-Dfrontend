import "./App.css";
import Leafleet from "./mapComponent/Leafleet";

function App() {
  return (
    <>
      <div className="app">
        <Leafleet />
        <div className="footer">
         <span>&#169;</span>{" "} <a target="_blank" href="https://greenenco.co.uk">greenenco.co.uk.</a>&nbsp;All Rights Reserved.
        </div>
      </div>
    </>
  );
}

export default App;
