(() => {
  // Some code snippets generated or inspired by ChatGPT
  // Load CSV and GeoJSON using D3 v4

  // dataset format:
  // CountyName,MedianHomePrice,FIPS,Population,MedianIncome,HousingAffordabilityIndex
  // "Nantucket County, Massachusetts",1705210,25019,13795,116571,6.836166806434398
  // "San Mateo County, California",1701860,6081,762488,136837,8.040438108892625
  // "Santa Clara County, California",1664410,6085,1932022,140258,8.426890009072284

  d3.queue()
    .defer(d3.csv, "data/final_dataset.csv")
    .defer(d3.json, "data/counties-albers-10m.json")
    .await(ready);

  function ready(error, affordability, us) {
    if (error) throw error;

    affordability.forEach(d => {
      d.FIPS = String(d.FIPS).padStart(5, '0'); // Pad with leading zeros if necessary
      d.HousingAffordabilityIndex = +d.HousingAffordabilityIndex; // Ensure the value is a number
    });

    const dispatchString = "selectionUpdated";

    let map = usmap()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#map", "#map-legend", affordability, us);

    let scatter = scatterplot()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#scatterplot", affordability);


    map.selectionDispatcher().on(dispatchString, function (selectedData) {
      scatter.updateSelection(selectedData);
    });
    scatter.selectionDispatcher().on(dispatchString, function (selectedData) {
      map.updateSelection(selectedData);
    });
  }

})();
