var all_years = new Array(2017 - 1912).fill().map((d, i) => i + 1912);

function onClickHandler(cb) {
	var checked = get_currently_selected_genres();
	$("#legend").html("");

	var fromTo = get_current_year_range();
	var yearRange = makeYearRange(fromTo[0], fromTo[1]);

	redraw_chart(checked, yearRange);
	draw_line_chart(checked, yearRange);
	drawChart(fromTo);
}

function makeYearRange(from, to) {
	return new Array(to - from).fill().map((d, i) => i + from);
}

function yearUpdated(from, to) {
	to = to + 1;

	$("#legend").html("");

	var checked = get_currently_selected_genres();
	var years = makeYearRange(from, to)

	redraw_chart(checked, years);
	draw_line_chart(checked, years);
	populate_pill_values(years);
}

var colorscale = d3.scale.category10();

var globalData = [];

d3.csv("goodreads_extract_semifinal.csv", function(error, data) {
	if (error) {
		throw error;
	}
	format_prices(data)
	globalData = data

	window.addEventListener('resize', function() {
			var currently_selected = get_currently_selected_genres()
			redraw_chart(currently_selected, all_years)
	})

	var genres = get_currently_selected_genres()
	var years = data.map(d => +d.publish_year);
	years = years.filter(function(item, i, ar){ return ar.indexOf(item) === i; });

	populate_pill_values(years);
	redraw_chart(genres, years);
});

var line_data = []

d3.csv('line_data_clean.csv', function(error, data) {
	if (error) {
		throw error
	}

	line_data = data;

	var checked = get_currently_selected_genres();

	draw_line_chart(checked, all_years)
})

function draw_line_chart(genres, years) {

	var plot_map = {}

	for (i in genres) {
		var genre = genres[i];
		plot_map[genre] = {column: genre}
	}

	var filtered_data = line_data.filter(d => years.indexOf(+d.year) != -1)

	var chart = makeLineChart(filtered_data, 'year', plot_map , {xAxis: 'Years', yAxis: 'Mean Female-To-Male Ratio'});

	$("#chart-line1").html("");

	chart.bind("#chart-line1");
	chart.render();
}

function populate_pill_values(years) {
	var data = globalData;

	var filtered_years = data.filter(d => years.indexOf(+d.publish_year) != -1)

	var genres = get_all_genres();

	var count_map = {};
	for (i in genres) {
		genre = genres[i];
		count_map[genre] = filtered_years.filter(d => d[genre] == "True").length;
	}

	$("span.pill").each(function(i, e) {
		e.innerHTML = count_map[e.id]
	});
}

function get_currently_selected_genres() {
	var currently_selected = []
	$("input[type=checkbox]:checked").each(function(i, e) {
		currently_selected.push($(e).attr('value'))
	})

	return currently_selected
}

function get_current_year_range() {
	var years = []
	$('.rs-tooltip').each(function() {
		var year = +($(this).text());
		console.log(year);
		years.push(year);
	});

	return years;
}

function get_all_genres() {
	var all_genres = []
	$("input[type=checkbox]").each(function(i, e) {
		all_genres.push($(e).attr('value'))
	})

	return all_genres;
}

function redraw_chart(genres, years) {
	var data = globalData.filter(d => years.indexOf(+d.publish_year) != -1);

	mean_avg_rating_per_genre = calculate_mean_avg_rating_per_genre(data, genres);
	mean_total_reviews_per_genre = calculate_mean_total_reviews_per_genre(data, genres);
	mean_total_ratings_per_genre = calculate_mean_total_ratings_per_genre(data, genres);
	mean_total_pages_per_genre = calculate_mean_total_pages_per_genre(data, genres);
	mean_total_price_per_genre = calculate_mean_price_per_genre(data, genres);

	/*console.log("Mean Average Ratings")
	console.log(mean_avg_rating_per_genre)
	console.log(mean_total_reviews_per_genre)
	console.log(mean_total_ratings_per_genre)
	console.log(mean_total_pages_per_genre)
	console.log("Mean Price")
	console.log(mean_total_price_per_genre)*/

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
	  w: $("#radar_container").width() - 600,
	  h: $("#radar_container").width() - 600,
	  maxValue: [5, 6000, 80000, 500, 10, 1],
	  levels: 5,
	  ExtraWidthX: 500,
		TranslateX: 250
	}

	//Call function to draw the Radar chart
	RadarChart.draw("#chart", d, mycfg);
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
