
d3.text("https://cors-anywhere.herokuapp.com/https://www.ndbc.noaa.gov/data/realtime2/FTPC1.txt", function (error, text) {
  if (error) throw error;
  const parsedData = parseAllWindData(text);
  const displayData = createDisplayData(parsedData);
  console.log(displayData);

  let margin = { top: 10, right: 30, bottom: 48, left: 55 },
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  let svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
    
  // Axes

  let x = d3.scaleLinear()
    .domain([8, 19])
    .range([0, width])

  let xAxisCall = d3.axisBottom(x);
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxisCall)

  let y = d3.scaleLinear()
    .domain([0, 45])
    .range([height, 0])

  let yAxisCall = d3.axisLeft(y);
  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxisCall);

  // Data

  let allWindDataPoint = svg
    .selectAll("circle")
    .data(displayData.allWindData)
    .enter()
    .append("circle")
    .attr("cx", d => { return x(d.hourValue) })
    .attr("cy", d => { return y(d.value) })
    .attr("r", 2.5)
    .style("fill", "#636363")
    .style("opacity", 0)

  let currentDay = svg
    .append("g")
    .append("path")
      .datum(displayData.dayMinus0)
      .attr("d", d3.line()
        .x((d) => { return x(d.hourValue) })
        .y((d) => { return y(d.value) }))
      .attr("stroke", "#000000")
      .style("fill", "none")
      .style("stroke-width", 3)

  let currentAvg = svg
    .append("g")
    .append("path")
    .datum(displayData.avgDayMinus0)
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x((d) => { return x(d.hourValue) })
      .y((d) => { return y(d.value) }))
    .attr("stroke", "#DC2828")
    .style("fill", "none")
    .style("stroke-width", 2)
    .style("opacity", 0)

  let comparisonDay = svg
    .append("g")
    .append("path")
      .datum(displayData.dayMinus1)
      .attr("d", d3.line()
        .x((d) => { return x(d.hourValue) })
        .y((d) => { return y(d.value) }))
      .attr("stroke", "#4287f5")
      .style("fill", "none")
      .style("stroke-width", 3)
  
  let comparisonPoint = svg
    .selectAll("circle")
    .data(displayData.dayMinus1)
    .enter()
    .append("circle")
    .attr("cx", d => { return x(d.hourValue) })
    .attr("cy", d => { return y(d.value) })
    .attr("r", 4)
    .style("fill", "#4287f5")

  let comparisonAvg = svg
    .append("g")
    .append("path")
    .datum(displayData.avgDayMinus1)
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x((d) => { return x(d.hourValue) })
        .y((d) => { return y(d.value) }))
    .attr("stroke", "#4287f5")
    .style("fill", "none")
    .style("stroke-width", 2)
    .style("opacity", 0)

  // Axis labels

  const preTitle = "Comparison Day: "

  let graphTitle = svg.append("text")
    .attr("transform",
      "translate(" + (width / 2) + " ," +
      (5) + ")")
    .style("text-anchor", "middle")
    .text(`${preTitle} ${getDateString("Yesterday")}`);

  svg.append("text")
    .attr("transform",
      "translate(" + (width / 2) + " ," +
      (height + margin.top + 30) + ")")
    .style("text-anchor", "middle")
    .text("time of day (24h)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("speed in miles per hour (mph)");

  // Update display based on drop down

  function dropdownUpdate(selectedData) {
    
    const dataSetName = getDataSetName(selectedData);
    const dataFilter = displayData[dataSetName];

    comparisonDay
      .datum(dataFilter)
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .x(function (d) { return x(d.hourValue) })
        .y(function (d) { return y(d.value) })
      )
  
    comparisonPoint
      .data(dataFilter)
      .transition()
      .duration(1000)
        .attr("cx", d => { return x(d.hourValue) })
        .attr("cy", d => { return y(d.value) })


    const avgSetName = getAvgSetName(selectedData);
    const avgDataFilter = displayData[avgSetName];

    comparisonAvg
      .datum(avgDataFilter)
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { return x(d.hourValue) })
        .y(function (d) { return y(d.value) })
      )

    const dateString = getDateString(selectedData);

    graphTitle
      .text(`${preTitle} ${dateString}`)

  }

  // Drop down event handler

  d3.select("#selectButton").on("change", function(d) {
    let selectedOption = d3.select(this).property("value");
    dropdownUpdate(selectedOption);
  })

  
  
  function checkboxUpdate() {
    
    const checkboxDatasets = [currentDay, currentAvg, comparisonDay, comparisonAvg, allWindDataPoint];
    
    d3.selectAll(".checkbox").each(function(d) {
      let cb = d3.select(this);
      let idx = parseInt(cb.property("value"));
      
      switch (idx) {
        case 2: // comparisonDay AND its points          
          if (cb.property("checked")) {

            checkboxDatasets[idx]
              .transition()
              .duration(750)
              .style("opacity", 1)

            graphTitle
              .transition()
              .duration(750)
              .style("opacity", 1)
            
            svg.selectAll("circle")
              .transition()
              .duration(750)
              .style("opacity", 1)   

          } else {

            checkboxDatasets[idx]
              .transition()
              .duration(750)
              .style("opacity", 0)

            graphTitle
              .transition()
              .duration(750)
              .style("opacity", 0)

            svg.selectAll("circle")
              .transition()
              .duration(750)
              .style("opacity", 0)   
          }

          break;

        case 4:  // allWindData, rendered with lower transparency
          if (cb.property("checked")) {

            checkboxDatasets[idx]
              .transition()
              .duration(750)
              .style("opacity", .3)

          } else {

            checkboxDatasets[idx]
              .transition()
              .duration(750)
              .style("opacity", 0)
          }

          break;

        default:
          if (cb.property("checked")) {

            checkboxDatasets[idx]
              .transition()
              .duration(750)
              .style("opacity", 1)

          } else {

            checkboxDatasets[idx]
              .transition()
              .duration(750)
              .style("opacity", 0)
          }
      }
    })
  }

  d3.selectAll(".checkbox").on("change", checkboxUpdate);
  checkboxUpdate();


  function animateComparisonAvg(idx) {
    const dataSet = `avgDayMinus${5 - idx}`
    const currentDisplay = displayData[dataSet]

    comparisonAvg
      .datum(currentDisplay)
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { return x(d.hourValue) })
        .y(function (d) { return y(d.value) })
      )

    const displayName = getDisplayNameFromAvgSetName(dataSet);
    const dateString = getDateString(displayName);
    
    graphTitle
      .text(dateString)

  }

  d3.select("#animateButton").on("click", () => {
    let i = 0;
    let myInterval = setInterval(() => {
      animateComparisonAvg(i);
      i++
      if (i === 5)  {
        clearInterval(myInterval);
      }
    }, 1000);
  });


});
