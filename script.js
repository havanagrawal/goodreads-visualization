var w = 700,
	h = 700;

var colorscale = d3.scale.category10();

//Legend titles
var LegendOptions = ['Fantasy', 'Fiction', 'Crime', 'Thriller'];

var globalData = [];
d3.csv("goodreads_with_kindle_price.csv", function(error, data) {
	if (error) {
		throw error;
	}
	format_prices(data)
	console.log(data);
	globalData = data

	var genres = ['Fantasy', 'Fiction', 'Crime', 'Thriller']

	redraw_chart(genres, []);
});

function redraw_chart(genres, years) {

	data = globalData;

	mean_avg_rating_per_genre = calculate_mean_avg_rating_per_genre(data, genres);
	mean_total_reviews_per_genre = calculate_mean_total_reviews_per_genre(data, genres);
	mean_total_ratings_per_genre = calculate_mean_total_ratings_per_genre(data, genres);
	mean_total_pages_per_genre = calculate_mean_total_pages_per_genre(data, genres);
	mean_total_price_per_genre = calculate_mean_price_per_genre(data, genres);

	console.log("Mean Average Ratings")
	console.log(mean_avg_rating_per_genre)
	console.log(mean_total_reviews_per_genre)
	console.log(mean_total_ratings_per_genre)
	console.log(mean_total_pages_per_genre)
	console.log("Mean Price")
	console.log(mean_total_price_per_genre)

	var d = []
	for (idx in genres) {
		genre = genres[idx]
		d.push([
			{axis:"Average Rating", value: mean_avg_rating_per_genre[genre]},
			{axis:"#Reviews", value: mean_total_reviews_per_genre[genre]},
			{axis:"#Ratings", value: mean_total_ratings_per_genre[genre]},
			{axis: "#Pages", value: mean_total_pages_per_genre[genre]},
			{axis: 'Kindle Price', value: mean_total_price_per_genre[genre]}
		])
	}

	//Options for the Radar chart, other than default
	var mycfg = {
	  w: w,
	  h: h,
	  maxValue: [5, 5000, 80000, 600, 10, 1],
	  levels: 5,
	  ExtraWidthX: 300,
	}

	//Call function to draw the Radar chart
	//Will expect that data is in %'s
	RadarChart.draw("#chart", d, mycfg);

	draw_legend(genres);
}

function draw_legend(genres) {
	var svg = d3.select('#body')
		.selectAll('svg')
		.append('svg')
		.attr("width", w+300)
		.attr("height", h)

	//Create the title for the legend
	var text = svg.append("text")
		.attr("class", "title")
		.attr('transform', 'translate(90,0)')
		.attr("x", w - 70)
		.attr("y", 10)
		.attr("font-size", "12px")
		.attr("fill", "#404040")
		.text("Genres");

	//Initiate Legend
	var legend = svg.append("g")
		.attr("class", "legend")
		.attr("height", 100)
		.attr("width", 200)
		.attr('transform', 'translate(90,20)')

	//Create colour squares
	legend.selectAll('rect')
	  .data(genres)
	  .enter()
	  .append("rect")
	  .attr("x", w - 65)
	  .attr("y", function(d, i){ return i * 20;})
	  .attr("width", 10)
	  .attr("height", 10)
	  .style("fill", function(d, i){ return colorscale(i);})
	  ;
	//Create text next to squares
	legend.selectAll('text')
	  .data(genres)
	  .enter()
	  .append("text")
	  .attr("x", w - 52)
	  .attr("y", function(d, i){ return i * 20 + 9;})
	  .attr("font-size", "11px")
	  .attr("fill", "#737373")
	  .text(function(d) { return d; })
	  ;
}

function format_prices(data) {
	data.forEach(function(d, i) {
		if (data[i]['kindle_price'] != '') {
			data[i]['kindle_price'] = data[i]['kindle_price'].substr(1)
		}
		else {
			data[i]['kindle_price'] = ''
		}
	});
}

function calculate_mean_avg_rating_per_genre(data, genres) {
	return numerical_mean(data, genres, 'avg_ratings')
}

function calculate_mean_total_reviews_per_genre(data, genres) {
	return numerical_mean(data, genres, 'num_reviews')
}

function calculate_mean_total_ratings_per_genre(data, genres) {
	return numerical_mean(data, genres, 'num_ratings')
}

function calculate_mean_total_pages_per_genre(data, genres) {
	return numerical_mean(data, genres, 'num_pages')
}

function calculate_mean_price_per_genre(data, genres) {
	return numerical_mean(data, genres, 'kindle_price')
}

function numerical_mean(data, genres, field) {
	var genre_mean_values = {}

	for (idx in genres) {
		var genre = genres[idx]
		var field_values = data.filter(d => d[genre] == "True")
														.map(d => +d[field].replace(",", ""))
														.filter(Boolean)
		genre_mean_values[genre] = mean(field_values)
	}

	return genre_mean_values
}

function mean(arr) {
	return sum(arr) / arr.length
}

function sum(arr) {
	var s = arr.reduce(function(previousValue, currentValue){
    return currentValue + previousValue;
	}, 0);

	return s;
}
