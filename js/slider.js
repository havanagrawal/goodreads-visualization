$(document).ready(function(){

	var slider = new rSlider(
		{
        target: '#slider',
        values: {min:1980,max:2017},
				width:630,
        range: true,
        step: 1,
				scale:false,
				labels:false,
        onChange: function (vals) {
						inputControlUpdateHandler();
        }
    });
});
