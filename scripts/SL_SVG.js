function init(){

  var dataset, xScale, yScale, xAxis, yAxis, line, area;

  var margin = {top: 50, right: 350, bottom: 30, left: 200};
  var padding  = 55;

  var w = 1600 - margin.left - margin.right;
  var h = 600 - margin.top - margin.bottom;

  //define the position of x axis label (y)
  var xAxisTextY = h - 10;

  var rowConverter = function(d) {
    return {
      //convert string to date format
      date: d3.timeParse("%Y")(d.Year),
      //SL = Sea Level Change
      level: parseFloat(d.SL)
    };
  }


  //get data
  d3.csv("data/Sea_Level.csv", rowConverter).then(function(data){
    dataset = data;
    console.table(dataset,["date","level"]);
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
          .domain([d3.min(dataset, function(d) { return d.level; }), d3.max(dataset, function(d) { return d.level; })])
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

             .y1(function(d){ return yScale(d.level); });

    //Define line generator
    line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.level); })
        .curve(d3.curveMonotoneX);


    var svg = d3.select("#linechart1")
                .append("svg")
                  .attr("width", w + margin.left + margin.right)
                  .attr("height", h + margin.top + margin.bottom)
                .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    //variable to determine whether draw the line or not (to prevent drawing multiple line)
    var start = true;

    // Start Animation on Click
    // Source:http://duspviz.mit.edu/d3-workshop/examples/session3/line-chart-unrolling.html
    d3.select("#start").on("click", function() {
      if (start){
        //create line
        var path = svg.append("path")
          .datum(dataset)
          .attr("class", "line")
          .attr("d", line);

        // Variable to Hold Total Length
        var totalLength = path.node().getTotalLength();

        // Set Properties of Dash Array and Dash Offset and initiate Transition
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
         .transition() // Call Transition Method
          .duration(4000) // Set Duration timing (ms)
          .ease(d3.easeLinear) // Set Easing option
          .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition

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

          //change it back to false so it would not draw the line again if the user press the button again
          start = false;

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
                          .attr("y", yScale(selectedData.level)-15)
                          .style("opacity", 1)

            focus.attr("cx", xScale(selectedData.date))
              .attr("cy", yScale(selectedData.level))

            focusTextYear.html("Year:" + formatTime(selectedData.date))
              .attr("x", xScale(selectedData.date)+15)
              .attr("y", yScale(selectedData.level))

            focusTextTA.html("Sea level change: " + selectedData.level)
              .attr("x", xScale(selectedData.date)+15)
              .attr("y", yScale(selectedData.level)+20)
            }

          function mouseout() {
            focusTextYear.style("opacity", 0);
            focusTextTA.style("opacity", 0);
            focus.style("opacity", 0);
            focusbackground.style("opacity",0);
          }
      }
    });

    // Reset Animation
    d3.select("#reset").on("click", function() {
      if (!start){
          d3.select(".line").remove();
          start = true;
      }
    });


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
        .text("Cumulative sea level change (inches)");

    //y axis label
    svg.append("text")
        .attr("transform", "translate(" + w/2 + "," + xAxisTextY + ")")
        .style("font", "16px sans-serif")
        .text("Year");

  }

}

window.onload = init;
