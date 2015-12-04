$(function(){
	$('#afr-data-type,#afr-data-breakdown,#afr-data-year').on('change',renderChart)
})

function renderChart(){
	var type = $('#afr-data-type').val();
	var breakdown = $('#afr-data-beakdown').val();
	var year = $('#afr-data-year').val();

	 // Load the Visualization API and the piechart package.
      google.load('visualization', '1.0', {'packages':['corechart']});

      // Set a callback to run when the Google Visualization API is loaded.
      google.setOnLoadCallback(drawChart);

      function drawPieChart() {

        // Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('string', );
        data.addColumn('number', );
        data.addRows();

        // Set chart options
        var options = {'title':'How Much Pizza I Ate Last Night',
                       'width':400,
                       'height':300};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
      }

}