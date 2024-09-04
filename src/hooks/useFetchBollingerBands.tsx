import { useState, useEffect } from 'react';
interface BollingerBandsData {
    timestamp: Date;
    bollinger_upper: number;
    bollinger_lower: number;
}

const useFetchBollingerBands = (symbol: string, startDate: string, endDate: string) => {
    const [data, setData] = useState<BollingerBandsData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/bollinger-bands?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`);
                const fetchedData = await response.json();

                const parsedData = fetchedData.map((d: any) => ({
                    ...d,
                    timestamp: new Date(d.timestamp),
                }));

                setData(parsedData);
            } catch (error) {
                setError('Error fetching Bollinger Bands');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, startDate, endDate]);

    return { data, loading, error };
};

export default useFetchBollingerBands;
