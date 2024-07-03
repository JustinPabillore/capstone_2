import './App.css';

function App() {
  return (
    <div className="main-container">
      <div className="top-container">
        <div className="box1">
          <label className="box1-label">CITC</label>
        </div>
        <div className="box1">
          <label className="box1-label">COT</label>
        </div>
        <div className="box1">
          <label className="box1-label">CSTE</label>
        </div>
        <div className="box1">
          <label className="box1-label">COM</label>
        </div>
        <div className="box1">
          <label className="box1-label">CSM</label>
        </div>
        <div className="box1">
          <label className="box1-label">CEA</label>
        </div>
        <div className="box1">
          <label className="box1-label">SHS</label>
        </div>
        <div className="box1">
          <label className="box1-label">EMPLOYEE</label>
        </div>
        <div className="box1">
          <label className="box1-label">VISITOR</label>
        </div>
        <div className="box1">
          <label className="box1-label">TOTAL</label>
        </div>
      </div>
      <div className="mid1-container">
        <span className="mid1-text">UNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES</span>
      </div>
      <div className="mid2-container">
        <div className="box2">
          <label className="box2-label">BOX 1</label>
        </div>
        <div className="box2">
          <label className="box2-label">BOX 2</label>
        </div>
        <div className="box2">
          <label className="box2-label">BOX 3</label>
        </div>
        <div className="box2">
          <label className="box2-label">BOX 4</label>
        </div>
      </div>
      <div className="bottom-container">
        <div className="bottom-left">
          Total Entry: 
        </div>
        <div className="bottom-middle">
          Total Exit: 
        </div>
        <div className="bottom-right">
          <button className="view-records-btn">View Records</button>
        </div>
      </div>
    </div>
  );
}

export default App;

