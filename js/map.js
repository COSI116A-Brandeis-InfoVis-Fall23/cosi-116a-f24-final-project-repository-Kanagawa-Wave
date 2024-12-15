/* global D3 */

// Initialize a line chart. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function usmap() {

    // Based on Mike Bostock's margin convention
    // https://bl.ocks.org/mbostock/3019563
    let margin = {
        top: 20,
        left: 300,
        right: 300,
        bottom: 0
      },
      width = 975,
      height = 610,
      ourBrush = null,
      selectableElements = d3.select(null),
      dispatcher = null;
  
    // Create the chart by adding an svg to the div with the id 
    // specified by the selector using the given data
    function map(selector, legend_selector, affordability, us) {
      let centered = null;
      let zoomLevel = 1;

      let svg = d3.select(selector)
        .append("svg")
          .attr("preserveAspectRatio", "xMidYMid meet")
          .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
  
      svg = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Map FIPS codes to Housing Affordability Index
      const valuemap = new Map(affordability.map(d => [d.FIPS, +d.HousingAffordabilityIndex]));

      const color = d3.scaleQuantize()
      .domain([0, 50])
      .range([
      "#67000d", "#a50f15", "#cb181d", "#ef3b2c", 
      "#fb6a4a", "#fc9272", "#fcbba1", "#fee0d2", "#fff5f0"
      ]);
  
      const path = d3.geoPath();

      // var zoomSettings= {
      //   duration: 1000,
      //   ease: d3.easeCubicOut,
      //   zoomLevel: 5
      // };
  
      // // Define zoom behavior
      // const zoom = d3.zoom()
      //   .scaleExtent([1, 8]) // Adjust scale extent as needed
      //   .on('zoom', zoomed);
  
      // // Apply zoom behavior to the SVG
      // svg.call(zoom);
  
      // // Zoom handler function for D3 v4
      // function zoomed() {
      //   // Use d3.event.transform instead of event.transform
      //   const transform = d3.event.transform;
        
      //   // Apply transform to all paths
      //   svg.selectAll('path')
      //     .attr('transform', `translate(${transform.x},${transform.y}) scale(${transform.k})`);
          
      //   // Apply transform to points if they exist
      //   svg.selectAll('circle')
      //     .attr('transform', `translate(${transform.x},${transform.y}) scale(${transform.k})`);
          
      //   // Apply transform to any other elements that need zooming
      //   svg.selectAll('text')
      //     .attr('transform', `translate(${transform.x},${transform.y}) scale(${transform.k})`);
      // }
  
      // Draw counties with color based on affordability index
      svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
          .attr("fill", d => {
            const value = valuemap.get(d.id);
            return value !== undefined ? color(value) : "grey"; // If no data, set color to grey
          })
          .attr("d", path)
          .attr("cursor","pointer")
          .on("mouseover", function(event, d) {
            const value = valuemap.get(d.id);
            if (value !== undefined) {
              d3.select("#tooltip")
                .style("opacity", 1)
                .html(`${d.properties.name}<br>Index: ${value.toFixed(2)}`)
                .style("left", (d3.event.pageX + 10) + "px")  // Use d3.event instead of event
                .style("top", (d3.event.pageY - 28) + "px");
            }
          })
          .on("mouseout", function() {
            d3.select("#tooltip").style("opacity", 0);
          })
          .append("title")
            .text(d => `${d.properties.name}\nHousing Affordability Index: ${valuemap.get(d.id)}`);
          
  
      // Draw state borders
      svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-linejoin", "round")
        .attr("d", path);
  
      // Add tooltip
      d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "120px")
        .style("padding", "4px")
        .style("font", "12px sans-serif")
        .style("background", "lightgray")
        .style("border", "0px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);
    
      // Add legend
      let legend_holder = d3.select(legend_selector)
      .append("svg")
      .attr("width", 800)  // Set a fixed width for the legend if needed
      .attr("height", 100)  // Set the height for the legend
      .style("position", "absolute")
      .style("left", "50%")  // Center horizontally
      .style("transform", "translateX(-50%)");  // Center the legend

        const legend = legend_holder.append("g");

        const legendScale = d3.scaleLinear()
            .domain([0, 50])  // Range of the affordability index
            .range([0, 600]); // Width of the legend

        // Create a color gradient for the affordability legend
        const colorGradient = legend.append("defs")
            .append("linearGradient")
            .attr("id", "colorGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        colorGradient.selectAll("stop")
            .data(color.range())
            .enter().append("stop")
            .attr("offset", (d, i) => `${(i / (color.range().length - 1)) * 100}%`)
            .attr("stop-color", d => d);

        // Draw the color gradient as a rectangle
        legend.append("rect")
            .attr("width", legendScale(50))  // Max value (50) in the affordability scale
            .attr("height", 20)
            .style("fill", "url(#colorGradient)");

        // Add labels for the legend
        legend.append("text")
            .attr("x", 45)
            .attr("y", 35)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Low Affordability");

        legend.append("text")
            .attr("x", 550)
            .attr("y", 35)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("High Affordability");

        // Add grey for counties with no data
        legend.append("rect")
            .attr("x", legendScale(50) + 10) // Offset from the main color scale
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", "grey");

        legend.append("text")
            .attr("x", legendScale(50) + 5)
            .attr("y", 35)
            .style("font-size", "12px")
            .text("No Data");
          
      // TODO

      svg.call(brush)
      selectableElements = svg.selectAll("path")
      function brush(g) {
          const brush = d3
            .brush() 
            .on("start brush", highlight) 
            .on("end", brushEnd) 
            .extent([
              [-margin.left, -margin.top],
              [width + margin.right, height + margin.bottom],
            ]);
    
          ourBrush = brush;
    
          g.call(brush); 
    
          
          function highlight() {
              if (d3.event.selection === null) return;
              const [
                [x0, y0],
                [x1, y1],
              ] = d3.event.selection;
              
             
              svg.selectAll("path").classed(
                "selected",
                (d) => {
                  return x0 <= X(d) &&
                  X(d) <= x1 &&
                  y0 <= Y(d) &&
                  Y(d) <= y1
                }
              );
      
            
              let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
      

              dispatcher.call(
                dispatchString,
                this,
                svg.selectAll(".selected").data()
              );
            }
          
            function brushEnd() {
              if (d3.event.sourceEvent.type != "end") {
                d3.select(this).call(brush.move, null);
              }
            }
          }
      
          function X(d) {
              let centroid = path.centroid(d);
              return centroid[0]
          }
      
          function Y(d) {
              let centroid = path.centroid(d);
              return centroid[1]
          }
  
    
    }
  
    map.margin = function (_) {
      if (!arguments.length) return margin;
      margin = _;
      return map;
    };
  
    map.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      return map;
    };
  
    map.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      return map;
    };
  
    // Gets or sets the dispatcher we use for selection events
    map.selectionDispatcher = function (_) {
      if (!arguments.length) return dispatcher;
      dispatcher = _;
      return map;
    };
  
    // Given selected data from another visualization 
    // select the relevant elements here (linking)
    map.updateSelection = function (selectedData) {
      if (!arguments.length) return;
  
      // Select an element if its datum was selected
      selectableElements.classed("selected", d => {
        return selectedData.includes(d)
      });
    };
  
    return map;
  }