/* global D3 */

// Initialize a line chart. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/

// Some code snippets generated or inspired by ChatGPT

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
    valuemap = null,
    color = null,
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
    valuemap = new Map(affordability.map(d => [d.FIPS, +d.HousingAffordabilityIndex]));

    color = d3.scaleQuantize()
      .domain([0, 50])
      .range([
        "#67000d", "#a50f15", "#cb181d", "#ef3b2c",
        "#fb6a4a", "#fc9272", "#fcbba1", "#fee0d2", "#fff5f0"
      ]);

    const path = d3.geoPath();

    var zoomSettings = {
      duration: 1000,
      ease: d3.easeCubicOut,
      zoomLevel: 5
    };

    // Define zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8]) // Adjust scale extent as needed
      .translateExtent([[0, 0], [width + 800, height + 200]])
      .filter(function () {
        if (event.button === 1)
          d3.event.preventDefault();
        return (
          event.type === "wheel" ||
          event.button === 1)
      })
      .on('zoom', zoomed);

    // Apply zoom behavior to the SVG
    svg.call(zoom);

    // Zoom handler function
    function zoomed() {
      const transform = d3.event.transform;

      // Apply transform to all paths
      svg.selectAll('path')
        .attr('transform', `translate(${transform.x},${transform.y}) scale(${transform.k})`);
    }

    var isMouseDown = false;

    d3.select(selector).on('mouseup', function (event, d) {
      if (d3.event.button === 0) {
        isMouseDown = false;
      }
    }).on('mousedown', function (event, d) {
      if (d3.event.button === 0) {
        console.log(this)
        if (!isMouseDown) {
          svg.selectAll("path").classed("selected", false)
            .classed("mouseover", false)
            .classed("has-data", d => valuemap.get(d.id) !== undefined)
            .style("fill", d => {
              const value = valuemap.get(d.id);
              return value !== undefined ? color(value) : "grey";
            });
          let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
          dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
        }
      }
    });

    let counties = svg.append("g")
      .selectAll("path");
    counties.data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
      .attr("class", "county") // Apply a base class
      .classed("has-data", d => valuemap.get(d.id) !== undefined)
      .attr("d", path)
      .attr("cursor", "pointer")
      .style("fill", d => {
        const value = valuemap.get(d.id);
        return value !== undefined ? color(value) : "grey"; // Default color
      })
      .on('mouseup', function (event, d) {
        if (d3.event.button === 0) {
          isMouseDown = false;
        }
      })
      .on('mousedown', function (event, d) {
        if (d3.event.button === 0) {
          console.log(this)
          if (!isMouseDown) { // clear selection
            svg.selectAll("path").classed("selected", false)
              .classed("mouseover", false)
              .classed("has-data", d => valuemap.get(d.id) !== undefined)
              .style("fill", d => {
                const value = valuemap.get(d.id);
                return value !== undefined ? color(value) : "grey";
              });
          }
          isMouseDown = true;
          d3.select(this).classed('selected', true) // apply selection
            .style("fill", "yellow")
            .style("stroke", "#fff");
          let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
          dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
        }
      })
      .on("mouseover", function (event, d) {
        d3.select(this).classed('mouseover', true);
        if (isMouseDown) {  // apply selection
          d3.select(this).classed('selected', true)
            .style("fill", "yellow")
            .style("stroke", "#fff");
          let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
          dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
        }

        const value = valuemap.get(d.id);
        if (value !== undefined) {
          const data = affordability.find(entry => entry.FIPS === d.id);
          if (data) {
            // Construct tooltip content
            const tooltipContent = `
                    <strong>${data.CountyName || "Unknown County"}</strong><br>
                    FIPS: ${data.FIPS}<br>
                    Housing Affordability Index: ${value.toFixed(2)}<br>
                    Median Home Price: $${data.MedianHomePrice.toLocaleString()}<br>
                    Median Income: $${data.MedianIncome.toLocaleString()}<br>
                    Population: ${data.Population.toLocaleString()}
                `;
            d3.select("#tooltip")
              .style("opacity", 1)
              .html(tooltipContent)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          }
        }
      })
      .on("mouseout", function () {
        d3.select(this).classed("mouseover", false);
        d3.select("#tooltip").style("opacity", 0);
      })
      .append("title")
      .text(d => {
        const value = valuemap.get(d.id);
        if (value !== undefined) {
          const data = affordability.find(entry => entry.FIPS === d.id);
          if (data) {
            // Format the title with new fields
            return `
                    ${data.CountyName || "Unknown County"}
                    Housing Affordability Index: ${value.toFixed(2)}
                    Median Home Price: $${data.MedianHomePrice.toLocaleString()}
                    Median Income: $${data.MedianIncome.toLocaleString()}
                    Population: ${data.Population.toLocaleString()}
                `;
          }
        }
        return "No Data";
      });

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
      .attr("width", 800)
      .attr("height", 100)
      .style("position", "absolute")
      .style("left", "50%")
      .style("transform", "translateX(-50%)");

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
      .attr("x", legendScale(50) + 10)
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", "grey");

    legend.append("text")
      .attr("x", legendScale(50) + 5)
      .attr("y", 35)
      .style("font-size", "12px")
      .text("No Data");

    selectableElements = svg.selectAll(".county");

    return map;
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
    const selectedFIPs = selectedData.map(d => d.FIPS);
    console.log(selectedFIPs)
    console.log(selectableElements)
    // Select an element if its datum was selected
    selectableElements.classed("selected", d => {
      return selectedFIPs.includes(d.id);
    });

    selectableElements.style("fill", d => {
      if (selectedFIPs.includes(d.id)) {
        return "yellow";
      } else {
        const value = valuemap.get(d.id);
        return value !== undefined ? color(value) : "grey"; // Default color
      }
    })
  };

  return map;
}