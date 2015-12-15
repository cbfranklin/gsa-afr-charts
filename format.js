var fs = require('fs');
var XLSX = require('xlsx')

var income = {},
    assets = {},
    all = {};

var workbook = XLSX.readFile('xls/FinancialData2015_-_FY15_data.xlsx');
//console.log(workbook.SheetNames)

var incomeData = XLSX.utils.sheet_to_json(workbook.Sheets['Net Income(Cost)']);
var assetsData = XLSX.utils.sheet_to_json(workbook.Sheets['Net Assets(Liabilities)']);

var allData = incomeData.concat(assetsData);

//processData(incomeData, income, 'income')
//processData(assetsData, assets, 'assets')
processData(allData, all, 'all')

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
        if(typeof a[i].Amount == 'undefined'){ a[i].Amount = '0'; console.log('Undefined value in :',year,category,fund,level1,':','replaced with zero.')}
        var amount = parseFloat(a[i].Amount.replace('(', '').replace(')', '').replace(',', ''))
        if (!a[i]['Level 2']) {
            b[year][category][fund][level1] = amount;
        } else {
            var level2 = a[i]['Level 2'];
            if (!b[year][category][fund][level1]) {
                b[year][category][fund][level1] = {}
            }
            b[year][category][fund][level1][level2] = amount;
        }
    }

    //level 1 totals
    for (var year in b) {
        if (b.hasOwnProperty(year)) {
            for (var type in b[year]) {
                if (b[year].hasOwnProperty(type)) {
                    for (var fund in b[year][type]) {
                        if (b[year][type].hasOwnProperty(fund)) {
                            for (var level1 in b[year][type][fund]) {
                                if (b[year][type][fund].hasOwnProperty(level1) && level1 !== 'Total') {
                                    for (var level2 in b[year][type][fund][level1]) {
                                        if (b[year][type][fund][level1].hasOwnProperty(level2)) {
                                            if (!b[year][type][fund][level1].Total) {
                                                b[year][type][fund][level1].Total = 0
                                            }
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
            for (var type in b[year]) {
                if (b[year].hasOwnProperty(type)) {
                    for (var fund in b[year][type]) {
                        if (b[year][type].hasOwnProperty(fund)) {
                            for (var level1 in b[year][type][fund]) {
                                if (b[year][type][fund].hasOwnProperty(level1) && level1 !== 'Total') {
                                    if (!b[year][type][fund].Total) {
                                        b[year][type][fund].Total = 0
                                    }
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
            for (var type in b[year]) {
                if (b[year].hasOwnProperty(type)) {
                    for (var fund in b[year][type]) {
                        if (b[year][type].hasOwnProperty(fund) && fund !== 'Total') {
                            if (!b[year][type].Total) {
                                b[year][type].Total = 0
                            }
                            b[year][type].Total += b[year][type][fund].Total
                        }
                    }
                }
            }
        }
    }

    fs.writeFile('json/' + o + '.json', JSON.stringify(b), function(err) {
        if (err) throw err;
        console.log('Saved',o+'.json');
    });
}