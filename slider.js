$(document).ready(function(){

	var slider = new rSlider(
		{
        target: '#slider',
        values: {min:1980,max:2017},
				width:500,
        range: true,
        step: 1,
				scale:false,
				labels:false,
        onChange: function (vals) {
						var arr = vals.split(',');
						var yarr = [parseInt(arr[0]),parseInt(arr[1])];
						//console.log(yarr)
						drawChart(yarr);
						yearUpdated(yarr[0], yarr[1]);
        }
    });
});
