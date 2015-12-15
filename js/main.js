google.charts.load('current', {
    packages: ['corechart']
});
google.charts.setOnLoadCallback(googleReady);

var isSubBreakdown = false;

function googleReady() {
    /*$.when(getIncomeData(), getAssetsData()).done(function() {

    });*/
    console.log('Core Chart Lib Loaded...')
    populateYears();
    renderChart();
    $('#afr-data-type,#afr-data-breakdown,#afr-data-year').on('change', renderChart)
    $('#afr-back').on('click',renderChart)
}

function renderSubBreakdown(fund) {
    var type = $('#afr-data-type').val();
    var year = parseFloat($('#afr-data-year').val());
    var breakdown = $('#afr-data-breakdown').val();
    var data = AFRData[year][type][fund];
    var title = fund + ' ' + type + ' ' + breakdown + ', ' + year;
    var arr = [];
    for (subFund in data) {
        if (data.hasOwnProperty(subFund) && subFund !== "Total") {
            arr.push([subFund, AFRData[year][type][fund][subFund]])
        }
    }
    console.log(arr)
    isSubBreakdown = true;
    var backText = 'Back to ' + type + ' ' + breakdown;
    $('#afr-back').text(backText).show();
    pieChart(title, type, arr)
}

function renderChart() {
    isSubBreakdown = false;
    var type = $('#afr-data-type').val();
    //enable & disable controls where necessary
    $('#afr-back').hide();
    if (type === 'Net Cost' || type === 'Net Position') {
        $('#afr-data-year').attr('disabled', 'disabled').append('<option value="NA">N/A</option>').find('[value="NA"]').attr('selected', 'selected')
        $('#afr-data-breakdown').attr('disabled', 'disabled').find('[value="Over Time"]').attr('selected', 'selected')
    } else {
        $('#afr-data-year').removeAttr('disabled').find('[value="NA"]').remove()
        $('#afr-data-breakdown').removeAttr('disabled')
    }

    var breakdown = $('#afr-data-breakdown').val();
    //sort by breakdown
    if (breakdown === 'By Fund') {
        $('#afr-data-year').removeAttr('disabled')
        var year = parseFloat($('#afr-data-year').val());
        var title = type + ' ' + breakdown + ', ' + year;
        var data = AFRData[year][type];
        var arr = [];
        for (fund in data) {
            if (data.hasOwnProperty(fund)) {
                arr.push([fund, AFRData[year][type][fund].Total])
            }
        }
        pieChart(title, type, arr)
    }
    if (breakdown === 'Over Time') {
        $('#afr-data-year').attr('disabled', 'disabled')
        var title = type + ' ' + breakdown;
        if (type === 'Net Cost' || type === 'Net Position') {
            var data = AFRData;
            var arr = [];
            if (type === 'Net Cost') {
                var subType1 = 'Expenses',
                    subType2 = 'Revenues';
            }
            if (type === 'Net Position') {
                var subType1 = 'Liabilities',
                    subType2 = 'Assets';
            }
            for (year in data) {
                if (data.hasOwnProperty(year)) {
                    arr.push([year, AFRData[year][subType2].Total, AFRData[year][subType1].Total * -1])
                }
            }
            console.log(arr)
            doubleColumnChart(title, subType1, subType2, arr)
        } else {
            var data = AFRData;
            var arr = [];
            for (year in data) {
                if (data.hasOwnProperty(year)) {
                    arr.push([year, AFRData[year][type].Total])
                }
            }
            columnChart(title, type, arr)
        }
    }
}

function populateYears() {
    var years = [];
    console.log(AFRData)
    for (year in AFRData) {
        if (AFRData.hasOwnProperty(year)) {
            years.push(year)
        }
    }
    years = years.sort().reverse();
    console.log('Added Years:', years)
    for (i in years) {
        $('#afr-data-year').append('<option value="' + years[i] + '">' + years[i] + '</option>')
    }
}

function pieChart(title, type, arr) {

    console.log('Pie Chart...')

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Fund');
    data.addColumn('number', type);
    data.addRows(arr);

    // Set chart options
    var options = {
        'title': title,
        'is3D': true,
        'fontName': 'Source Sans Pro'
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('afr-chart'));
    chart.draw(data, options);
    google.visualization.events.addListener(chart, 'select', function() {
        if(isSubBreakdown == false){
           var selection = chart.getSelection()[0];
        var label = data.getFormattedValue(selection.row, 0);
        console.log(label)
        renderSubBreakdown(label) 
        }
        
    });
}

function columnChart(title, type, arr) {
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Fund');
    data.addColumn('number', type);
    data.addRows(arr);

    // Set chart options
    var options = {
        'title': title,
        'fontName': 'Source Sans Pro'
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById('afr-chart'));
    chart.draw(data, options);
}

function doubleColumnChart(title, subType1, subType2, arr) {
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');
    data.addColumn('number', subType1);
    data.addColumn('number', subType2);
    data.addRows(arr);

    // Set chart options
    var options = {
        'title': title,
        'fontName': 'Source Sans Pro'
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById('afr-chart'));
    chart.draw(data, options);
}
/*
function getIncomeData() {
    return $.ajax({
            url: '',
        }).done(function(data) {

        })
        .fail(function() {

        })
}

function getAssetsData() {
    return $.ajax({
            url: '',
        }).done(function(data) {

        })
        .fail(function() {

        })
}
*/