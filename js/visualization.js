(() => {
  const numPoints = 100;
  const xMax = 100, yMax = 100;
  const categories = ["Urban", "Suburban", "Rural"]; 
  const colors = ["red", "blue", "green"]; 
  const shapes = ["circle", "triangle", "square"]; 
  let data = [];

  let margin = {
    top: 60,
    left: 100,
    right: 100,
    bottom: 40
  },
  width = 500 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom;

  let scatterplot = d3.select("#scatterplot")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
    .classed("svg-content", true)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let xScale = d3.scaleLinear()
    .domain([0, xMax])
    .range([0, width]);

  let yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);

  scatterplot.selectAll(".data-point")
    .data(data)
    .enter()
    .append("path")
    .attr("d", d => {
      const shape = shapes[categories.indexOf(d.category)];
      if (shape === "circle") {
        return d3.symbol().type(d3.symbolCircle).size(100)();
      } else if (shape === "triangle") {
        return d3.symbol().type(d3.symbolTriangle).size(100)();
      } else if (shape === "square") {
        return d3.symbol().type(d3.symbolSquare).size(100)();
      }
    })
    .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`)
    .attr("fill", d => colors[categories.indexOf(d.category)]);

  // Add x-axis
  scatterplot.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("class", "axisLabel")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .text("Population");

  scatterplot.append("g")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("class", "axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .text("Housing Affordability Index");

  let legend = scatterplot.append("g")
    .attr("transform", `translate(${width + 30}, 0)`);

  categories.forEach((cat, i) => {
    legend.append("path")
      .attr("d", d3.symbol().type(
        i === 0 ? d3.symbolCircle : i === 1 ? d3.symbolTriangle : d3.symbolSquare
      ).size(100)())
      .attr("transform", `translate(10, ${i * 20})`)
      .attr("fill", colors[i]);

    legend.append("text")
      .attr("x", 30)
      .attr("y", i * 20 + 5)
      .text(cat)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  });
})();
