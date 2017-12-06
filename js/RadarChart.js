var RadarChart = {
  draw: function(id, d, options){
    var cfg = {
  	 radius: 5,
  	 w: 600,
  	 h: 600,
  	 factor: 1,
  	 factorLegend: .85,
  	 levels: 3,
  	 maxValue: 0,
  	 radians: 2 * Math.PI,
  	 opacityArea: 0.1,
  	 ToRight: 5,
  	 TranslateX: 116,
  	 TranslateY: 40,
  	 ExtraWidthX: 100,
  	 ExtraWidthY: 100,
  	 color: d3.scale.category20()
  	};

  	if('undefined' !== typeof options){
  	  for(var i in options){
    		if('undefined' !== typeof options[i]){
    		  cfg[i] = options[i];
    		}
  	  }
  	}

	var allAxis = (d[0].map(function(i, j){return i.axis}));
	var total = allAxis.length;
	var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
	d3.select(id).select("svg").remove();

	var g = d3.select(id)
			.append("svg")
			.attr("width", cfg.w + cfg.ExtraWidthX)
			.attr("height", cfg.h + cfg.ExtraWidthY)
			.append("g")
			.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
			;

	var tooltip;

	//Circular segments
	for(var j = 0; j < cfg.levels - 1; j++) {
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  g.selectAll(".levels")
	   .data(allAxis)
	   .enter()
	   .append("svg:line")
	   .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
	   .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
	   .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
	   .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
	   .attr("class", "line")
	   .style("stroke", "grey")
	   .style("stroke-opacity", "0.75")
	   .style("stroke-width", "0.3px")
	   .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
	}

	//Text indicating value at each level and axis
	for(var j = 0; j < cfg.levels; j++) {
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  g.selectAll(".levels")
	   .data(new Array(cfg.maxValue.length - 1)) //dummy data
	   .enter()
	   .append("svg:text")
	   .attr("x", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
	   .attr("y", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
	   .attr("class", "legend")
	   .style("font-family", "sans-serif")
	   .style("font-size", "10px")
	   .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
	   .attr("fill", "#737373")
	   .text(function(d, i) {return (j+1)*cfg.maxValue[i]/cfg.levels});
	}

	series = 0;

	var axis = g.selectAll(".axis")
			.data(allAxis)
			.enter()
			.append("g")
			.attr("class", "axis");

	axis.append("line")
		.attr("x1", cfg.w/2)
		.attr("y1", cfg.h/2)
		.attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
		.attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
		.attr("class", "line")
		.style("stroke", "grey")
		.style("stroke-width", "1px");

	axis.append("text")
		.attr("class", "legend")
		.text(function(d){return d})
		.style("font-family", "sans-serif")
		.style("font-size", "12px")
		.attr("text-anchor", "middle")
		.attr("dy", "1.5em")
		.attr("transform", function(d, i){return "translate(0, -10)"})
		.attr("x", function(d, i){
      var angle = i*cfg.radians/total;
      return cfg.w/2 * (1  - cfg.factorLegend * Math.sin(angle)) - 100*Math.sin(angle);
    })
		.attr("y", function(d, i){
      var angle = i*cfg.radians/total
      return cfg.h/2 * (1 - Math.cos(angle)) - 20*Math.cos(angle);
    });


	d.forEach(function(y, x){
	  dataValues = [];
	  g.selectAll(".nodes")
		.data(y, function(j, i){
		  dataValues.push([
			cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue[i])*cfg.factor*Math.sin(i*cfg.radians/total)),
			cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue[i])*cfg.factor*Math.cos(i*cfg.radians/total))
		  ]);
		});
	  dataValues.push(dataValues[0]);
	  g.selectAll(".area")
					 .data([dataValues])
					 .enter()
					 .append("polygon")
					 .attr("class", "radar-chart-serie"+series)
					 .style("stroke-width", "2px")
					 .style("stroke", cfg.color(series))
					 .attr("points",function(d) {
						 var str="";
						 for(var pti=0;pti<d.length;pti++){
							 str=str+d[pti][0]+","+d[pti][1]+" ";
						 }
						 return str;
					  })
					 .style("fill", function(j, i){return "#FFFFFF"})//cfg.color(series)})
					 .style("fill-opacity", 0)//cfg.opacityArea)
					 /*.on('mouseover', function (d){
										z = "polygon."+d3.select(this).attr("class");

                    color = d3.select(this).style("stroke")

										g.selectAll("polygon")
										 .transition(200)
										 .style("fill-opacity", 0.1);
										g.selectAll(z)
										 .transition(200)
                     //.style("fill", color)
										 .style("fill-opacity", .7);
									  })
					 .on('mouseout', function(){
										g.selectAll("polygon")
										 .transition(200)
                     //.style("fill", "#FFFFFF")
										 .style("fill-opacity", cfg.opacityArea);
					 });*/
	  series++;
	});
	series=0;


	d.forEach(function(y, x){
	  g.selectAll(".nodes")
		.data(y).enter()
		.append("svg:circle")
		.attr("class", "radar-chart-serie"+series)
		.attr('r', cfg.radius)
		.attr("alt", function(j){return Math.max(j.value, 0)})
		.attr("cx", function(j, i){
		  dataValues.push([
  			cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue[i])*cfg.factor*Math.sin(i*cfg.radians/total)),
  			cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue[i])*cfg.factor*Math.cos(i*cfg.radians/total))
  		]);
		  return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue[i])*cfg.factor*Math.sin(i*cfg.radians/total));
		})
		.attr("cy", function(j, i){
		  return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue[i])*cfg.factor*Math.cos(i*cfg.radians/total));
		})
		.attr("data-id", function(j){return j.axis})
		.style("fill", cfg.color(series)).style("fill-opacity", .9)
		.on('mouseover', function (d){
					newX =  parseFloat(d3.select(this).attr('cx')) - 10;
					newY =  parseFloat(d3.select(this).attr('cy')) - 5;

					tooltip
						.attr('x', newX)
						.attr('y', newY)
						.text(d.value)
						.transition(200)
						.style('opacity', 1);

					z = "polygon."+d3.select(this).attr("class");
          console.log("Polygon selector: " + z);
          color = d3.select(this).style("fill")

					g.selectAll("polygon")
						.transition(200)
						.style("fill-opacity", 0.1);
					g.selectAll(z)
						.transition(200)
            .style("fill", color)
						.style("fill-opacity", .4);
				  })
		.on('mouseout', function(){
					tooltip
						.transition(200)
						.style('opacity', 0);
					g.selectAll("polygon")
						.transition(200)
            .style("fill", "#FFFFFF")
						.style("fill-opacity", cfg.opacityArea);
				  })
		.append("svg:title")
		.text(function(j){return Math.max(j.value, 0)});

	  series++;
	});
	//Tooltip
	tooltip = g.append('text')
			   .style('opacity', 0)
			   .style('font-family', 'sans-serif')
			   .style('font-size', '13px');
  }
};