var svg = d3.select("svg"),
    margin = {top: 20, right: 100, bottom: 125, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    widthLegend = svg.attr("width") - 112,
    heightLegend = svg.attr("height")/4,
    margin2 = {top: 410, right: 100, bottom: 20, left: 50},
    height2 = svg.attr("height") - margin2.top - margin2.bottom,
    start = 1,
    services;

var parseTime = d3.timeParse("%Y%m");

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

var line = d3.line()
    .curve(d3.curveStepAfter)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });

var line2 = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x2(d.date); })
    .y(function(d) { return y2(d.price); });

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
        .attr("width", width)
        .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.tsv("data.tsv", type, function(error, data) {
    if (error) throw error;

    services = data.columns.slice(1,4).map(function(id) {
    var last = 0;
    return {
      id: id,
      active: true,
      values: data.map(function(d) {
        if (d[id] != 0) {
            last = d[id];
            return {
            date: d.date, 
            price: d[id]};
        }else{
            return{
            date: d.date, 
            price: last};
        };
        
      })
    };  
    });
    var aysa = data.columns.slice(1,2).map(function(id) {

    return {
      id: id,
      values: data.map(function(d) {
        return {date: d.date, price: d[id]};
      })
    };  
    });
    var edenor = data.columns.slice(2,3).map(function(id) {

    return {
      id: id,
      values: data.map(function(d) {
        return {date: d.date, price: d[id]};
      })
    };  
    });
     var metrogas = data.columns.slice(3,4).map(function(id) {

    return {
      id: id,
      values: data.map(function(d) {
        return {date: d.date, price: d[id]};
      })
    };  
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));
    x2.domain(x.domain());

    y.domain([
        d3.min(services, function(c) { return d3.min(c.values, function(d) { return d.price; }); }),
        d3.max(services, function(c) { return d3.max(c.values, function(d) { return d.price; }) + 50; })
    ]);
    y2.domain(y.domain());

    z.domain(services.map(function(c) { return c.id; }));

    var focuslineGroups = focus.selectAll("g")
           .data(services)
        .enter().append("g")
        .attr("class", function(d) { return "service " +  d.id; });

    var focuslines = focuslineGroups.append("path")
        .attr("class","line")
        .attr("d", function(d) { return line(d.values);})
        .style("stroke",  function(d) { return z(d.id);})
        .attr("id", function(d) { return "line" + d.id; })
        .attr("clip-path", "url(#clip)")   

    focus.append("g")
        .attr("class", "x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "y")
        .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("fill", "#000")
            .text("price, $");

    var contextlineGroups = context.selectAll("g")
            .data(services)
        .enter().append("g")
        .attr("class", function(d) { return "service " + d.id; });
    
    var contextLines = contextlineGroups.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line2(d.values); })
        .style("stroke",  function(d) { return z(d.id);})
        .attr("id", function(d) { return "line2" + d.id; })
        .attr("clip-path", "url(#clip)");

    context.append("g")
        .attr("class", "x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

      svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    var legend = svg.selectAll('service')
        .data(services)
        .enter().append('g')
        .attr('class', 'legend');

    legend.append('rect')
        .attr('x', widthLegend)
        .attr('y', function(d, i){ return (i * 22) + heightLegend;})
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d) {return z(d.id);});

    legend.append('text')
        .attr('x', widthLegend + 12)
        .attr('y', function(d, i){ return (i *  22) + heightLegend + 9;})
        .text(function(d){ return d.id.toUpperCase(); });

    legend.on("click", function(d){ 
        var active   = d.active ? false : true,
            newOpacity = active ? 1 : 0,
            maxY = 0;

        d.active = active; 

        var maxGas = d3.max(metrogas, function(c) { return d3.max(c.values, function(n) { return n.price; }); }), 
            maxLuz = d3.max(edenor, function(c) { return d3.max(c.values, function(n) { return n.price; }); }),
            maxAgua = d3.max(aysa, function(c) { return d3.max(c.values, function(n) { return n.price; }); });

         if (d.id == 'aysa' && !active) {
            if ( (services[1].active || services[1].active == undefined) && (services[2].active || services[2].active == undefined)) {
               if (maxGas > maxLuz) {
                   maxY = maxGas; 
                }else{
                    maxY = maxLuz;
                }   
            }else if ((services[1].active || services[1].active == undefined) && (!services[2].active && services[2].active != undefined)) {
                 maxY = maxLuz;
            }else if ((!services[1].active || services[1].active != undefined) && (services[2].active || services[2].active == undefined)) {
                 maxY = maxGas; 
             }else{
                maxY = 0;
             }                    
        }else if ((d.id == 'metrogas' && !active) ){
            if ( (services[1].active || services[1].active == undefined) && (services[0].active || services[0].active == undefined)) {
               if (maxAgua > maxLuz) {
                   maxY = maxAgua; 
                }else{
                    maxY = maxLuz;
                }   
            }else if ((services[1].active || services[1].active == undefined) && (!services[0].active && services[0].active != undefined)) {
                 maxY = maxLuz;
            }else if ((!services[1].active || services[1].active != undefined) && (services[0].active || services[0].active == undefined)) {
                 maxY = maxAgua; 
            }else{
                maxY = 0;
            }               
        }else if ((d.id == 'edenor' && !active)){
            if ( (services[2].active || services[2].active == undefined) && (services[0].active || services[0].active == undefined)) {
               if (maxAgua > maxGas) {
                   maxY = maxAgua; 
                }else{
                    maxY = maxGas;
                }   
            }else if ((services[2].active || services[2].active == undefined) && (!services[0].active && services[0].active != undefined)) {
                 maxY = maxGas;
            }else if ((!services[2].active || services[2].active != undefined) && (services[0].active || services[0].active == undefined)) {
                 maxY = maxAgua; 
            }else{
                maxY = 0;
            } 
        }else if (d.id == 'aysa' && active) {
            if ( (services[1].active || services[1].active == undefined) && (services[2].active || services[2].active == undefined)) {
               if (maxGas > maxLuz && maxGas > maxAgua) {
                   maxY = maxGas; 
                }else if (maxLuz > maxGas && maxLuz > maxAgua){
                    maxY = maxLuz;
                }else if (maxAgua > maxLuz && maxAgua > maxGas){
                    maxY = maxAgua;
                }     
            }else if ((services[1].active || services[1].active == undefined) && (!services[2].active && services[2].active != undefined)) {
                if (maxAgua > maxLuz) {
                   maxY = maxAgua; 
                }else if (maxLuz > maxAgua){
                    maxY = maxLuz;
                }
            }else if ((!services[1].active || services[1].active != undefined) && (services[2].active || services[2].active == undefined)) {
                if (maxAgua > maxGas) {
                   maxY = maxAgua; 
                }else if (maxGas > maxAgua){
                    maxY = maxGas;
                } 
            }else{
                maxY = maxAgua;
            }                  
        }else if ((d.id == 'metrogas' && active) ){
            if ( (services[1].active || services[1].active == undefined) && (services[0].active || services[0].active == undefined)) {
               if (maxGas > maxLuz && maxGas > maxAgua) {
                   maxY = maxGas; 
                }else if (maxLuz > maxGas && maxLuz > maxAgua){
                    maxY = maxLuz;
                }else if (maxAgua > maxLuz && maxAgua > maxGas){
                    maxY = maxAgua;
                }  
            }else if ((services[1].active || services[1].active == undefined) && (!services[0].active && services[0].active != undefined)) {
                if (maxGas > maxLuz) {
                   maxY = maxGas; 
                }else if (maxLuz > maxGas){
                    maxY = maxLuz;
                }
            }else if ((!services[1].active || services[1].active != undefined) && (services[0].active || services[0].active == undefined)) {
                if (maxAgua > maxGas) {
                   maxY = maxAgua; 
                }else if (maxGas > maxAgua){
                    maxY = maxGas;
                }
            }else{
                maxY = maxGas;
            }               
        }else if ((d.id == 'edenor' && active)){
            if ( (services[2].active || services[2].active == undefined) && (services[0].active || services[0].active == undefined)) {
               if (maxGas > maxLuz && maxGas > maxAgua) {
                   maxY = maxGas; 
                }else if (maxLuz > maxGas && maxLuz > maxAgua){
                    maxY = maxLuz;
                }else if (maxAgua > maxLuz && maxAgua > maxGas){
                    maxY = maxAgua;
                }     
            }else if ((services[2].active || services[2].active == undefined) && (!services[0].active && services[0].active != undefined)) {
                if (maxLuz > maxGas) {
                   maxY = maxLuz; 
                }else if (maxGas > maxLuz){
                    maxY = maxGas;
                }
            }else if ((!services[2].active || services[2].active != undefined) && (services[0].active || services[0].active == undefined)) {
                if (maxAgua > maxLuz) {
                   maxY = maxAgua; 
                }else if (maxLuz > maxAgua){
                    maxY = maxLuz;
                }
            }else{
                maxY = maxLuz;
            } 
        }
        
        y.domain([
            d3.min(services, function(c) { return d3.min(c.values, function(d) { return d.price; }); }),
            maxY + 50
        ]);

        focus.select(".y").transition().duration(1200).call(yAxis); 

        d3.select("#line" + d.id).transition().duration(1).style("opacity", newOpacity); 
        d3.select("#line2" + d.id).transition().duration(1).style("opacity", newOpacity);

        focus.selectAll("path.line").attr("d",  function(d) {return line(d.values)});
        drawTable(x,services);

    });
});

function type(d, _, columns) {
  d.date = parseTime(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
} 

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.selectAll("path.line").attr("d",  function(d) {return line(d.values)});
    focus.select(".x").call(xAxis);
    focus.select(".y").call(yAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
    if (start == 1) {
        start = 0;
    }else{
        drawTable(x,services);
    }    
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.selectAll("path.line").attr("d",  function(d) {return line(d.values)});
    focus.select(".x").call(xAxis);
    focus.select(".y").call(yAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    drawTable(x,services);
}

function drawTable(x, services){
    var tbl;
    while( document.getElementById("myTable") != null){
        tbl = document.getElementById("myTable");
        if(tbl) tbl.parentNode.removeChild(tbl);
    }
    var services_disabled = [];
    if (services != null) {
        for (var i = services.length - 1; i >= 0; i--) {
            if(services[i].active == false){
                services_disabled.push(i);
            }
        }
    }
    if (services_disabled.length == 3) {
        return;
    }
    d3.tsv("data.tsv", type, function(error, data) {
        if (error) throw error;

        var services2 = data.columns.slice(1,4).map(function(id) {
            return {
                id: id,
                active: true,
                values: data.map(function(d) {
                    return {
                    date: d.date, 
                    price: d[id]};        
                })
            };  
        });
        var body = document.getElementsByTagName("body")[0];
        var tbl     = document.createElement("table");
        var tblBody = document.createElement("tbody");
        var monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        tbl.setAttribute('id', 'myTable');
        var header = tbl.createTHead();
        var row = header.insertRow(0);
        var cell = row.insertCell(0);
        cell.innerHTML = "<b>Date</b>";
        for (var i = 0, j = 1; i < services2.length; i++) {
            if (!services_disabled.includes(i)) {
                var cell = row.insertCell(j);
                cell.innerHTML = "<font color='" + z(services[i].id) + "'>" + "<b>" + services2[i].id.toUpperCase() + "</b></font>";
                j++;
            }
        }
        var services_lenght = services2[0].values.length;
        for (var i = 0; i < services_lenght; i++) {
            var row = document.createElement("tr");
            for (var k = 0; k <= services2.length; k++) {
                if((k == 0 && services2[k].values[i].date >=  x.domain()[0] && services2[k].values[i].date <=  x.domain()[1]) || 
                                                (k != 0 && services2[k-1].values[i].date >=  x.domain()[0] && services2[k-1].values[i].date <=  x.domain()[1] && !services_disabled.includes(k-1))){
                    var cell = document.createElement("td");
                    if (k == 0) {
                        var d = services2[k].values[i].date;
                        var cellText = document.createTextNode(monthNames[d.getUTCMonth()] + " - " +  d.getUTCFullYear()); 
                    }else{
                        var auxPrice = services2[k-1].values[i].price;
                        if (auxPrice == 0 || auxPrice == 1) {
                            var cellText = document.createTextNode("No correspondía pagar este servicio"); 
                        }else{
                            var cellText = document.createTextNode("$" + services2[k-1].values[i].price); 
                        }                            
                    }                        
                    cell.appendChild(cellText);
                    row.appendChild(cell);                
                }
            }
            tblBody.appendChild(row);
        }
        tbl.appendChild(tblBody);
        body.appendChild(tbl);
        tbl.setAttribute("border", "2");
    });         
}