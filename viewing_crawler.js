var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var iconv = require('iconv-lite');
var jsonfile = require('jsonfile');


var SEARCH_WORD = ["新聞龍捲風","新聞面對面","正晶限時批","新台灣加油"];
for (var date=160125;date<160127;date++){
  request({url:"http://www1.xkm.com.tw/HTML/tw/hr/DATA/HR"+date+".htm",encoding:null}, function(error, response, body) {
    if(error) {
      console.log("Error: " + error);
    }
    console.log("Status code: " + response.statusCode);
    
    var str = iconv.decode(new Buffer(body), "big5");//the webpage encoding is big5,decode as big5
    var body=iconv.encode(str,"utf8")//encode as utf-8

    var $ = cheerio.load(body);
    searchForWord($,date,SEARCH_WORD)
  });//request
};//for
function searchForWord($,date,search_word){
  var bodyText = $('tr').text(); 
  var jsonarray=[];
  for (var i=0;i<search_word.length;i++){
    var obj={}; 
    var word=search_word[i]
    var foundin = $('tr:contains('+word +')').text().trim();
    if (foundin.length>0){
    foundin=foundin.split("\r\n");
    obj.ranking=foundin[0].replace(/\s+/g, '')
    obj.channel=foundin[1].replace(/\s+/g, '')
    obj.name=foundin[2].replace(/\s+/g, '')
    obj.time=foundin[3].replace(/\s+/g, '')
    obj.viewing=foundin[4].replace(/\s+/g, '')
    obj.cpm=foundin[5].replace(/\s+/g, '')
    obj.adcost=foundin[6].replace(/\s+/g, '')
    jsonarray.push(obj) 
    }else{
      console.log(date+word+"nofound")
    }//if
  }//for
     var file='C:/Users/zihyu/nodeweb/data/viewing'+date+'.json'
     var jsonobj={data:jsonarray}
     jsonfile.writeFile(file, jsonobj,{spaces: 2}, function (err) {
     console.error(err)
   });
}//function
