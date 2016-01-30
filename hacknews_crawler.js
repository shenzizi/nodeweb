var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var jsonfile = require('jsonfile');

var jsonarray=[];

for (var i=2;i<5;i++){
  request("https://news.ycombinator.com/news?p="+ i, function(error, response, body) {
    if(error) {
      console.log("Error: " + error);
    }
    console.log("Status code: " + response.statusCode);

    var $ = cheerio.load(body);
    //var jsonarray=[];
    $('tr.athing:has(td.votelinks)').each(function( index ) {
      var obj={}; 
      var title = $(this).find('td.title > a').text().trim();
      var link = $(this).find('td.title > a').attr('href');
      obj.title=title;
      obj.link=link;
      jsonarray.push(obj)
    });//.each
     var file='C:/Users/zihyu/nodeweb/data/hackernews.json'
     var jsonobj={data:jsonarray}
     jsonfile.writeFile(file, jsonobj,{spaces: 2}, function (err) {
     console.error(err)
     });//function(err)
  });//request
};//for

