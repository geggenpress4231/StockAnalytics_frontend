import * as d3 from 'd3';
import { useEffect } from 'react';

interface BollingerData {
    bollinger_upper: number | undefined;
    bollinger_lower: number | undefined;
    timestamp: Date;
    moving_average_5: number;
    moving_average_10: number;
}

const useBollingerBandsChart = (data: BollingerData[], selector: string) => {
    useEffect(() => {
        if (data.length > 0) {
            const margin = { top: 5, right: 5, bottom: 40, left: 30 };
            const width = 640 - margin.left - margin.right;
            const height = 320 - margin.top - margin.bottom;

            d3.select(selector).selectAll("*").remove();  // Clear the container

            const svg = d3.select(selector)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // X and Y axis scales
            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.timestamp) as [Date, Date])
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([
                    d3.min(data, d => d.bollinger_lower)! - 10,
                    d3.max(data, d => d.bollinger_upper)! + 10
                ])
                .range([height, 0]);

            // Line functions
            const lineMovingAverage5 = d3.line<BollingerData>()
                .x(d => x(d.timestamp))
                .y(d => y(d.moving_average_5));

            const lineMovingAverage10 = d3.line<BollingerData>()
                .x(d => x(d.timestamp))
                .y(d => y(d.moving_average_10));

            // Bollinger Bands area
            const areaBollingerBands = d3.area<BollingerData>()
                .x(d => x(d.timestamp))
                .y0(d => y(d.bollinger_lower!))
                .y1(d => y(d.bollinger_upper!));

            // Append Bollinger Bands area
            const bollingerPath = svg.append("path")
                .datum(data)
                .attr("fill", "#cce5df")
                .attr("stroke", "none")
                .attr("d", areaBollingerBands);

            // Append moving average lines
            const ma5Path = svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#ff7f0e")
                .attr("stroke-width", 2)
                .attr("class", "line line-ma5")
                .attr("d", lineMovingAverage5);

            const ma10Path = svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#2ca02c")
                .attr("stroke-width", 2)
                .attr("class", "line line-ma10")
                .attr("d", lineMovingAverage10);

            // Add axes
            const xAxis = svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(5));

            svg.append("g").call(d3.axisLeft(y).ticks(5));

            // Tooltip initialization
            const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "#f9f9f9")
                .style("padding", "5px")
                .style("border", "1px solid #ccc")
                .style("border-radius", "4px")
                .style("pointer-events", "none")
                .style("opacity", 0)
                .style("z-index", 1000);

            const bisectDate = d3.bisector<BollingerData, Date>(d => d.timestamp).left;

            svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mousemove", function (event) {
                    const [mouseX] = d3.pointer(event);
                    const x0 = x.invert(mouseX);
                    const i = bisectDate(data, x0, 1);
                    const d0 = i > 0 ? data[i - 1] : null;
                    const d1 = i < data.length ? data[i] : null;

                    if (!d0 || !d1) return;
                    const d = x0.getTime() - d0.timestamp.getTime() > d1.timestamp.getTime() - x0.getTime() ? d1 : d0;

                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`
                        <strong>Date:</strong> ${d.timestamp.toLocaleDateString()}<br/>
                        <strong>MA5:</strong> ${d.moving_average_5.toFixed(2)}<br/>
                        <strong>MA10:</strong> ${d.moving_average_10.toFixed(2)}<br/>
                        <strong>Bollinger Upper:</strong> ${d.bollinger_upper?.toFixed(2)}<br/>
                        <strong>Bollinger Lower:</strong> ${d.bollinger_lower?.toFixed(2)}
                    `)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 30}px`);
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            // Zoom functionality
            const zoom = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([1, 10])
                .translateExtent([[0, 0], [width, height]])
                .extent([[0, 0], [width, height]])
                .on("zoom", (event) => {
                    const newX = event.transform.rescaleX(x);
                    xAxis.call(d3.axisBottom(newX));
                    bollingerPath.attr("d", areaBollingerBands.x(d => newX(d.timestamp))(data) as string);
                    ma5Path.attr("d", lineMovingAverage5.x(d => newX(d.timestamp))(data) as string);
                    ma10Path.attr("d", lineMovingAverage10.x(d => newX(d.timestamp))(data) as string);
                });

            const svgElement = svg.node()?.closest('svg');
            if (svgElement) {
                d3.select(svgElement).call(zoom).on("wheel.zoom", null);  // Disable zoom on mouse wheel
            }

            // Add range slider to control zoom
            d3.select(selector)
                .append("input")
                .attr("type", "range")
                .attr("min", "1")
                .attr("max", "10")
                .attr("step", "0.1")
                .attr("value", "1")
                .attr("class", "chart-slider")
                .style("position", "absolute")
                .style("right", "10px")
                .style("top", "10px")
                .on("input", function () {
                    const scale = +this.value;
                    const transform = d3.zoomIdentity.scale(scale);
                    if (svgElement) {
                        d3.select(svgElement).call(zoom.transform as any, transform);
                    }
                });

            // Legend 
            const legend = svg.append("g").attr("class", "legend").attr("transform", "translate(10,10)");

            // Bollinger Bands
            legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 10).style("fill", "#cce5df");
            legend.append("text").attr("x", 20).attr("y", 9).style("font-size", "12px").text("Bollinger Bands");

            // Moving Average 5
            legend.append("rect").attr("x", 0).attr("y", 20).attr("width", 10).attr("height", 10).style("fill", "#ff7f0e");
            legend.append("text").attr("x", 20).attr("y", 29).style("font-size", "12px").text("Moving Average 5");

            // Moving Average 10
            legend.append("rect").attr("x", 0).attr("y", 40).attr("width", 10).attr("height", 10).style("fill", "#2ca02c");
            legend.append("text").attr("x", 20).attr("y", 49).style("font-size", "12px").text("Moving Average 10");
        }
    }, [data, selector]);
};

export default useBollingerBandsChart;
