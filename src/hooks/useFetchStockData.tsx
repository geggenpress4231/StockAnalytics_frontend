import { useState, useEffect } from 'react';

interface StockData {
    timestamp: Date;
    open_price: number;
    close_price: number;
}

const useFetchStockData = (symbol: string, startDate: string, endDate: string) => {
    const [data, setData] = useState<StockData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/stocks?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`);
                const fetchedData = await response.json();
                
                const parsedData = fetchedData.map((d: any) => {
                    const parsedDate = new Date(d.timestamp as unknown as string);
                    parsedDate.setSeconds(0, 0); 
                    return {
                        ...d,
                        timestamp: parsedDate,
                    };
                });

                setData(parsedData);
            } catch (error) {
                setError('Error fetching stock data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, startDate, endDate]);

    return { data, loading, error };
};

export default useFetchStockData;
