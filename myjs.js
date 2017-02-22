var varSelected = "";  
var width = 400;
var height = 400;

var select1 = document.getElementById("dropdown");
var allKeys =[];
var cloneObj = {};
d3.csv("fb_data.csv", function(data) 
{
    allKeys = Object.keys(data[0]);
    cloneObj = JSON.parse(JSON.stringify(data));
    for(var i = 0; i < allKeys.length; i++) 
    {
        var option = Object.keys(data[0])[i];
        console.log(option);
        var child = document.createElement("option");
        child.value = option;
        child.textContent = option.toUpperCase();
        select1.appendChild(child);
    };
});

function getColour(n) 
{
    var colours = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colours[n % colours.length];
}

function selectvar(variable)
{			
    d3.select("svg").remove();
    varSelected = variable;
    console.log(varSelected);
	  var dataset = [];
	  for(var key in cloneObj) 
    {
		    var value = cloneObj[key];
		    dataset.push(value[variable]);
	  };

	  var tool_tip = d3.tip()
        			 .attr("class", "d3-tip")
        			 .offset([0, 0])
        			 .html(function(d) 
                { 
                    return "Frequency: " + d.length; 
                });
	
	  var margin = {top: 10, right: 30, bottom: 30, left: 10},
        width = 400 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var maxValue = d3.max(d3.values(dataset));
	  var minValue = d3.min(d3.values(dataset));
	  var x = d3.scaleLinear()
    	  	  .domain([minValue, maxValue])
   		  	  .rangeRound([0, width]);

	  var y = d3.scaleLinear()
    	  	  .range([height, 0]);

	  var histogram = d3.histogram()
    			  	  .domain(x.domain())
    			  	  .thresholds(x.ticks(9));

    var bins = histogram(dataset);
	
	  var svg = d3.select("#graph")
				  .append("svg")
    			.attr("width", width + margin.left + margin.right)
    			.attr("height", height + margin.top + margin.bottom)
  				.append("g")
          .on("click", function()
              {
                  tool_tip.hide();  
                  convertToPie(bins)  
              })
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	  svg.append("g")
   	   .attr("class", "axis axis--x")
   	   .attr("transform", "translate(0," + height + ")")
   	   .call(d3.axisBottom(x));

   	var xCoord = 0;
   	var binVal = 10;
   	d3.select("#drag").call(d3.drag()
      .on("start", function()
      {
          xCoord = d3.mouse(this)[0];
      })
      .on("drag", function()
      {
          var diff = (d3.mouse(this)[0] - xCoord);
          if( diff < 0)
          {
              diff = Math.max(diff, -300)
          };
          
          if(diff >= 0)
          {
              diff = Math.min(diff, 300);
          }
          
          console.log("diff: " + diff);
          var temp = 1 + ((diff + 300)/30);
          if(temp != binVal)
          {
              binVal = temp;
          }

      })
      .on("end", function()
      {
          var dataNew = d3.histogram()
    			  	  .domain(x.domain())
    			  	  .thresholds(x.ticks(Math.floor(binVal)))(dataset);
          var bar = svg.selectAll(".bar") 
            .data([]);
            bar.exit().remove();
            update(dataNew);          
      }));

   	function update(bins)
    {
   	
   	    y.domain([0, d3.max(bins, function(d) 
        { 
            return d.length; 
        })]);
	      svg.call(tool_tip);

  	    var bar = svg.selectAll(".bar")
      		 	 .data(bins)
      		   .enter().append("g")
      		 	 .attr("class", "bar")
      		 	 .attr("transform", function(d) 
              { 
                  return "translate(" + x(d.x0) + "," + y(d.length) + ")"; 
              })
             .attr("fill", function(d,i) 
              { 
                  return getColour(i); 
              })
      		 	 .on("mouseover", function(d) 
              {
                  tool_tip.show(d);
                  d3.select(this)
                  .attr("transform", function(d) 
                  { 
                      return "translate("+ x(d.x0) +"," + y(d.length*1.2) + ") scale(1.2, 1.2)"; 
                  });        
              })
      		 	
				      .on("mouseout", function(d) 
              {
					        tool_tip.hide(d);
					        d3.select(this)
					        .attr("height", height - y(d.length))
					        .attr("transform", function(d) 
                  { 
                      return "translate("+ x(d.x0) +"," + y(d.length) + ") scale(1, 1)";
                  });
				      });


	  bar.append("rect")
   	   .attr("x", 1)
   	   .attr("y", 0)
       .attr("height", function (d) 
        { 
            return height - y(d.length);
        })
       .style("fill",function (d,i) 
        { 
            return getColour(i); 
        })
   	   .transition().delay(function (d,i)
        { 
            return i * 100;
        })
       .duration(100)
   	   .attr("width", function(d) 
       { 
            return x(d.x1) - x(d.x0) - 10; 
       })
       ;
   	}
   	update(bins);
}

function convertToPie(bins)
{
    console.log(varSelected);
    var radius = Math.min(width, height) / 2;
    d3.select("svg").remove();
    var color = d3.scaleOrdinal(d3.schemeCategory20b);
    var radius = Math.min(width, height) / 2;
    var color = d3.scaleOrdinal(d3.schemeCategory20b);
    var svg = d3.select('#graph')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')

        .on("click",function()
        {
            directed();
        });

  var arc = d3.arc()
              .innerRadius(0)
              .outerRadius(radius-20);

  var arc1 = d3.arc()
               .innerRadius(0)
               .outerRadius(radius);
        
  var pie = d3.pie()
              .value(function(d) 
              { 
                  return d.length; 
              })
              .sort(null);

  var path = svg.selectAll('path')
                .data(pie(bins))
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('stroke','white')
                .attr("stroke-width", 1)
                .attr('fill',function(d,i) 
                { 
                    return getColour(i); 
                })

                .on("mouseover", function(d,i) 
                {
                    d3.select(this)
                      .attr("d", arc1)
                      .attr("stroke-width", 4);
                   
                    svg.append("text")
                      .attr("transform", function() 
                      {
                        return "translate(" + arc.centroid(d) + ")";
                      })
                    .style("text-anchor", "end")
                    .style("font-size", 30)
                    .attr("class", "label")
                    .text(d.value);

                })
                .on("mouseout", function(d,i) 
                {
                  d3.select(this)
                    .attr("d",arc)
                    .attr("stroke-width", 1);
        
                  svg.selectAll("text")
                     .style("opacity",0);
                });
}

function directed()
{
    
    var nodes = [];
    var links = [];
    var maxNodes = 10;
    var min = 1;
    var max = 10;
    var numberofNodes = 0;
    while(numberofNodes < maxNodes) 
    {
        var value = cloneObj[Math.floor(Math.random() * (cloneObj.length-0))];
        var node = 
        {
            id: value["Post Month"],
            group: Math.floor(Math.random() * (max - min)) + min
        };
        numberofNodes++;
        nodes.push(node);
    };
   
    for(var i=0;i<nodes.length;i++)
    {
        var randonIndex1 = 0;
        var randonIndex2 = 0;
        randonIndex1 = Math.floor(Math.random() * (nodes.length-min) + min);
        randonIndex2 = Math.floor(Math.random() * (nodes.length-min) + min);
        var link = 
        {
          source : nodes[i].id,
          target : nodes[randonIndex1].id,
          value : 10
        }
        links.push(link);
        var link = 
        {
          source : nodes[i].id,
          target : nodes[randonIndex2].id,
          value : 10
        }
        links.push(link);
    }

    var data = 
    {
      nodes : nodes,
      links : links
    }


    d3.select("svg").remove();

    var svg = d3.select("#graph")
                .append('svg')
                .attr('width', 400)
                .attr('height', 400)
                .on("click",function()
                {
                   selectvar(varSelected);
                });
           

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var simulation = d3.forceSimulation()
                       .force("link", d3.forceLink().id(function(d) { return d.id; }))
                       .force("charge", d3.forceManyBody())
                       .force("center", d3.forceCenter(width / 2, height / 2));

    var link = svg.append("g")
                  .attr("class", "links")
                  .selectAll("line")
                  .data(data.links)
                  .enter().append("line")
                  .style("stroke-width", "1.5px")
                  .style("stroke", "#999");

    var node = svg.append("g")
                  .attr("class", "nodes")
                  .selectAll("circle")
                  .data(data.nodes)
                  .enter().append("circle")
                  .attr("r", 5)
                  .attr("fill", function(d) 
                  { 
                      return color(d.group); 
                  })
                  .style("stroke-width", "1.5px")
                  .style("stroke", "#fff")
                  .call(d3.drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended));
           

    node.append("title")
        .text(function(d) { return d.id; });

    simulation
        .nodes(data.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(data.links);

    function ticked() 
    {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }
       
    function dragstarted(d) 
    {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) 
    {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) 
    {
        if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
    }
}