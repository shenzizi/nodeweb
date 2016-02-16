function processdata_click(data,button){
  function processdata(){
   var dataset=[],dataname=[],radiuses=[]; 
   for (var i=0;i<data.data.docs.length;i++){ 
    var obj={};
    obj.name=data.data.docs[i].v
    obj.size=data.data.docs[i].occs
    dataset.push(obj)
  }

     // sort name by size
       /*function sortByKey(array, key) {
          return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          });
}*/
     //dataset = sortByKey(dataset, 'size').reverse();
     //retrieve the object key&values,save name as an array and size as another array
     for (var i=0;i<dataset.length;i++){
      var name=dataset[i].name,size=dataset[i].size
      dataname.push(name)
      radiuses.push(size)
    }
    console.log(dataname,radiuses)
    return [dataname,radiuses]
  }
     //$(button).click(function (e) {
      var name=processdata(data)[0],
      size=processdata(data)[1]
      window.onload = draw(name,size);
     //});  
};

    /*processdata_click(top10_data,'#top10')
    processdata_click(top15_data,'#top15')
    processdata_click(top20_data,'#top20')
    processdata_click(top28_data,'#top28')*/


    //Get the canvas & context 
    var c = $('#canvas');
    var ct = c.get(0).getContext('2d');
    var container = $(c).parent()
    var container = $(c).parent().parent().parent();//var container=$(divid)
    /*$(window).resize( respondCanvas );

    function respondCanvas(){ 
        c.attr('width', $(container).width() ); //max width
        c.attr('height', $(container).height() ); //max height
    }
    //Initial call 
    respondCanvas();*/
    $(window).resize( function(){ 
        c.attr('width', $(container).width() ); //max width
        c.attr('height', $(container).height() );//max height
        processdata_click(top20_data,'#top20') 
      }); 
    
    //});//document.ready

// ===========================
// ancillary geometric classes
// ===========================
var Point = function (x, y)
{
  this.x = x;
  this.y = y;
}

Point.prototype = {
  dist: function (p) { return this.vect(p).norm(); },
  vect: function (p) { return new Point (p.x-this.x, p.y-this.y); },
  norm: function (p) { return Math.sqrt (this.x*this.x+this.y*this.y);},
  add : function (v) { return new Point (this.x + v.x, this.y + v.y);},
  mult: function (a) { return new Point (this.x * a, this.y * a);}
};
var Circle = function (radius, center)
{
  this.r = radius;
  this.c = center;
};

Circle.prototype = {
  surface:  function () { return Math.PI * this.r * this.r; },
  distance: function (circle) { return this.c.dist(circle.c) - this.r - circle.r; }
};


// =========================
// circle packer lives here!
// =========================
var Packer = function (circles, ratio)
{
  this.circles = circles;
  this.ratio   = ratio || 1;
  this.list = this.solve();
}

Packer.prototype = {
    // try to fit all circles into a rectangle of a given surface
    compute: function (surface)
    {
        // check if a circle is inside our rectangle
        function in_rect (radius, center)
        {
          if (center.x - radius < - w/2) return false;
          if (center.x + radius >   w/2) return false;
          if (center.y - radius < - h/2) return false;
          if (center.y + radius >   h/2) return false;
          return true;
        }

        // approximate a segment with an "infinite" radius circle
        function bounding_circle (x0, y0, x1, y1)
        {
          var xm = Math.abs ((x1-x0)*w);
          var ym = Math.abs ((y1-y0)*h);
          var m = xm > ym ? xm : ym;
          var theta = Math.asin(m/4/bounding_r);
          var r = bounding_r * Math.cos (theta);
          return new Circle (bounding_r, 
            new Point (r*(y0-y1)/2+(x0+x1)*w/4, 
             r*(x1-x0)/2+(y0+y1)*h/4));
        }
        
        // return the corner placements for two circles
        function corner (radius, c1, c2)
        {
            var u = c1.c.vect(c2.c); // c1 to c2 vector
            var A = u.norm();
            if (A == 0) return [] // same centers
            u = u.mult(1/A); // c1 to c2 unary vector
            // compute c1 and c2 intersection coordinates in (u,v) base
            var B = c1.r+radius;
            var C = c2.r+radius;
            if (A > (B + C)) return []; // too far apart
            var x = (A + (B*B-C*C)/A)/2;
            var y = Math.sqrt (B*B - x*x);
            var base = c1.c.add (u.mult(x));
            
            var res = [];
            var p1 = new Point (base.x -u.y * y, base.y + u.x * y);
            var p2 = new Point (base.x +u.y * y, base.y - u.x * y);
            if (in_rect(radius, p1)) res.push(new Circle (radius, p1));
            if (in_rect(radius, p2)) res.push(new Circle (radius, p2));
            return res;
          }

        /////////////////////////////////////////////////////////////////
        
        // deduce starting dimensions from surface
        var bounding_r = Math.sqrt(surface) * 100; // "infinite" radius
        var w = this.w = Math.sqrt (surface * this.ratio);
        var h = this.h = this.w/this.ratio;
        
        // place our bounding circles
        var placed=[
        bounding_circle ( 1,  1,  1, -1),
        bounding_circle ( 1, -1, -1, -1),
        bounding_circle (-1, -1, -1,  1),
        bounding_circle (-1,  1,  1,  1)];
        
        // Initialize our rectangles list
        var unplaced = this.circles.slice(0); // clones the array
        while (unplaced.length > 0)
        {
            // compute all possible placements of the unplaced circles
            var lambda = {};
            var circle = {};
            for (var i = 0 ; i != unplaced.length ; i++)
            {
              var lambda_min = 1e10;
              lambda[i] = -1e10;
                // match current circle against all possible pairs of placed circles
                for (var j = 0   ; j < placed.length ; j++)
                  for (var k = j+1 ; k < placed.length ; k++)
                  {
                    // find corner placement
                    if (k > 3) {
                      zog=1;
                    }
                    var corners = corner (unplaced[i], placed[j], placed[k]);

                    // check each placement
                    for (var c = 0 ; c != corners.length ; c++)
                    {
                        // check for overlap and compute min distance
                        var d_min = 1e10;
                        for (var l = 0 ; l != placed.length ; l++)
                        {
                            // skip the two circles used for the placement
                            if (l==j || l==k) continue;

                            // compute distance from current circle
                            var d = placed[l].distance (corners[c]);
                            if (d < 0) break; // circles overlap
                            
                            if (d < d_min) d_min = d;
                          }
                        if (l == placed.length) // no overlap
                        {
                          if (d_min < lambda_min)
                          {
                            lambda_min = d_min;
                            lambda[i] = 1- d_min/unplaced[i];
                            circle[i] = corners[c];
                          }
                        }
                      }
                    }
                  }

            // select the circle with maximal gain
            var lambda_max = -1e10;
            var i_max = -1;
            for (var i = 0 ; i != unplaced.length ; i++)
            {
              if (lambda[i] > lambda_max)
              {
                lambda_max = lambda[i];
                i_max = i;
              }
            }
            
            // failure if no circle fits
            if (i_max == -1) break;
            
            // place the selected circle
            unplaced.splice(i_max,1);
            placed.push (circle[i_max]);
          }

        // return all placed circles except the four bounding circles
        this.tmp_bounds = placed.splice (0, 4);
        return placed;
      },

    // find the smallest rectangle to fit all circles
    solve: function ()
    {
        // compute total surface of the circles
        var surface = 0;
        for (var i = 0 ; i != this.circles.length ; i++)
        {
          surface += Math.PI * Math.pow(this.circles[i],2);
        }
        
        // set a suitable precision
        var limit = surface/1000;
        var step = surface/2;
        var res = [];
        while (step > limit)
        {
          var placement = this.compute.call (this, surface);
          console.log ("placed",placement.length,"out of",this.circles.length,"for surface", surface);
          if (placement.length != this.circles.length)
          {
            surface += step;
          }
          else
          {
            res = placement;
            this.bounds = this.tmp_bounds;
            surface -= step;
          }
          step /= 2;
        }
        return res; 
      }
    };

// ====
// demo
// ====

var fillcolor=["#1f77b4","#aec7e8"," #ff7f0e","#ffbb78","#2ca02c","#98df8a"," #d62728"," #ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94","#e377c2","#f7b6d2","#7f7f7f", "#637939","#bcbd22","#dbdb8d","#17becf","#9edae5","#393b79","#c7c7c7","#8c6d31", "#ad494a"," #7b4173","#ce6dbd"," #cedb9c","#9c9ede","#e7ba52","#ad494a","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue","blue"]

function draw_result (packer)
{   
  var xyposition=[];
  var topleftposition=[];
  var circlesg=[];
  function draw_circle(circle)
  {   
    var circlesgobj={}; 
    ctx.font = "10px Arial";
        //ctx.globalAlpha=0.5;
        ctx.beginPath();
        ctx.arc((circle.c.x+dx)*zoom+mx, (circle.c.y+dy)*zoom+my, circle.r*zoom, 0, 2*Math.PI);
        xyposition.push((circle.c.x+dx)*zoom+mx, (circle.c.y+dy)*zoom+my);      
        ctx.fillStyle=fillcolor[i];  
        ctx.fill();
        ctx.fillStyle="black";
        //ctx.fillText(dataname[i],(circle.c.x+dx)*zoom+mx, (circle.c.y+dy)*zoom+my)
        circlesgobj.left=(circle.c.x+dx)*zoom+mx- circle.r*zoom;
        circlesgobj.right=(circle.c.x+dx)*zoom+mx+ circle.r*zoom;
        circlesgobj.top=(circle.c.y+dy)*zoom+my- circle.r*zoom;
        circlesgobj.bottom=(circle.c.y+dy)*zoom+my+ circle.r*zoom;
        circlesgobj.x=Math.floor((circle.c.x+dx)*zoom+mx);
        circlesgobj.y=Math.floor((circle.c.y+dy)*zoom+my);
        circlesgobj.r=Math.floor(circle.r*zoom)
        topleftposition.push(circlesgobj.left+33,circlesgobj.top+20)
        //circlesgobj.name=dataname[i];
        circlesg.push(circlesgobj)               
      }

      var canvas = document.getElementById ('canvas');
      var ctx = canvas.getContext("2d");
    canvas.width +=0; // clear canvas
    var margin_factor = 0; //the magin b/w the canvas & rect
    
    var mx = canvas.width * margin_factor / 2;
    var my = canvas.height* margin_factor / 2;
    var dx = packer.w/2;
    var dy = packer.h/2;
    var zx = canvas.width  * (1-margin_factor) / packer.w;
    var zy = canvas.height * (1-margin_factor) / packer.h;
    var zoom = zx < zy ? zx : zy;
    
    
    // draw all circles
    for (var i = 0 ; i != packer.list.length ; i++){
      draw_circle (packer.list[i]);
    }
    

    // draw bounding circles
    //ctx.strokeStyle = 'red';
    //for (var i = 0 ; i != packer.bounds.length ; i++)
        //draw_circle (packer.bounds[i]);/*cancel the border width
        
    // draw rectangle
    ctx.strokeStyle = '#530890';
    ctx.beginPath();
    ctx.rect((-packer.w/2+dx)*zoom+mx, (-packer.h/2+dy)*zoom+my, packer.w*zoom, packer.h*zoom);
    ctx.closePath();
    ctx.stroke();

    //filltext, line break
    /*for (var i=0;i<dataname.length;i++){
      var datanamei = dataname[i].split(' ')
      for (var j = 0; j<datanamei.length; j++){
        ctx.fillText(datanamei[j],xyposition[i*2],xyposition[i*2+1]+(j*15))
      }
    }
    console.log(circlesg) 
    console.log(xyposition)*/

   function mapping_r_name(data){
     var circle_r=_.pluck(circlesg,"r"); 
     var circle_x=_.pluck(circlesg,"x"); 
     var circle_y=_.pluck(circlesg,"y");
     var circle_r_index=circle_r.concat().sort()
     circle_r_index.sort(function(x, y){return x-y})
     var circle_indexarray=[];
     for (i=0;i<circle_r.length;i++){
       circle_indexarray.push(circle_r_index.indexOf(circle_r[i]))
     }
     var dataset_order=[]
     for (var i=0;i<data.data.docs.length;i++){ 
      var obj={};
      obj.name=data.data.docs[i].v
      obj.size=data.data.docs[i].occs
      dataset_order.push(obj)
    }
    var name=_.pluck(dataset_order,"name");
    var size=_.pluck(dataset_order,"size");
    var dataset_r_index=size.concat().sort()
    dataset_r_index.sort(function(x, y){return x-y})
    var dataset_indexarray=[]; 
    for (i=0;i<size.length;i++){
     dataset_indexarray.push(dataset_r_index.indexOf(size[i]))
    }
    for (var i=0;i<dataset_order.length;i++){
      dataset_order[i].size=dataset_indexarray[i]
    }  
    //console.log(circle_indexarray,dataset_order)
    var items=dataset_order; 
    var sorting = circle_indexarray; 
    var name_result = []
    sorting.forEach(function(key) {
      var found = false;
      items = items.filter(function(item) {
        if(!found && item.size == key) {
            name_result.push(item);
            found = true;
            return false;
        } else 
            return true;
     })
    })
    var name_order=_.pluck(name_result,"name")
    console.log(name_order,dataset_order)
    return name_order
  }; 
   
   var name_order=mapping_r_name(top20_data);

  //filltext, line break
    for (var i=0;i<name_order.length;i++){
      circlesg[i].name=name_order[i]
      var datanamei = name_order[i].split(' ')
      for (var j = 0; j<datanamei.length; j++){
        if (circlesg[i].r<80 && datanamei.length>2){
          ctx.fillText(datanamei[j],topleftposition[i*2],topleftposition[i*2+1]+(j*15))
        }else{
          ctx.fillText(datanamei[j],xyposition[i*2],xyposition[i*2+1]+(j*15))
        }
      }
    }
    console.log(circlesg) 
    console.log(xyposition)
   
   function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
  }
   $('#canvas').click(function(e) {
    var pos = findPos(this);
    var clickedX = e.pageX - pos.x;
    var clickedY = e.pageY - pos.y;
    console.log(clickedX,clickedY)
    for (var i = 0; i < circlesg.length; i++) {
            console.log(circlesg.length)
            var x =  clickedX -circlesg[i].x;
            var y =  clickedY -circlesg[i].y;
            var dist = Math.sqrt(y*y + x*x);
        if (dist<circlesg[i].r) {
         alert(circlesg[i].name)
        }
    }
  }); 
  //return circlesg;
   /*$('#canvas').click(function (e) {
    //var container_height=$(".test").outerHeight()-$('#canvas').height(); 
    var clickedX = e.pageX - this.offsetLeft;
    var clickedY = e.pageY - this.offsetTop;
    console.log(clickedX,clickedY)
      for (var i = 0; i < circlesg.length; i++) {
            console.log(circlesg.length)
            var x =  clickedX -circlesg[i].x;
            var y =  clickedY -circlesg[i].y;
            var dist = Math.sqrt(y*y + x*x);
        if (dist<circlesg[i].r) {
         alert(circlesg[i].name)
        }
      }
      //for (var i = 0; i < circlesg.length; i++) {
        //if (clickedX < circlesg[i].right && clickedX > circlesg[i].left && clickedY > circlesg[i].top && clickedY < circlesg[i].bottom) {
         //alert(circlesg[i].name)
       //}
     //}
   });*/
 }

 function draw (name,size){
  console.log(name,size)
  dataname=name;
  radiuses= size;
  console.log(radiuses)
  var circles=radiuses.length;
  var min_r=Math.min(...radiuses);
  var max_r=Math.max(...radiuses); 
  var Rscale = d3.scale.linear()
  .domain([min_r, max_r])
  .range([10, 50]); 
  radiuses=radiuses.map(function(size){
    return Rscale(size)
  })
  var c = $('#canvas');
  var ct = c.get(0).getContext('2d');
  var container = $(c).parent()
  var rwdwidth=$(container).width();
  var rwdheight=$(container).height();
  console.log(container,rwdwidth,rwdheight)
    //var ratio=rwdwidth/rwdheight<1.5?rwdwidth/rwdheight:1.5;
    ratio=rwdwidth/rwdheight; 
    console.log(ratio)
    var packer = new Packer (radiuses, ratio);
    draw_result(packer);  
  }
  processdata_click(top20_data,'#top20')