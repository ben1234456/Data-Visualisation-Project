function init(){
    var w = 550;
    var h = 350;

    var outerRadius = 150;
    var innerRadius = 0;

    var arc = d3.arc()
                .outerRadius(outerRadius)
                .innerRadius(innerRadius);

    var arcLabel = d3.arc()
                    .outerRadius(outerRadius + 70)
                    .innerRadius(innerRadius - 20);

    var pie = d3.pie()
                .value(function(d) { return d.Percentage; });

    var svg = d3.select("#piechart")
                .append("svg")
                .attr("width",w)
                .attr("height",h);


    var color = d3.scaleOrdinal(d3.schemeTableau10);

    //load data
    d3.csv("data/Greenhouse_Gases_Sources.csv").then(function(data){

        console.log(data);

        var arcs = svg.selectAll("g.arc")
                      .data(pie(data))
                      .enter()
                      .append("g")
                      .attr("class","arc")
                      .attr("transform", "translate(" + 150 + "," + 150 + ")");

        var legend = svg.selectAll("g.arc")
                      .data(pie(data))
                      .enter()
                      .append("g")
                      .attr("class","legend");

        arcs.append("path")
            .attr("fill", function(d){
              return color(d.data.Source);
            })
            .attr("d", arc)
            .attr("stroke", "white")
            .style("stroke-width", "3px")
            .on("mouseover",function(){
              d3.select(this)
                .style("opacity",0.8)
            })
            .on("mouseout",function(){
              d3.select(this)
                .style("opacity",1)
            });

        // value (percentage)
        arcs.append("text")
            .attr("transform", function(d){
            return "translate(" + arc.centroid(d) + ")";
            })
            .text(function(d){
              return (d.data.Percentage + "%");
            })
            .style("font-size",16)
            .style("text-anchor", "middle")
            .style("font-family","Calibri, sans-serif");

        //legend rectangle
        arcs.append('rect')
          .attr('x', w - 350)
          .attr('y', function(d, i){ return -100 + (i *  20);})
          .attr('width', 10)
          .attr('height', 10)
          .style('fill', function(d) {
            return color(d.data.Source);
          });

        //legend text
        arcs.append('text')
          .attr('x', w - 335)
          .attr('y', function(d, i){ return -90 + (i *  20);})
          .text(function(d){
            return (d.data.Source);
          })
          .style("font-size",13)
          .style("font-family","Calibri, sans-serif");
    });

}



window.onload = init;
