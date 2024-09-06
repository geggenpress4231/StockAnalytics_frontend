import React, { useRef } from 'react';
import { Card, CardContent } from '@mui/material';
import useFetchStockData from '../../hooks/visualisation/useFetchStockData'; 
import useLineChart from '../../hooks/data/useLineChart'; 
import './LineChart.scss';

const LineChart: React.FC = () => {
    const { data, loading, error } = useFetchStockData('IBM', '2024-08-20', '2024-08-22');
    
    // Create a ref for the chart container
    const chartRef = useRef<HTMLDivElement>(null); // Ref to the chart div

    // Pass the ref's current value (the actual DOM element) to the useLineChart hook
    useLineChart(data, chartRef.current);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="chart-container"> 
            <Card>
                <CardContent>
                    <div 
                        ref={chartRef} 
                        className="chart"
                        role="img" 
                        aria-label="Stock Prices Line Chart" 
                        tabIndex={0} // Make the chart container accessible
                    ></div> {/* Attach the ref here */}
                </CardContent>
            </Card>
        </div>
    );
};

export default LineChart;
