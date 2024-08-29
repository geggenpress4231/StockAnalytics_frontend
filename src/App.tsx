import React from 'react';
import LineChart from './components/LineChart/LineChart';
import './App.css'; // Import the CSS file

const App: React.FC = () => {
    return (
        <div className="app-container">
            <LineChart />
        </div>
    );
}

export default App;
