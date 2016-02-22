var request = require("request"), 
    cheerio = require("cheerio"),
    Q       = require("q");
    
//hardcoded for minato
var BASE_URL = "http://www.athome.co.jp/mansion/tokyo/minato-city/list/";
const MAX_ASYNC_REQ= 2; // don't want to get my IP black-listed
const WAIT_TIME=1; //wait these many seconds if requests are pending
var currentRequests=0;

function getAssetIdsInPageNicely(pageNo){
   var deferred = Q.defer();
  
   if(currentRequests<MAX_ASYNC_REQ) {
     deferred.resolve(getAssetIdsInPage(pageNo));
   }else{
     setTimeout(function(){
        deferred.resolve(getAssetIdsInPageNicely(pageNo));
     }, WAIT_TIME*1000);
   }
  
  return deferred.promise;
}


function getAssetIdsInPage(pageNo){
  var suffix='';
  if(pageNo>1){ suffix = 'page' + pageNo + '/'; }
  var deferred = Q.defer();
  
  currentRequests++;
  request(BASE_URL + suffix, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var assetIds = $("[data-bukken-no]").map(function(i, elem){
        return $(this).attr("data-bukken-no");
      });
      deferred.resolve(assetIds.get());
    } else {
      deferred.reject(new Error(error));
    }
    
    currentRequests--;
  }); 
  
  return deferred.promise;
}


exports.printAllAssetIds = function(pageNo){
  var promises = [];
  var assetIds = [];


  for(var i=0;i<pageNo;i++){
    var resultPromise = getAssetIdsInPageNicely(i+1);
    promises.push(resultPromise) ;

    resultPromise
    .then(function(response){
      Array.prototype.push.apply(assetIds, response);
    })
    .catch(function(error){
      console.log(error);
    })
    .done();
  }

  Q.all(promises).
  then(function(){
    console.log(assetIds.join(','));
  });

}

