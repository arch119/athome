var Asset   = require("./asset.js");
var AssetIds   = require("./assetIds.js");


//dump AssetIds of Minato (upto page 5)
AssetIds.printAllAssetIds(5);

//dump details of an Asset
Asset.getAssetDetails(1020057719);