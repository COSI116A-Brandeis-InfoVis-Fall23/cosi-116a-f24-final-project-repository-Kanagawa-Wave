(() => {
  // map, code generated by ChatGPT with a few changes
  // Load CSV and GeoJSON using D3 v4
    d3.queue()
    .defer(d3.csv, "data/final_housing_data_with_population_income_affordability.csv")
    .defer(d3.json, "data/counties-albers-10m.json")
    .await(ready);

  function ready(error, affordability, us) {
    if (error) throw error;

    // Map FIPS codes to Housing Affordability Index
    const valuemap = new Map(affordability.map(d => [d.FIPS, +d.HousingAffordabilityIndex]));

    console.log(valuemap);

    const color = d3.scaleQuantize()
    .domain([0, 50])
    .range([
      "#67000d", "#a50f15", "#cb181d", "#ef3b2c", 
      "#fb6a4a", "#fc9272", "#fcbba1", "#fee0d2", "#fff5f0"
    ]);

    // Select the placeholder element
    const mapHolder = d3.select("#map");

    // SVG setup
    var mapWidth = 975;
    var mapHeight = 610;
    const svg = mapHolder.append("svg")
      .attr("width", mapWidth)
      .attr("height", mapHeight)
      .attr("viewBox", "0 0 975 610")
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Path generator
    const path = d3.geoPath();

    var zoomSettings= {
      duration: 1000,
      ease: d3.easeCubicOut,
      zoomLevel: 5
    };

    var centered = null;
    function clicked(d){
      var x;
      var y;
      var zoomLevel;
      if ( d && centered !== d){
        var centroid = path.centroid(d)
        x = centroid[0];
        y = centroid[1];
        zoomLevel = zoomSettings.zoomLevel;
        centered = d;
        }else{
          x  =mapWidth/2;
          y = mapHeight/2;
          zoomLevel = 1;
          centered = null;
        }
    }

    svg.transition().duration(zoomSettings.duration).ease(zoomSettings.ease).attr('transform','translate('+mapWidth/2+','+mapHeight/2+')scale('+zoomLevel+')translate('+-x+','+-y+')');

    // Draw counties with color based on affordability index
    svg.append("g")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
        .attr("fill", d => color(valuemap.get(d.id)))
        .attr("d", path)
        .attr("cursor","pointer")
        .on("mouseover", function(event, d) {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(`${d.properties.name}<br>Index: ${valuemap.get(d.id)}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("click",clicked)
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
  }

  // scatterplot
  const numPoints = 100;
  const xMax = 100, yMax = 100;
  const categories = ["Urban", "Suburban", "Rural"]; 
  const colors = ["red", "blue", "green"]; 
  const shapes = ["circle", "triangle", "square"]; 
  let data = [];

  for (let i = 0; i < numPoints; i++) {
    data.push({
      x: Math.random() * xMax,
      y: Math.random() * yMax,
      category: categories[Math.floor(Math.random() * categories.length)]
    });
  }

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

  let points = scatterplot.selectAll(".data-point")
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
    .attr("fill", d => colors[categories.indexOf(d.category)])
    // hover 
    .on("mouseover", function (event, d) {
      d3.select(this)
        .attr("fill", "orange") 
        //.attr("stroke", "black") 
        //.attr("stroke-width", 2);

      // tooltip
      scatterplot.append("text")
        .attr("id", "tooltip")
        .attr("x", xScale(d.x) + 10)
        .attr("y", yScale(d.y) - 10)
        .text(`(${d.x.toFixed(1)}, ${d.y.toFixed(1)})`)
        .style("font-size", "12px")
        .style("background-color", "white");
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .attr("fill", d => colors[categories.indexOf(d.category)]) 
        .attr("stroke", null); 

      d3.select("#tooltip").remove();
    });

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


  let selectionBox;
  let startPoint;

  scatterplot.on("mousedown", (event) => {
    startPoint = d3.pointer(event);
    selectionBox = scatterplot.append("rect")
      .attr("x", startPoint[0])
      .attr("y", startPoint[1])
      .attr("width", 0)
      .attr("height", 0)
      .style("fill", "rgba(0, 0, 255, 0.2)")
      .style("stroke", "blue");
  });

  scatterplot.on("mousemove", (event) => {
    if (!startPoint) return;

    const currentPoint = d3.pointer(event);
    const x = Math.min(startPoint[0], currentPoint[0]);
    const y = Math.min(startPoint[1], currentPoint[1]);
    const width = Math.abs(currentPoint[0] - startPoint[0]);
    const height = Math.abs(currentPoint[1] - startPoint[1]);

    selectionBox.attr("x", x).attr("y", y).attr("width", width).attr("height", height);
  });

  scatterplot.on("mouseup", () => {
    if (!startPoint) return;

    const selectionBounds = selectionBox.node().getBoundingClientRect();
    points.attr("fill", (d) => {
      const [cx, cy] = [xScale(d.x), yScale(d.y)];
      if (
        cx >= selectionBounds.left - margin.left &&
        cx <= selectionBounds.right - margin.left &&
        cy >= selectionBounds.top - margin.top &&
        cy <= selectionBounds.bottom - margin.top
      ) {
        return "yellow"; // Highlight
      } else {
        return colors[categories.indexOf(d.category)];
      }
    });

    selectionBox.remove();
    selectionBox = null;
    startPoint = null;
  });
})();
