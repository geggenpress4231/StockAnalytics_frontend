import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@mui/material';
import useFetchStockData from '../../hooks/visualisation/useFetchStockData'; 
import { drawLineChart } from '../../hooks/data/useLineChart';  
import './LineChart.scss';

const LineChart: React.FC = () => {
    const { data, loading, error } = useFetchStockData('IBM', '2024-08-20', '2024-08-22');
    
    // Create a ref for the chart container
    const chartRef = useRef<HTMLDivElement>(null); // Ref to the chart div

    // Use effect to handle chart rendering when data is available
    useEffect(() => {
        if (chartRef.current && data.length > 0) {
            drawLineChart(data, chartRef.current);  // Call the chart drawing function
        }
    }, [data]);  

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
