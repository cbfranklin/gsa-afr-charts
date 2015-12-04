var fs = require('fs');

var incomeData, assetsData, income = {},
    assets = {}, allData = {};

fs.readFile(__dirname + '/json/income.json', 'utf8', function(err, data) {
    if (err) throw err;
    incomeData = JSON.parse(data)
    fs.readFile(__dirname + '/json/assets.json', 'utf8', function(err, data) {
        if (err) throw err;
        assetsData = JSON.parse(data)
        processData(incomeData, allData, 'incomeProcessedAll')
        processData(assetsData, allData, 'assetsProcessedAll')
    });
});

function processData(a, b, o) {
    //convert to nested json
    for (i in a) {
        var year = a[i]['Year'];
        if (!b[year]) b[year] = {};
        var category = a[i]['Category']
        if (!b[year][category]) b[year][category] = {};
        var fund = a[i]['Fund'];
        if (!b[year][category][fund]) b[year][category][fund] = {};
        var level1 = a[i]['Level 1'];
        var amount = parseFloat(a[i]['Amount'].replace('(', '-').replace(')', ''))
        if (!a[i]['Level 2']) {
            b[year][category][fund][level1] = amount;
        } else {
            var level2 = a[i]['Level 2'];
            if (!b[year][category][fund][level1]) b[year][category][fund][level1] = {};
            b[year][category][fund][level1][level2] = amount;
        }
    }

    //level 1 totals
    for (var year in b) {
        if (b.hasOwnProperty(year)) {
            //console.log(year)
            for (var type in b[year]) {
                if (b[year].hasOwnProperty(type)) {
                    //console.log(type)
                    for (var fund in b[year][type]) {
                        if (b[year][type].hasOwnProperty(fund)) {
                            //console.log(fund)
                            for (var level1 in b[year][type][fund]) {
                                if (b[year][type][fund].hasOwnProperty(level1)) {
                                    //console.log(level1)
                                    for (var level2 in b[year][type][fund][level1]) {
                                        if (b[year][type][fund][level1].hasOwnProperty(level2)) {
                                            //console.log(level2)
                                            //console.log(b[year][type][fund][level1][level2])
                                            if (!b[year][type][fund][level1].Total) b[year][type][fund][level1].Total = 0;
                                            b[year][type][fund][level1].Total += b[year][type][fund][level1][level2]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    //fund totals
    for (var year in b) {
        if (b.hasOwnProperty(year)) {
            //console.log(year)
            for (var type in b[year]) {
                if (b[year].hasOwnProperty(type)) {
                    //console.log(type)
                    for (var fund in b[year][type]) {
                        if (b[year][type].hasOwnProperty(fund)) {
                            //console.log(fund)
                            for (var level1 in b[year][type][fund]) {
                                if (b[year][type][fund].hasOwnProperty(level1)) {
                                    if (!b[year][type][fund].Total) b[year][type][fund].Total = 0;
                                    if (typeof b[year][type][fund][level1] === 'object') {
                                        b[year][type][fund].Total += b[year][type][fund][level1].Total
                                    } else {
                                        b[year][type][fund].Total += b[year][type][fund][level1]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    //type totals
    for (var year in b) {
        if (b.hasOwnProperty(year)) {
            //console.log(year)
            for (var type in b[year]) {
                if (b[year].hasOwnProperty(type)) {
                    //console.log(type)
                    for (var fund in b[year][type]) {
                        if (b[year][type].hasOwnProperty(fund)) {
                            //console.log(fund)
                            if (!b[year][type].Total) b[year][type].Total = 0;
                            b[year][type].Total += b[year][type][fund].Total
                        }
                    }
                }
            }
        }
    }

    fs.writeFile('json/' + o + '.json', JSON.stringify(b), function(err) {
        if (err) throw err;
        console.log('Saved');
    });
}