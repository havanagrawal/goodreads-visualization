$(document).ready(function(){
	google.charts.load("current", {packages:["calendar"]});
	google.charts.setOnLoadCallback(drawChart);

});

var calendar_data = []

d3.csv("goodreads_extract_vishnu.csv", function(data) {
	calendar_data = data;
	drawChart();
})

function drawChart(yRange=[1980,2017]) {
		var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
		var sum = 0;
		var pdate ={};
		var new_date = []

		var genres = get_currently_selected_genres();

		calendar_data.forEach(function(d) {

			var toSkip = true;

			for (i in genres) {
				var genre = genres[i];
				if (d[genre] == "TRUE") {
					toSkip = false;
					break;
				}
			}

			if (d.date_key != '' && (d.year >= yRange[0] && d.year <= yRange[1]) && !toSkip){
				if( pdate[d.date_key]  === undefined){
					pdate[d.date_key] = 1;
				}
				else{
					pdate[d.date_key]++;
				}
			}
		});

		var dataTable = new google.visualization.DataTable();
		dataTable.addColumn({ type: 'date', id: 'Date' });
	  dataTable.addColumn({ type: 'number', id: 'book_n' });
		dataTable.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});

		Object.keys(pdate).forEach(function(e){
			var nd = new Date(e)
			nd.setDate(nd.getDate() + 1);

			var tooltip_content = '<p style="font-family:sans-serif;" >' + nd.getDate() + ' ' + monthNames[nd.getMonth()] + '<br/> No of books released: ' + pdate[e] + '</p>'
			var div_open = '<div style="padding:5px 5px 5px 5px; z-index: 5; font-size:16;background: #ffffff;color: #1a1a1a;">'
			var div_close = '</div>'
			var tt_html = div_open + tooltip_content + div_close;
			dataTable.addRow([nd , pdate[e], tt_html]);
		});

	   var chart = new google.visualization.Calendar(document.getElementById('calendar_basic'));

	   var options = {
			 calendar: {
				 cellSize: 18,
				 yearLabel: {
				 		fontName: 'Times-Roman',
						fontSize: 1
				 }
			 },
		 title: "Book Releases: " + yRange[0] + ' - ' + yRange[1],
		 height: 450,
		 tooltip: { isHtml: true }
	   };
		chart.draw(dataTable, options);
}
