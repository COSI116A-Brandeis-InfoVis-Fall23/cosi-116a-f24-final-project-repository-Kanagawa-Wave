// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {
  // TEMP: Generate Junk Data, source: https://www.w3schools.com/js/tryit.asp?filename=tryai_d3js_scatterplot
  const numPoints = 100;
  const xMax = 100, yMax = 100;
  let data = [];
  for (let i = 0; i < numPoints; i++) {
    data.push([Math.random() * xMax, Math.random() * yMax]);
  }

  let margin = {
    top: 60,
    left: 100,
    right: 70,
    bottom: 40
  },
  width = 500 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom,
  xValue = d => d[0],
  yValue = d => d[1],
  xLabelText = "Population",
  yLabelText = "Housing Affordability Index";

  let scatterplot = d3.select("#scatterplot")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
    .classed("svg-content", true)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let xScale = d3.scaleLinear()
    .domain([
      d3.min(data, d => xValue(d)),
      d3.max(data, d => xValue(d))
    ])
    .rangeRound([0, width]);

  let yScale = d3.scaleLinear()
    .domain([
      d3.min(data, d => yValue(d)),
      d3.max(data, d => yValue(d))
    ])
    .rangeRound([height, 0]);

  let xAxis = scatterplot.append("g")
    .attr("transform", "translate(0," + (height) + ")")
    .call(d3.axisBottom(xScale))
    .append("text")        
    .attr("class", "axisLabel")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .text(xLabelText);

  let yAxis = scatterplot.append("g")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("class", "axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .text(yLabelText);
})());