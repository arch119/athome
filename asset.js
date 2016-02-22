
var request = require('request'), 
    cheerio = require('cheerio'),
    Q       = require('q'),
    fs      = require('fs'),
    he      = require('he');

var BASE_URL = 'http://www.athome.co.jp/mansion/';

var FIELD_MAP = [
  'transport',
  'transport2',
  'location',
  'type',
  'price',
  'price_per_sqm',
  'mgmt_fee',
  'sinking_ffee',
  '*',
  '*',
  'deposit',
  'maintenance',
  'other_fees',
  '*',
  'building_name',
  'facility',
  'remarks',
  'layout',
  'area',
  'balcony_area',
  'floor',
  'building_structure',
  'year_of_construction',
  'total_assets'
];

function getAllDetails(body){
  var $ = cheerio.load(body);
  var tables = $('section#item-detail_data .left .dataTbl');
  var result = {};
  
  //The first table is a bit tricky
  var firstTable = tables.get(0);
  if($(firstTable).find('tr').length === 3) { FIELD_MAP.splice(1,1);}
  
  tables.find('tr').find('td').each(function(i, elem){
    var data = $(elem).text().replace(/\s+/g,'');
    if(i<FIELD_MAP.length) { result[FIELD_MAP[i]] = data ;}
  });
  
  console.log(result);
}


exports.getAssetDetails = function(assetId){
  var deferred = Q.defer();
  var assetUrl = BASE_URL+assetId+'/';
  
  request(assetUrl , function (error, response, body) {
    if (!error) {
      getAllDetails(body);
      deferred.resolve([]);
      
    } else {
      deferred.reject(new Error(error));
    }
  }); 
  
  return deferred.promise;
};


exports.saveAssetDetails = function(assetId, fileName){
  var assetUrl = BASE_URL+assetId+'/';
  request(assetUrl).pipe(fs.createWriteStream(fileName));
};


exports.getAssetDetailsFrom = function(fileName){
  fs.readFile(fileName, 'utf8', (err, data) => {
    if(err) throw err;
    getAllDetails(data);
  });
  
};