google.charts.load('current', {
    packages: ['corechart']
});
google.charts.setOnLoadCallback(googleReady);

var chartColors = {
    redWhiteBlue: ['#9D3E39', '#245286', '#999999'],
    monoBlue: ['#245286', '#58779A', '#3981D2', '#163353', '#78A2D2'],
    monoRed: ['#9D3E39', '#AD7673', '#E95C55', '#6A2A26', '#E99F9B'],
    monoWhite: ['#CCCCCC', '#A1A1A1', '#E5E5E5', '#C2C2C2', '#9C9C9C']
}


var currentChart = {
    isSubBreakdown: false
}



function googleReady() {
    /*$.when(getIncomeData(), getAssetsData()).done(function() {

    });*/
    console.log('Core Chart Lib Loaded...')
    populateYears();
    renderChart();
    $('#afr-data-type,#afr-data-breakdown,#afr-data-year').on('change', renderChart)
    $('#afr-back').on('click', renderChart)
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
    currentChart.isSubBreakdown = true;
    var textColor = 'white'
    if (fund === 'Federal Buildings Fund') {
        var colors = chartColors.monoRed
    }
    if (fund === 'Acquisition Services Fund') {
        var colors = chartColors.monoBlue
    }
    if (fund === 'Other Funds') {
        var colors = chartColors.monoWhite;
        textColor = 'black';
    }
    var backText = 'Back to Funds';
    $('#afr-back').text(backText).show();
    pieChart(title, type, arr, colors, textColor, false)
}

function renderChart() {
    currentChart.isSubBreakdown = false;
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
            if (data.hasOwnProperty(fund) && fund !== "Total") {
                arr.push([fund, AFRData[year][type][fund].Total])
            }
        }
        pieChart(title, type, arr, chartColors.redWhiteBlue, 'white', true)
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
                    arr.push([year, AFRData[year][subType1].Total * -1, AFRData[year][subType2].Total])
                }
            }
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
    for (year in AFRData) {
        if (AFRData.hasOwnProperty(year)) {
            years.push(year)
        }
    }
    years = years.sort().reverse();
    for (i in years) {
        $('#afr-data-year').append('<option value="' + years[i] + '">' + years[i] + '</option>')
    }
}

function pieChart(title, type, arr, colors, textColor, cursor) {

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Fund');
    data.addColumn('number', type);
    data.addRows(arr);

    var formatter = new google.visualization.NumberFormat({
        prefix: '$',
        suffix: 'M',
        fractionDigits: 0,
        negativeParens: true
    })

    formatter.format(data, 1);

    // Set chart options
    var options = {
        'title': title,
        'is3D': true,
        'fontName': 'Source Sans Pro',
        'colors': colors,
        'backgroundColor': {
            'fill': 'transparent'
        },
        'pieSliceText': 'value',
        'pieSliceTextStyle': {
            fontSize: 14,
            color: textColor
        },
        'tooltip': {
            'showColorCode': true
        },
        'titleTextStyle': {
            'fontSize': 18
        },
        'sliceVisibilityThreshold': 0
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('afr-chart'));
    chart.draw(data, options);
    google.visualization.events.addListener(chart, 'select', function() {
        if (currentChart.isSubBreakdown == false) {
            var selection = chart.getSelection()[0];
            console.log('hey')
            console.log(chart.getSelection())
            var label = data.getFormattedValue(selection.row, 0);
            renderSubBreakdown(label)
        }

    });
    if (cursor == true) {
        google.visualization.events.addListener(chart, 'onmouseover', cursorPointer);
        google.visualization.events.addListener(chart, 'onmouseout', cursorDefault);
    }

}

function columnChart(title, type, arr) {
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Fund');
    data.addColumn('number', type);
    data.addRows(arr);

    var formatter = new google.visualization.NumberFormat({
        prefix: '$',
        suffix: 'M',
        fractionDigits: 0,
        negativeParens: true
    })

    formatter.format(data, 1);

    // Set chart options
    var options = {
        'title': title,
        'fontName': 'Source Sans Pro',
        'colors': chartColors.redWhiteBlue
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

    var formatter = new google.visualization.NumberFormat({
        prefix: '$',
        suffix: 'M',
        fractionDigits: 0,
        negativeParens: true
    })

    formatter.format(data, 1);
    // Set chart options
    var options = {
        'title': title,
        'fontName': 'Source Sans Pro',
        'colors': chartColors.redWhiteBlue,
        'isStacked': 'true',
        'titleTextStyle': {
            'fontSize': 18
        },
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById('afr-chart'));
    chart.draw(data, options);
}

function cursorPointer() {
    $('#afr-chart').css('cursor', 'pointer')
}

function cursorDefault() {
    $('#afr-chart').css('cursor', 'default')
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
