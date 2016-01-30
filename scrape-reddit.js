var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var jsonfile = require('jsonfile');
var jsonarray=[];

request("https://www.reddit.com", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  console.log("Status code: " + response.statusCode);

  var $ = cheerio.load(body);
  //var jsonarray=[];
  $('div#siteTable > div.link').each(function( index ) {
    var obj={};
    var title = $(this).find('p.title > a.title').text().trim();
    var score = $(this).find('div.score.unvoted').text().trim();
    var user = $(this).find('a.author').text().trim();
    obj.title=title;
    obj.score=score;
    obj.user=user;
    jsonarray.push(obj)
  });//.each
  var file='C:/Users/zihyu/nodeweb/data/data.json'
  var jsonobj={data:jsonarray}
  jsonfile.writeFile(file, jsonobj,{spaces: 2}, function (err) {
  console.error(err)
  });//.function(err)
});//request

