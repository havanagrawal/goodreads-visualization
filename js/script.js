var all_years = new Array(2017 - 1912).fill().map((d, i) => i + 1912);

var choice = 'num_pages'

function onClickHandler(cb) {
	inputControlUpdateHandler()
}

function yearUpdated() {
	inputControlUpdateHandler()
}

function inputControlUpdateHandler() {

	$('.axistext').click(function(elem) {
		var axisId = elem.target.id
		choice = axisId;
		console.log(choice);
		$('#secondary-chart-title').html(name_map[axisId] + " Over Time")
		draw_line_chart(axisId);
	})

	var checked = get_currently_selected_genres();

	var fromTo = get_current_year_range();
	var yearRange = makeYearRange(fromTo[0], fromTo[1] + 1);

	populate_pill_values(yearRange);
	redraw_chart(checked, yearRange);
	draw_line_chart(choice);
	drawChart(fromTo);
}

function makeYearRange(from, to) {
	return new Array(to - from).fill().map((d, i) => i + from);
}

var globalData = [];

var line_chart_data = {
	'avg_ratings': [],
	'kindle_price': [],
	'num_ratings': [],
	'num_pages': [],
	'num_reviews': []
}
var name_map = {}

name_map['avg_ratings'] = 'Average Ratings';
name_map['kindle_price'] = 'Kindle Price';
name_map['num_ratings'] = 'Number of Ratings';
name_map['num_pages'] = 'Number of Pages';
name_map['num_reviews'] = 'Number of Reviews';

d3.csv("data/goodreads_extract_semifinal.csv", function(error, data) {
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

	line_chart_data['avg_ratings'] = make_line_chart_data(data, 'avg_ratings');
	line_chart_data['kindle_price'] = make_line_chart_data(data, 'kindle_price');
	line_chart_data['num_ratings'] = make_line_chart_data(data, 'num_ratings');
	line_chart_data['num_pages'] = make_line_chart_data(data, 'num_pages');
	line_chart_data['num_reviews'] = make_line_chart_data(data, 'num_reviews');

	populate_pill_values(years);
	redraw_chart(genres, years);
	draw_line_chart(choice);
});

function make_line_chart_data(data, feature) {
	var line_data = [];

	var all_genres = get_all_genres();

	for (i in all_years) {
		var year = all_years[i]
		var filtered_data = data.filter(d => +d.publish_year == year)

		var year_map = numerical_mean(filtered_data, all_genres, feature)
		year_map['year'] = year

		line_data.push(year_map);
	}

	return line_data;
}

var line_data = []

function draw_line_chart(feature_name) {
	var data = line_chart_data[feature_name]

	var plot_map = {}
	var genres = get_currently_selected_genres();
	var fromTo = get_current_year_range()
	var years = makeYearRange(fromTo[0], fromTo[1] + 1)

	for (i in genres) {
		var genre = genres[i];
		plot_map[genre] = {column: genre}
	}

	var filtered_data = data.filter(d => years.indexOf(+d.year) != -1)

	var chart = makeLineChart(filtered_data, 'year', plot_map , {xAxis: 'Years', yAxis: name_map[feature_name]});

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

	var per_genre_map = {}

	per_genre_map['avg_rating'] = calculate_mean_avg_rating_per_genre(data, genres);
	per_genre_map['num_reviews'] = calculate_mean_total_reviews_per_genre(data, genres);
	per_genre_map['num_ratings'] = calculate_mean_total_ratings_per_genre(data, genres);
	per_genre_map['num_pages'] = calculate_mean_total_pages_per_genre(data, genres);
	per_genre_map['kindle_price'] = calculate_mean_price_per_genre(data, genres);

	/*console.log("Mean Average Ratings")
	console.log(mean_avg_rating_per_genre)
	console.log(mean_total_reviews_per_genre)
	console.log(mean_total_ratings_per_genre)
	console.log(mean_total_pages_per_genre)
	console.log("Mean Price")
	console.log(mean_total_price_per_genre)*/

	var d = []
	var maxMap = {'avg_ratings': 0, 'num_reviews': 0, 'num_ratings' : 0, 'num_pages': 0, 'kindle_price': 0}
	for (idx in genres) {
		genre = genres[idx]

		for (key in per_genre_map) {
			if (per_genre_map[key][genre] > maxMap[key]) {
				maxMap[key] = per_genre_map[key][genre]
				var s = parseInt(maxMap[key]).toString()
				maxMap[key] = (+s[0] + 1) * Math.pow(10, s.length - 1)
			}
		}

		d.push([
			{
				axis: "Average Rating",
				value: per_genre_map['avg_rating'][genre],
				id: "avg_ratings"
			},
			{
				axis: "Number of Reviews",
				value: per_genre_map['num_reviews'][genre],
				id: "num_reviews"
			},
			{
				axis: "Number of Ratings",
				value: per_genre_map['num_ratings'][genre],
				id: "num_ratings"
			},
			{
				axis: "Number of Pages",
				value: per_genre_map['num_pages'][genre],
				id: "num_pages"
			},
			{
				axis: 'Kindle Price ($)',
				value: per_genre_map['kindle_price'][genre],
				id: 'kindle_price'
			}
		])
	}

	//Options for the Radar chart, other than default
	var mycfg = {
	  w: $("#radar_container").width() - 600,
	  h: $("#radar_container").width() - 600,
	  maxValue: [
			5,
			Math.max(6000, maxMap['num_reviews']),
			Math.max(100000, maxMap['num_ratings']),
			Math.max(500, maxMap['num_pages']),
			Math.max(10, maxMap['kindle_price']),
			1],
	  levels: 5,
	  ExtraWidthX: 500,
		TranslateX: 250
	}

	//Call function to draw the Radar chart
	RadarChart.draw("#chart", d, mycfg);

	$('.axistext').click(function(elem) {
		var axisId = elem.target.id
		choice = axisId;
		console.log(choice);
		$('#secondary-chart-title').html(name_map[axisId] + " Over Time")
		draw_line_chart(axisId);
	})
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
