var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://www.arstechnica.com";
var SEARCH_WORD = "backdoored";
var MAX_PAGES_TO_VISIT = 50;

var pagesVisited={};
var numPagesVisited=0;
var pagesToVisit=[];
var url = new URL(START_URL);
var baseUrl=url.protocol+"//"+url.hostname;

pagesToVisit.push(START_URL); 
crawl();

function crawl(){
	if (numPagesVisited >= MAX_PAGES_TO_VISIT){
		console.log("Reached max limit of number of pages to visit.");
    return; 
	}
	var nextPage = pagesToVisit.pop(); 
	if (nextPage in pagesVisited){
		//we're aleady visited this page, so repeat the crawl
		crawl();		
	}else{
		// next page we havn't visited
		visitPage(nextPage,crawl); 
	}
}

function visitPage(url,callback){
	//add page to our set
	pagesVisited[url]=true;
	numPagesVisited++;

	//make the request
	console.log("Visiting page " + url);
    request(url,function(error,response,body){
	//check status code(200 is Http ok)
	console.log("Status code: " + response.statusCode);
	if (response.statusCode !== 200){
		callback();
		return;				 
	}
	//parse the document body
     var $=cheerio.load(body);
     var isWordFound=searchForWord($,SEARCH_WORD);
     if (isWordFound){
     	console.log('Word ' +SEARCH_WORD + 'found at page ' + url);
     }else{
     	collectInternalLinks($);
     	//in this short program,our callback is just calling crawl()
     	callback();
     }
   });
} 

function searchForWord($,word){
	 var bodyText = $('html > body').text().toLowerCase();
     return(bodyText.indexOf(word.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });
}

	