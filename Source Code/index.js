// Tab Content
function openTab(evt, tabName) {
  var i, tabcontent, dropbtn;
  var binCategoricalAttrs = ["Region",
                  "Population_Density_Categories",
                  "Income_Inequality_Categories",
                  "Employment_Rate_Categories",
                  "Corruption_Perception_Categories"];

  tabcontent = document.getElementsByClassName("tabcontent");

  for (i = 0; i < tabcontent.length; i++)
    tabcontent[i].style.display = "none";

  dropbtn = document.getElementsByClassName("dropbtn");
  for (i = 0; i < dropbtn.length; i++) {
    dropbtn[i].className = dropbtn[i].className.replace(" active", "");
  }

  if(tabName=="home"
  | tabName=="Health_Expenditure"
  | binCategoricalAttrs.includes(tabName)) {
    document.getElementById(tabName).style.display = "block";
  } else
    document.getElementById("Common").style.display = "block";

  if(evt.currentTarget.className=="dropbtn") {
    evt.currentTarget.className += " active";
  } else {
    // Change this (Get child "dropbtn" and make it active)
    evt.currentTarget.parentNode.parentNode.className += " active";
  }

  d3.selectAll("svg").remove();
  d3.selectAll("#date-dropdown-selector").remove();

  if(tabName=="home")
    drawMap();
  else if(tabName=="Health_Expenditure")
    drawGroupedBarGraph();
  else if(binCategoricalAttrs.includes(tabName))
    drawBarGraph(tabName);
  else
     drawHistogram(tabName);
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

// Top Nav - Responsive
function responsiveTopnav() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}



// Bar Graph

function drawBarGraph(tabName) {

  var margin = 0, x = 0, y = 0, xAxis = 0, yAxis = 0, svg = 0;
  var margin_bottom = 0;
  var text_top = 0;

  if(tabName=="Region") {
    margin_bottom = 150;
    text_top = 110;
  } else {
    margin_bottom = 100;
    text_top = 40;
  }

var elements = ["2010-2019",
                "2000-2009",
                "1990-1999",
                "1980-1989",
                "1970-1979",
                "1960-1969",
                "1950-1959"];

var filtered_data = 0;


function getFilteredData(selection, data) {
  var dates = selection.split("-");
  var start_date = parseInt(dates[0]);
  var end_date = parseInt(dates[1]);
  data = data.filter(function(d){ return (d.Date >= start_date & d.Date <= end_date)});

  filtered_data = d3.nest()
    .key(function(d) { return d[tabName]; })
    .rollup(function(v) { return v.length; })
    .entries(data);

    filtered_data.forEach(function(d) {
          d.key = d.key;
          d.values = +(d.values/2);
      });

    filtered_data.sort(function (a,b) {return d3.ascending(a.key, b.key);});

    return filtered_data;
}

function createElements() {
  margin = {top: 30, right: 10, bottom: margin_bottom, left: 450},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

  y = d3.scale.linear().range([height, 0]);

  xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

  svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  x.domain(filtered_data.map(function(d) { return d.key; }));
  y.domain([0, d3.max(filtered_data, function(d) { return d.values; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + text_top) + ")")
      .style("text-anchor", "middle")
      .text(tabName);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

      svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 400 - margin.left)
           .attr("x",0 - (height / 2))
           .attr("dy", ".71em")
           .style("text-anchor", "middle")
           .text("Number of Countries");

  svg.selectAll("bar")
      .data(filtered_data)
    .enter().append("rect")
      .style("fill", "steelblue")
      .on("mouseover", onMouseOver)
      .on("mouseout", onMouseOut)
      .attr("x", function(d) { return x(d.key); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.values); })
      .attr("height", function(d) { return height - y(d.values); });
}

d3.csv("data/Final_Dataset.csv", function(error, data) {

  var selection = elements[0]
  filtered_data = getFilteredData(elements[0], data)
  createElements();

  var selector = d3.select(".date-dropdown")
    	.append("select")
    	.attr("id","date-dropdown-selector")
    	.on("change", function(d){
        	selection = document.getElementById("date-dropdown-selector");
          filtered_data = getFilteredData(selection.value, data)
          d3.selectAll("rect").remove();
          d3.selectAll("text").remove();
          d3.selectAll("svg").remove();
          createElements();
      y.domain([0, d3.max(filtered_data, function(d){
				return +d.values;})]);

        	yAxis.scale(y);

        	d3.selectAll("bar")
           		.transition()
	            .attr("height", function(d){
					return height - y(+d.values);
				})
				.attr("x", function(d, i){
					return x(d.key) ;
				})
				.attr("y", function(d){
					return y(d.values);
				})
           		.ease("linear")
           		.select("title")
           		.text(function(d){
           			return d.key + " : " + d.values;
           		});

           	d3.selectAll("g.y.axis")
           		.transition()
           		.call(yAxis);

         });

    selector.selectAll("option")
      .data(elements)
      .enter().append("option")
      .attr("value", function(d){
        return d;
      })
      .text(function(d){
        return d;
      })
});

//mouseover event handler function
function onMouseOver(d, i) {
    // d3.select(this).attr("fill", "orange");
    d3.select(this)
      .transition()     // adds animation
      .duration(400)
      .attr('width', x.rangeBand() + 5)
      .attr("y", function(d) { return y(d.values) - 10; })
      .attr("height", function(d) { return height - y(d.values) + 10; });

    svg.append("text")
     .attr('class', 'val')
     .attr('x', function() {
         return x(d.key);
     })
     .attr('y', function() {
         return y(d.values) - 15;
     })
     .text(function() {
         return [d.values];  // Value of the text
     });
}

//mouseout event handler function
function onMouseOut(d, i) {
    // use the text label class to remove label on mouseout
    // d3.select(this).attr("fill", "steelblue");
    d3.select(this)
      .transition()     // adds animation
      .duration(200)
      .attr('width', x.rangeBand())
      .attr("y", function(d) { return y(d.values); })
      .attr("height", function(d) { return height - y(d.values); });

    d3.selectAll('.val')
      .remove()
}
}





// Grouped Bar Graph

function drawGroupedBarGraph() {

var margin = 0, x = 0, y = 0, xAxis = 0, yAxis = 0, svg = 0;
var govt = 0, pvt = 0, indv = 0;
var filtered_data = 0;

function getIndvData(data) {
  govt = d3.nest()
    .key(function(d) { return d.Health_Expenditure_Govt_Categories; })
    .rollup(function(v) { return v.length; })
    .entries(data.filter(function(d){ return (d.Health_Expenditure_Govt_Categories != "0%-10%")}));

  govt.forEach(function(d) {
        d.key = d.key;
        d.values = +(d.values/2);
    });

  govt = govt.sort(function (a,b) {return d3.ascending(a.key, b.key);});

  pvt = d3.nest()
    .key(function(d) { return d.Health_Expenditure_Pvt_Categories; })
    .rollup(function(v) { return v.length; })
    .entries(data.filter(function(d){ return (d.Health_Expenditure_Pvt_Categories != "0%-10%")}));

  pvt.forEach(function(d) {
        d.key = d.key;
        d.values = +(d.values/2);
    });

    pvt = pvt.sort(function (a,b) {return d3.ascending(a.key, b.key);});


  indv = d3.nest()
    .key(function(d) { return d.Health_Expenditure_Indv_Categories; })
    .rollup(function(v) { return v.length; })
    .entries(data.filter(function(d){ return (d.Health_Expenditure_Indv_Categories != "0%-10%")}));

    indv.forEach(function(d) {
          d.key = d.key;
          d.values = +(d.values/2);
      });

    indv = indv.sort(function (a,b) {return d3.ascending(a.key, b.key);});
}

function getFilteredData(value) {
  if(value=="Health_Expenditure_Govt_Categories")
    filtered_data = govt;
  else if(value=="Health_Expenditure_Pvt_Categories")
    filtered_data = pvt;
  else
    filtered_data = indv;

    return filtered_data;
}

function createElements() {

  margin = {top: 30, right: 10, bottom: 120, left: 100},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

  y = d3.scale.linear().range([height, 0]);

  xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

  svg = d3.select(".chart-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  x.domain(filtered_data.map(function(d) { return d.key; }));
  y.domain([0, d3.max(filtered_data, function(d) { return d.values; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + 40) + ")")
      .style("text-anchor", "middle")
      .text("Health Expenditure");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

      svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", margin.left - 150)
           .attr("x",0 - (height / 2))
           .attr("dy", ".71em")
           .style("text-anchor", "middle")
           .text("Number of Countries");

  svg.selectAll("bar")
      .data(filtered_data)
    .enter().append("rect")
      .style("fill", "steelblue")
      .on("mouseover", onMouseOver)
      .on("mouseout", onMouseOut)
      .attr("x", function(d) { return x(d.key); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.values); })
      .attr("height", function(d) { return height - y(d.values); });
}

d3.csv("data/Final_Dataset.csv", function(error, data) {

  getIndvData(data);
  filtered_data = getFilteredData("Health_Expenditure_Govt_Categories");
  createElements();

  d3.selectAll(("input[name='market']")).on("change", function() {
    filtered_data = getFilteredData(this.value);
    d3.selectAll("rect").remove();
    d3.selectAll("text").remove();
    d3.selectAll("svg").remove();
    createElements();
          });
});

//mouseover event handler function
function onMouseOver(d, i) {
    // d3.select(this).attr("fill", "orange");
    d3.select(this)
      .transition()     // adds animation
      .duration(400)
      .attr('width', x.rangeBand() + 5)
      .attr("y", function(d) { return y(d.values) - 10; })
      .attr("height", function(d) { return height - y(d.values) + 10; });

    svg.append("text")
     .attr('class', 'val')
     .attr('x', function() {
         return x(d.key);
     })
     .attr('y', function() {
         return y(d.values) - 15;
     })
     .text(function() {
         return [d.values];  // Value of the text
     });
}

//mouseout event handler function
function onMouseOut(d, i) {
    // use the text label class to remove label on mouseout
    // d3.select(this).attr("fill", "steelblue");
    d3.select(this)
      .transition()     // adds animation
      .duration(200)
      .attr('width', x.rangeBand())
      .attr("y", function(d) { return y(d.values); })
      .attr("height", function(d) { return height - y(d.values); });

    d3.selectAll('.val')
      .remove()
}
}


// Histogram
function drawHistogram(tabName) {
  var margin = { top: 80, right: 180, bottom: 80, left: 250 },
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  var new_data = 0;

  d3.csv("data/Final_Dataset.csv", function (error, data) {

      // Filter data
      data = data.filter(function(d){ return (d.Date >= 2000 & d.Date <= 2019 & d[tabName]!="")});

      if(tabName=="Suicides" | tabName=="Murders")
        data = data.filter(function(d){ return (d[tabName] <= 20000)});
      else if(tabName=="Military_Expenditure")
        data = data.filter(function(d){ return (!isNaN(d[tabName]))});

      // Get Values
      var histogram_values = []

      for (var i = 0; i < data.length; i++)
          histogram_values.push(parseInt(data[i][tabName]));

      // var min = histogram_values.reduce(function(a, b) {return Math.min(a, b);});
      var max = histogram_values.reduce(function(a, b) {return Math.max(a, b);});

      x_gh_scale = d3.scale.linear().range([0, width])
          .domain([0, max]),
          x_gh_axis = d3.svg.axis().scale(x_gh_scale).orient("bottom");

      var new_data = d3.layout.histogram()
          .bins(x_gh_scale.ticks(10))
          (histogram_values);

      var y_gh_scale = d3.scale.linear().range([height, 0])
          .domain([0, d3.max(new_data, function (d) {
              return d.length;
          })]);

      var y_gh_axis = d3.svg.axis()
              .scale(y_gh_scale)
              .orient("left")
              .ticks(10);

     var grade_histo_svg = d3.select("#histogram").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var bar = grade_histo_svg.selectAll(".bar")
          .data(new_data)
          .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function (d) {
              return "translate(" + x_gh_scale(d.x) + "," + y_gh_scale(d.y) + ")";
          });

      bar.append("rect")
          .attr("x", 1)
          .attr("width", x_gh_scale(new_data[0].dx) - 1)
          .attr("height", function (d) {
              return height - y_gh_scale(d.y);
          });

      grade_histo_svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(x_gh_axis);

          grade_histo_svg.append("text")
              .attr("transform",
                    "translate(" + (width/2) + " ," +
                                   (height + margin.top - 40) + ")")
              .style("text-anchor", "middle")
              .text(tabName);

      grade_histo_svg.append("g")
            .attr("class", "y axis")
            .call(y_gh_axis);

            grade_histo_svg.append("text")
                 .attr("transform", "rotate(-90)")
                 .attr("y", margin.left - 300)
                 .attr("x",0 - (height / 2))
                 .attr("dy", ".71em")
                 .style("text-anchor", "middle")
                 .text("Number of Countries");

       grade_histo_svg.append("text")
         .attr("x", (width / 2))
         .attr("y", 0 - (margin.top / 2))
         .attr("text-anchor", "middle")
         .style("font-size", "16px")
         .style("text-decoration", "underline")
         .text(tabName);

      $(function () {
          $("#slider-range-max").slider({
              range: "max",
              min: 1,
              max: 20,
              value: 10,
              slide: function (event, ui) {
                  $("#bins").val(ui.value);

                  new_data = d3.layout.histogram()
                      .bins(ui.value)
                      (histogram_values);

                  y_gh_scale.domain([0, d3.max(new_data, function (d) {
                      return d.length
                  })]);

                  y_gh_axis.scale(y_gh_scale);

                  d3.selectAll("g.y.axis")
                  .transition()
                  .call(y_gh_axis);

                  grade_histo_svg.selectAll(".bar")
                      .remove()

                  var bar = grade_histo_svg.selectAll(".bar")
                      .data(new_data)
                      .enter().append("g")
                      .attr("class", "bar")
                      .attr("transform", function (d) {
                          return "translate(" + x_gh_scale(d.x) + "," + y_gh_scale(d.y) + ")";
                      });

                  bar.append("rect")
                      .attr("x", 1)
                      .attr("width", x_gh_scale(new_data[0].dx) - 1)
                      .attr("height", function (d) {
                          return height - y_gh_scale(d.y);
                      });
              }
          });
          $("#bins").val($("#slider-range-max").slider("value"));
      });
  });
}


// Map
function drawMap() {
  var format = d3.format(",");

  // Set tooltips
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Population: </strong><span class='details'>" + format(d.population) +"</span>";
              })

  var margin = {top: -300, right: 0, bottom: 0, left: 0},
              width = 1200 - margin.left - margin.right,
              height = 250 - margin.top - margin.bottom;

  var color = d3.scale.threshold()
      .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
      .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

  var path = d3.geo.path();

  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .append('g')
              .attr('class', 'map');

  var projection = d3.geo.mercator()
                     .scale(130)
                    .translate( [width / 2, height / 1.5]);

  var path = d3.geo.path().projection(projection);

  svg.call(tip);

  queue()
      .defer(d3.json, "data/world_countries.json")
      .defer(d3.tsv, "data/world_population.tsv")
      .await(ready);

  function ready(error, data, population) {
    var populationById = {};

    population.forEach(function(d) { populationById[d.id] = +d.population; });
    data.features.forEach(function(d) { d.population = populationById[d.id] });

    svg.append("g")
        .attr("class", "countries")
      .selectAll("path")
        .data(data.features)
      .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) { return color(populationById[d.id]); })
        .style('stroke', 'white')
        .style('stroke-width', 1.5)
        .style("opacity",0.8)
        // tooltips
          .style("stroke","white")
          .style('stroke-width', 0.3)
          .on('mouseover',function(d){
            tip.show(d);

            d3.select(this)
              .style("opacity", 1)
              .style("stroke","white")
              .style("stroke-width",3);
          })
          .on('mouseout', function(d){
            tip.hide(d);

            d3.select(this)
              .style("opacity", 0.8)
              .style("stroke","white")
              .style("stroke-width",0.3);
          });

    svg.append("path")
        .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
         // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
        .attr("class", "names")
        .attr("d", path);
  }
}
