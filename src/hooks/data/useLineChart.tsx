import * as d3 from 'd3';
import { useEffect } from 'react';

interface StockData {
    timestamp: Date;
    open_price: number;
    close_price: number;
}

const useLineChart = (data: StockData[], chartContainer: HTMLDivElement | null) => {
    useEffect(() => {
        if (data.length > 0 && chartContainer) {  // Ensure the chartContainer is defined
            const margin = { top: 5, right: 5, bottom: 40, left: 30 }; 
            const width = 640 - margin.left - margin.right; 
            const height = 320 - margin.top - margin.bottom; 

            // Clear the container before rendering
            d3.select(chartContainer).selectAll("*").remove(); // Use chartContainer directly

            const svg = d3.select(chartContainer)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.timestamp) as [Date, Date])
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([
                    d3.min(data, d => Math.min(d.open_price, d.close_price)) as number,
                    d3.max(data, d => Math.max(d.open_price, d.close_price)) as number
                ])
                .nice()
                .range([height, 0]);

            const lineOpen = d3.line<StockData>()
                .x(d => x(d.timestamp))
                .y(d => y(d.open_price));

            const lineClose = d3.line<StockData>()
                .x(d => x(d.timestamp))
                .y(d => y(d.close_price));

            // Draw the open and close lines
            svg.append("path")
                .datum(data)
                .attr("class", "line-open")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2)
                .attr("d", lineOpen(data) as string);

            svg.append("path")
                .datum(data)
                .attr("class", "line-close")
                .attr("fill", "none")
                .attr("stroke", "orange")
                .attr("stroke-width", 2)
                .attr("d", lineClose(data) as string);

            const xAxis = svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(5));

            const yAxis = svg.append("g")
                .call(d3.axisLeft(y).ticks(5));

            // Tooltip for displaying details on hover
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "#f9f9f9")
                .style("padding", "5px")
                .style("border", "1px solid #ccc")
                .style("border-radius", "4px")
                .style("pointer-events", "none")
                .style("opacity", 0)
                .style("z-index", 1000);

            const bisectDate = d3.bisector<StockData, Date>(d => d.timestamp).left;

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
                    tooltip.html(
                        `<strong>Date:</strong> ${d.timestamp.toLocaleDateString()}<br/>
                         <strong>Open:</strong> $${d.open_price.toFixed(2)}<br/>
                         <strong>Close:</strong> $${d.close_price.toFixed(2)}`
                    )
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 30}px`);
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            const zoom = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([1, 10])
                .translateExtent([[0, 0], [width, height]])
                .extent([[0, 0], [width, height]])
                .on("zoom", (event: any) => {
                    const newX = event.transform.rescaleX(x);
                    xAxis.call(d3.axisBottom(newX).ticks(10)); // More ticks for better granularity
                    svg.select<SVGPathElement>(".line-open")
                        .attr("d", lineOpen.x(d => newX(d.timestamp))(data) as string);
                    svg.select<SVGPathElement>(".line-close")
                        .attr("d", lineClose.x(d => newX(d.timestamp))(data) as string);
                });

            // Apply zoom behavior to the SVG element
            const svgElement = svg.node()?.closest('svg');
            if (svgElement) {
                d3.select(svgElement).call(zoom).on("wheel.zoom", null); // Disable zoom on mouse wheel
            }

            // Add the slider for zoom control
            d3.select(chartContainer) // Appending slider inside the chart container
                .append("input")
                .attr("type", "range")
                .attr("min", "1")
                .attr("max", "10")
                .attr("step", "0.1")
                .attr("value", "1")
                .attr("class", "chart-slider") // Add class for slider
                .style("position", "absolute")
                .style("right", "10px") // Align to top-right corner
                .style("top", "10px")
                .on("input", function () {
                    const scale = +this.value;
                    const transform = d3.zoomIdentity.scale(scale);
                    if (svgElement) {
                        d3.select(svgElement).call(zoom.transform as any, transform);
                    }
                });

            // Add a legend to the top left corner
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(10,10)");

            legend.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", "steelblue");

            legend.append("text")
                .attr("x", 20)
                .attr("y", 10)
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .style("font-size", "12px")
                .text("Open Price");

            legend.append("rect")
                .attr("x", 0)
                .attr("y", 20)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", "orange");

            legend.append("text")
                .attr("x", 20)
                .attr("y", 30)
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .style("font-size", "12px")
                .text("Close Price");
        }
    }, [data, chartContainer]); // Include chartContainer as a dependency
};

export default useLineChart;
