function init(){

  var dataset, xScale, yScale, xAxis, yAxis, line, area;

  var margin = {top: 50, right: 265, bottom: 60, left: 200};
  var padding  = 55;

  var width = 1600 - margin.left - margin.right;
  var height = 650 - margin.top - margin.bottom;

  var svg = d3.select("svg");
  var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //define the position of x axis label (y)
  var xAxisTextY = height + 50;

  var color = d3.scaleOrdinal(d3.schemeSet1);


var svg = d3.select("#linechart1")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
d3.csv("data/Greenhouse_Gases_Emission.csv", function(data) {

  var subgroups = data.columns.slice(1)

  //get the years
  var groups = d3.map(data, function(d){return(d.Year)}).keys()

  // Define X axis
  var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.5])

  // Define Y axis
  var y = d3.scaleLinear()
     .domain([0, 50000])
     .range([ height, 0 ]);

  //define tooltip
   var tip = d3.select(".d3-tooltip")
   .style("visibility", "hidden") ;

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)
    (data)

  // Prep the tooltip bits, initial display is hidden
  var tooltip = d3.select("svg")
    .append("g")
    .attr("class", "tooltip")
    .style("display", "none");

  tooltip.append("rect")
    .attr("width", 200)
    .attr("height", 20)
    .attr("fill", "black")
    .style("opacity", 0.7);

  tooltip.append("text")
    .attr("x", 100)
    .attr("dy", "1.2em")
    .attr("fill", "white")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");

  //add the x axis
  svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  //add the y axis
  svg.append("g")
    .attr("class", "yaxis")
    .call(d3.axisLeft(y));

  //x axis label
  svg.append("text")
      .attr("transform", "translate(-100," + height/1.5 + ") rotate(270)")
      .style("font", "16px sans-serif")
      .text("Emissions (million metric tons ");

  //x axis label 2
  svg.append("text")
      .attr("transform", "translate(-80," + height/1.5 + ") rotate(270)")
      .style("font", "16px sans-serif")
      .text("of carbon dioxide equivalents)");

  //y axis label
  svg.append("text")
      .attr("transform", "translate(" + width/2 + "," + xAxisTextY + ")")
      .style("font", "16px sans-serif")
      .text("Year");

  // Show the bars
  svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
      .attr("fill", function(d) { return color(d.key); })
      .attr("class", function(d){ return "myRect " + d.key }) // Add a class to each subgroup: their name
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.Year); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .attr("stroke", "grey")
      .on("mouseover", function(d){
        tooltip.style("display", null);
      })
      .on("mouseleave", function(d){
        d3.select(this)
          .style("opacity",1)

        tooltip.style("display", "none");
      })
      .on("mousemove", function(d){
        d3.select(this)
          .style("opacity",0.8)
        var xPosition = d3.mouse(this)[0] - 5;
        var yPosition = d3.mouse(this)[1] - 5;
        var num = d[1] - d[0];
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.select("text").text( d3.select(this.parentNode).datum().key + ": " + num);
      })

  //add legend
  var legend = svg.selectAll(".legend")
                  .data(data.columns.slice(1))
                  .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
                    .style("font", "10px sans-serif");

  //legend rectangle
  legend.append("rect")
      .data(stackedData)
      .attr("x", width - 25)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", function(d) { return color(d.key); });

  //legend text
  legend.append("text")
      .attr("x", width)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("font", "16px sans-serif")
      .text(function(d) { return d; });

})



}

window.onload = init;
