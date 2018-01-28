/**
 * Things to add
 *   1. repeating map
 *   2. max scroll limits
 *   3. Sort the draw order out of the circles
 */

var width = 960,
  height = 480;

var quantile = d3.scale.quantile()
  .range(d3.range(5).map(function(i) {
    //console.log("Quantile " + i);
    return 5 + (i * 2);
  }));

var classQuantile = d3.scale.quantile()
  .range(d3.range(5).map(function(i) {
    return "Q" + i;
  }));

var projection = d3.geo.winkel3()
  .scale(1000)
  .translate([width / 2, height / 2])
  .center([0, 50]);

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

var path = d3.geo.path().projection(projection);

var g = svg.append("g");

d3.json("https://raw.githubusercontent.com/jiminyhall/maps/master/world.json", function(error, world) {

  g.selectAll("path")
    .data(topojson.feature(world, world.objects.subunits).features)
    .enter()
    .append("path")
    .attr("d", path)
    /*
    .on("mouseover", function() {
      d3.select(this).transition().style("fill", "red");
    })
    .on("mouseout", function() {
      d3.select(this).transition().duration(1000).style("fill", "black");
    })*/;
});

// load in meteors
d3.json("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json", function(error, meteors) {
  var count = 1;
  //console.log(meteors);



  quantile.domain(meteors.features.map( function(d) {

    var val = parseInt(d.properties.mass);
    if(val>0) {
      //console.log("Quantile domain: " + val);
      return val;
    }
  }));

  classQuantile.domain(meteors.features.map( function(d) {
    var val = parseInt(d.properties.mass);
    if(val>0) { return val; }
  }));

  g.selectAll("circle")
    .data(meteors.features)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
      if (d.geometry !== null)
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
    })
    .attr("cy", function(d) {
      if (d.geometry !== null)
        return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
    })
    .attr("r", function(d) {
      var r = quantile(d.properties.mass);
      //console.log("Mass: " + d.properties.mass + " = " + r);
      //console.log(r);
      return r;
    })
    .attr("class", function(d) { return classQuantile(d.properties.mass); })
    .on("mouseout", function(d) {
      document.getElementById("info").style.display="none";
    })
    .on("mouseover", function(d) {
      console.log(d.properties.name);
      var str = "<table>" +
                "<tr><td><strong>ID:</strong></td><td>"+ d.properties.id + "</td>" +
                "<tr><td><strong>Year:</strong></td><td>" + d.properties.year.substr(0,4) + "</td>" +
                "<tr><td><strong>Name:</strong></td><td>" + d.properties.name + "</td>" +
                "<tr><td><strong>Mass:</strong></td><td>" + d.properties.mass + "</td>" +
                "<tr><td><strong>Recclass:</strong></td><td>" + d.properties.recclass + "</td>" +
                "</table>";

      document.getElementById("info").innerHTML = str;
      document.getElementById("info").style.display="inline";
  /*

  "mass": "1000",
"name": "Aioun el Atrouss",
"reclong": "-9.570280",
"geolocation_address": null,
"geolocation_zip": null,
"year": "1974-01-01T00:00:00.000",
"geolocation_state": null,
"fall": "Fell",
"id": "423",
"recclass": "Diogenite-pm",
"reclat": "16.398060",
"geolocation_city": null,
"nametype": "Valid"

  */

  });

});

// zoom and pan
var zoom = d3.behavior.zoom()
  .on("zoom", function() {
    g.attr("transform", "translate(" +
      d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
    g.selectAll("g")
      .attr("d", path.projection(projection));
    g.selectAll("path")
      .attr("d", path.projection(projection));

  });

svg.call(zoom);
