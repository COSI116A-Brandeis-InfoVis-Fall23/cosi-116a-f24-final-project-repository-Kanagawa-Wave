(() => {
  const numPoints = 100;
  const xMax = 100, yMax = 100;
  const categories = ["Urban", "Suburban", "Rural"]; // Example categories
  const colors = ["red", "blue", "green"]; // Colors corresponding to categories
  let data = [];

  // Generate random data points
  for (let i = 0; i < numPoints; i++) {
    data.push({
      x: Math.random() * xMax,
      y: Math.random() * yMax,
      category: categories[Math.floor(Math.random() * categories.length)]
    });
  }

  let margin = { top: 60, left: 100, right: 70, bottom: 40 },
      width = 500 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

  // Create SVG container for scatterplot
  let scatterplot = d3.select("#scatterplot")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
    .classed("svg-content", true)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Define scales for x and y axes
  let xScale = d3.scaleLinear()
    .domain([0, xMax])
    .range([0, width]);

  let yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);

  // Add scatterplot points
  scatterplot.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 5)
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

  // Add y-axis
  scatterplot.append("g")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("class", "axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .text("Housing Affordability Index");

  // Add Legend
  let legend = scatterplot.append("g")
    .attr("transform", `translate(${width + 20}, 0)`); // Position the legend to the right

  categories.forEach((cat, i) => {
    // Add legend circles
    legend.append("circle")
      .attr("cx", 10)
      .attr("cy", i * 20)
      .attr("r", 5)
      .attr("fill", colors[i]);

    // Add legend text
    legend.append("text")
      .attr("x", 20)
      .attr("y", i * 20 + 5)
      .text(cat)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  });
})();
