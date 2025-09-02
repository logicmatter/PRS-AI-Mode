import React from "react";
import FormComponent from "./components/AlarmForm";
import ChartComponent from "./components/Alarmchart";

function App() {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <FormComponent />
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-md-12">
          <ChartComponent />
        </div>
      </div>
    </div>
  );
}

export default App;
