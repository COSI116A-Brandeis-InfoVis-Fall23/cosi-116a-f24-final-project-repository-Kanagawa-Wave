/* global D3 */

// Initialize a line chart. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/

// Some code snippets generated or inspired by ChatGPT
function scatterplot() {

    // Based on Mike Bostock's margin convention
    // https://bl.ocks.org/mbostock/3019563
    let margin = {
        top: 50,
        left: 100,
        right: 100,
        bottom: 60
      },
      width = 300,
      height = 150,
      ourBrush = null,
      selectableElements = d3.select(null),
      dispatcher;
  
    // Create the chart by adding an svg to the div with the id 
    // specified by the selector using the given data
    function plot(selector, affordability) {
      const categories = ["Urban", "Suburban", "Rural"]; 
      const colors = ["red", "blue", "green"]; 
      const shapes = ["circle", "triangle", "square"]; 

      let scatterplot = d3.select(selector)
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
        .classed("svg-content", true)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
      let xScale = d3.scaleLog()
        .domain([200, 10020000])
        .range([0, width])
        .base(2);

      let yScale = d3.scaleLog()
        .domain([6, 140])
        .range([height, 0])
        .base(2);
    
      let points = scatterplot.append("g")
        .selectAll(".scatterPoint")
        .data(affordability);
      
      points.exit().remove();
        
      points = points.enter()
        .append("path")
        .attr("class", "point scatterPoint")
        .attr("d", d => {
          const shape = shapes[categories.indexOf(d.Classification)];
          if (shape === "circle") {
            return d3.symbol().type(d3.symbolCircle).size(5)();
          } else if (shape === "triangle") {
            return d3.symbol().type(d3.symbolTriangle).size(5)();
          } else if (shape === "square") {
            return d3.symbol().type(d3.symbolSquare).size(5)();
          }
        })
        .attr("transform", d => `translate(${xScale(d.Population)}, ${yScale(d.HousingAffordabilityIndex)})`)
        .attr("fill", d => colors[categories.indexOf(d.Classification)])

        xAxis = scatterplot.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));
        
        xAxis.selectAll("text")
            .style("font-size", "6px");

        xAxis.append("text")
            .attr("class", "axisLabel")
            .attr("x", width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text("Population")
            .style("font-size", "6px");

        yAxis = scatterplot.append("g")
            .call(d3.axisLeft(yScale));
        
        yAxis.selectAll("text")
            .style("font-size", "6px");

        yAxis.append("text")
            .attr("class", "axisLabel")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .text("Housing Affordability Index")
            .style("font-size", "6px");
        
        scatterplot.selectAll(".tick line")
            .style("stroke", "black")
            .style("stroke-width", .5)

        let legend = scatterplot.append("g")
            .attr("transform", `translate(${width - 30}, 0)`)
            .style("font-size", "6px");

        categories.forEach((cat, i) => {
            legend.append("path")
            .attr("d", d3.symbol().type(
                i === 0 ? d3.symbolCircle : i === 1 ? d3.symbolTriangle : d3.symbolSquare
            ).size(20)())
            .attr("transform", `translate(10, ${i * 20})`)
            .attr("fill", colors[i]);

            legend.append("text")
            .attr("x", 15)
            .attr("y", i * 20 + 0.5)
            .text(cat)
            .style("font-size", "6px")
            .style("fill", "black")
            .attr("alignment-baseline", "middle");
        });
          
      // TODO
      // selectableElements = ...;
      selectableElements = scatterplot.selectAll(".scatterPoint")
      scatterplot.call(brush);
      // Highlight points when brushed
    function brush(g) {
      const brush = d3.brush() // Create a 2D interactive brush
        .on("start brush", highlight) // When the brush starts/continues do...
        .on("end", brushEnd) // When the brush ends do...
        .extent([
          [-margin.left, -margin.bottom],
          [width + margin.right, height + margin.top]
        ]);
        
      ourBrush = brush;

      g.call(brush); // Adds the brush to this element

      // Highlight the selected circles
      function highlight() {
        if (d3.event.selection === null) return;
        const [
          [x0, y0],
          [x1, y1]
        ] = d3.event.selection;

        // If within the bounds of the brush, select it
        scatterplot.selectAll(".scatterPoint").classed("selected", d =>
          x0 <= xScale(d.Population) && xScale(d.Population) <= x1 && 
          y0 <= yScale(d.HousingAffordabilityIndex) && yScale(d.HousingAffordabilityIndex) <= y1
      );

        // Get the name of our dispatcher's event
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

        // Let other charts know about our selection
        dispatcher.call(dispatchString, this, scatterplot.selectAll(".scatterPoint.selected").data());
        console.log(scatterplot.selectAll(".scatterPoint.selected").data())
      }
      
      function brushEnd(){
        // We don't want infinite recursion
        if(d3.event.sourceEvent.type!="end"){
          d3.select(this).call(brush.move, null);
        }         
      }
    }

    return plot;
    }
  
    plot.margin = function (_) {
      if (!arguments.length) return margin;
      margin = _;
      return plot;
    };
  
    plot.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      return plot;
    };
  
    plot.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      return plot;
    };
  
    // Gets or sets the dispatcher we use for selection events
    plot.selectionDispatcher = function (_) {
      if (!arguments.length) return dispatcher;
      dispatcher = _;
      return plot;
    };
  
    // Given selected data from another visualization 
    // select the relevant elements here (linking)
    plot.updateSelection = function (selectedData) {
      if (!arguments.length) return;

      const selectedIDs = new Set(selectedData.map(d => d.id));
      console.log(selectedIDs)
      
      selectableElements.classed("selected", d => {

        return selectedIDs.has(d.FIPS);
      });
    };
  
    return plot;
  }