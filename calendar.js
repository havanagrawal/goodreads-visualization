$(document).ready(function(){	
	google.charts.load("current", {packages:["calendar"]});
	google.charts.setOnLoadCallback(drawChart);	
});

function drawChart(yRange=[1912,2017]) {
	d3.csv("goodreads_extract.csv", function(data) {
		var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
		var sum =0;
		var pdate ={};
		var new_date = []
		data.forEach(function(d) {
			if (d.date_key != '' && (d.year >= yRange[0] && d.year <= yRange[1]) ){				
		/*		var y = '2017-';
				var date_arr = d.publish_date.split(' ')[0].split('-').slice(1,3);
				var d_key = y.concat(date_arr.join('-'));*/
				//console.log(d.date_key)
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
			var tt_content = '<div style="padding:5px 5px 5px 5px; z-index: 5; font-size:16;background: #ffffff;color: #1a1a1a;"><p style="font-family:sans-serif;" >' +nd.getDate()+', '+monthNames[nd.getMonth()]+'<br>No of books released: '+pdate[e]+'</p></div>';
			dataTable.addRow([nd , pdate[e], tt_content]);
		});

	   var chart = new google.visualization.Calendar(document.getElementById('calendar_basic'));

	   var options = {
		 calendar: { cellSize: 17,
					 yearLabel: {
						fontName: 'Times-Roman',
						fontSize: 1
					}
		 },
		 title: "Book Releases"+yRange[0]+' - '+yRange[1],
		 height: 350,
		 tooltip: { isHtml: true }
	   };
		chart.draw(dataTable, options);
	});
		
   
}