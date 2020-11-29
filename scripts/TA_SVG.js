function init(){

  var dataset, xScale, yScale, xAxis, yAxis, line, area;

  var margin = {top: 50, right: 350, bottom: 30, left: 120};
  var padding  = 55;

  var w = 1600 - margin.left - margin.right;
  var h = 600 - margin.top - margin.bottom;

  //define the position of x axis label (y)
  var xAxisTextY = h - 10;

  //regions
  var regions = ["Global", "Northern Hemisphere", "Southern Hemisphere", "Tropics"]

  var rowConverter = function(d) {
    return {
      //convert string to date format
      date: d3.timeParse("%Y")(d.Year),
      //MTA = Median Temperature Anomaly
      ta: parseFloat(d.MTA)
    };
  }


  //get data
  d3.csv("data/Temperature_Anomaly_Global.csv", rowConverter).then(function(data){
    dataset = data;
    // console.table(dataset,["date","ta"]);
    lineChart(dataset);
  });

  function lineChart(){

    //define x scale
    xScale = d3.scaleTime()
         .domain([
          d3.min(dataset, function(d) { return d.date; }),
          d3.max(dataset, function(d) { return d.date; })
        ])
         .range([padding, w]);

    //define y scale
    yScale = d3.scaleLinear()
          .domain([d3.min(dataset, function(d) { return d.ta; }), d3.max(dataset, function(d) { return d.ta; })])
          .range([h - padding, 0]);

    //x-axis
    xAxis = d3.axisBottom()
           .scale(xScale)
           .ticks(6);

    //y-axis
    yAxis = d3.axisLeft()
           .scale(yScale)
           .ticks(10);

    area = d3.area()
             .x(function(d){ return xScale(d.date); })

             //base line for area shape
             .y0(function(){ return yScale.range()[0]; })

             .y1(function(d){ return yScale(d.ta); });

    //Define line generator
    line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.ta); })
        .curve(d3.curveMonotoneX);

    // add region to the selection list
    d3.select("#regions")
      .selectAll("myRegions")
     	.data(regions)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    var svg = d3.select("#linechart1")
                .append("svg")
                  .attr("width", w + margin.left + margin.right)
                  .attr("height", h + margin.top + margin.bottom)
                .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    //create line
    svg.append("path")
      .datum(dataset)
      .attr("class", "line")
      .attr("d", line);


    //create x-axis
    svg.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + (h - padding) + ")")
      .call(xAxis);

    //create y-axis
    svg.append("g")
      .attr("class", "yaxis")
      .attr("transform", "translate(" + (padding) + ",0)")
      .call(yAxis);

    //x axis label
    svg.append("text")
        .attr("transform", "translate(0," + h/1.5 + ") rotate(270)")
        .style("font", "16px sans-serif")
        .text(" Global Temperature Anomaly (℃)");

    //y axis label
    svg.append("text")
        .attr("transform", "translate(" + w/2 + "," + xAxisTextY + ")")
        .style("font", "16px sans-serif")
        .text("Year");

    //   This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function(d) { return d.date; }).right;

    var focusbackground = svg.append('rect')
      .style("fill", "#3399CC")
      .attr('width', 320)
      .attr('height', 50)
      .style("opacity", 0);

    // Create the circle that travels along the curve of chart
    var focus = svg.append('g')
      .append('circle')
        .style("fill", "skyblue")
        .attr("stroke", "black")
        .attr('r', 4)
        //to hide the circle when the user did not hover the chart
        .style("opacity", 0)

    // Create the text that travels along the curve of chart (Year)
    var focusTextYear = svg
      .append('g')
      .append('text')
        .style("opacity", 0)
        .style("fill","white")
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    // Create the text that travels along the curve of chart (Temperature Anomaly)
    var focusTextTA = svg
      .append('g')
      .append('text')
        .style("opacity", 0)
        .style("fill","white")
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    svg.append('rect')
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr('width', w)
      .attr('height', h)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout);

     // When another region is selected, run the update function
     d3.select("#regions").on("change", function(d) {
         // get the region
         var selectedOption = d3.select(this).property("value")
         // run the updateChart function with this selected option
         update(selectedOption)
     })

   // A function that update the chart
    function update(selectedGroup) {

      var data = "";

      //get the dataset
      switch(selectedGroup){
        case "Global":
          data = "data/Temperature_Anomaly_Global.csv";
          break;

        case "Northern Hemisphere":
          data = "data/Temperature_Anomaly_NH.csv";
          break;

        case "Southern Hemisphere":
          data = "data/SH.csv"; //if i change the name to "Temperature_Anomaly_SH.csv", it gives me an error....
          break;

        case "Tropics":
          data = "data/Temperature_Anomaly_Tropics.csv";
          break;
      }

      d3.csv(data, rowConverter).then(function(data){

        dataset = data;

        //redefine x scale
        xScale = d3.scaleTime()
             .domain([
              d3.min(dataset, function(d) { return d.date; }),
              d3.max(dataset, function(d) { return d.date; })
            ])
             .range([padding, w]);

        //redefine y scale
        yScale = d3.scaleLinear()
              .domain([d3.min(dataset, function(d) { return d.ta; }), d3.max(dataset, function(d) { return d.ta; })])
              .range([h - padding, 0]);

        //x-axis
        xAxis = d3.axisBottom()
               .scale(xScale)
               .ticks(6);

        //y-axis
        yAxis = d3.axisLeft()
               .scale(yScale)
               .ticks(10);

        var svg = d3.select("body").transition();

       // Change the line
       svg.select(".line")
           .duration(1000)
           .attr("d", line(data));

       // Change the x axis (although the years in all datasets are the same, just in case )
       svg.select(".xaxis")
           .duration(1000)
           .call(xAxis);

       //change the y axis
       svg.select(".yaxis")
           .duration(1000)
           .call(yAxis);
      });

    }

   // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
      focusTextYear.style("opacity",1);
      focusTextTA.style("opacity",1);
      focus.style("opacity", 1);
      focusbackground.style("opacity",1);
    }

    function mousemove() {
      // recover coordinate we need
      var x0 = xScale.invert(d3.mouse(this)[0]);
      var i = bisect(dataset, x0);
      selectedData = dataset[i]

      //convert date back to string
      var formatTime = d3.timeFormat("%Y");

      focusbackground.attr("x", xScale(selectedData.date)+15)
                    .attr("y", yScale(selectedData.ta)-15)
                    .style("opacity", 1)

      focus.attr("cx", xScale(selectedData.date))
        .attr("cy", yScale(selectedData.ta))

      focusTextYear.html("Year:" + formatTime(selectedData.date))
        .attr("x", xScale(selectedData.date)+15)
        .attr("y", yScale(selectedData.ta))

      focusTextTA.html("Tempeature Anomaly: " + selectedData.ta + "℃")
        .attr("x", xScale(selectedData.date)+15)
        .attr("y", yScale(selectedData.ta)+20)
      }

    function mouseout() {
      focusTextYear.style("opacity", 0);
      focusTextTA.style("opacity", 0);
      focus.style("opacity", 0);
      focusbackground.style("opacity",0);
    }

  }

}

window.onload = init;
