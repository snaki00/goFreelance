var express = require("express"),
    routes  = express.Router();
    
var Post    = require("../models/post"),
    User    = require("../models/user"),
    Comment = require("../models/comment");


var middleware = require("../middleware/logged.js");



routes.get("/", function(req, res){
    var page = 1,
        searchString = '',
        searchOnly = '',
        sorting = 1,
        isR = true;
    if(req.query.s){ 
        searchString += "&s=" + req.query.s; 
        searchOnly = req.query.s;
    }
    if(req.query.r){ 
        searchString += "&r=" + req.query.r; 
        sorting = req.query.r;
    } 
    if (req.query.s && req.query.r ==  undefined){
        console.log(req.query.s + " - " + req.query.r)
        sorting = -1;
    }
    if(req.query.p){ 
        page = req.query.p;
    }
    var params = {
        sort : sorting,
        search : searchString,
        searchOnly : searchOnly,
        isR : isR
    };
    Post.find({}, function(err, item){
        var items = new Array,
            item2 = item;
        if(err){
            console.log("error");
        } else {
             if(req.query.s){
                item = [];
                var rel = [0];
                item2.forEach(function(post){
                    var relevancy = search(post, req.query.s);
                   if ( relevancy > 0){
                        for(var i = 0; i <= items.length; i++){
                            if(rel[i] <= relevancy){
                                rel.splice(i, 0, relevancy);
                                item.splice(i, 0, post);
                                break;
                            }
                        }
                   }
                 });
                 
                // res.render("offers/offers", {posts: items, page: page, params: params});
            } 
            var price = [-1];
            var date = [0];
            var bids = [0];
            
            item.forEach(function(post){
                //TODO: clean this mess ...
                
                switch(Number(sorting)) {
                    case 0:
                        for(var i = 0; i < items.length; i++){
                            if(date[i] >= post.date.getTime() ){
                                break;
                            }
                        }
                        date.splice(i, 0, post.date.getTime());
                        items.splice(i, 0, post);

                        break;    
                    case 1:
                            for(var i = 0; i <= items.length; i++){
                                if(date[i] <= post.date.getTime()){
                                    date.splice(i, 0, post.date.getTime());
                                    items.splice(i, 0, post);
                                    break;
                                }
                            }
                        break;
                    case 2:
                        for(var i = 0; i < items.length; i++){
                            if(price[i] >= post.price ){
                                break;
                            }
                        }
                        price.splice(i, 0, post.price);
                        items.splice(i, 0, post);

                        break;    
                    case 3:
                            for(var i = 0; i <= items.length; i++){
                                if(price[i] <= post.price){
                                    price.splice(i, 0, post.price);
                                    items.splice(i, 0, post);
                                    break;
                                }
                                
                            }
                        break;
                    case 4:
                        for(var i = 0; i < items.length; i++){
                            if(bids[i] >= post.comments.length ){
                                break;
                            }
                        }
                        bids.splice(i, 0, post.comments.length);
                        items.splice(i, 0, post);

                        break;    
                    case 5:
                            for(var i = 0; i <= items.length; i++){
                                console.log(bids[i] + '' + post.comments.length);
                                if(bids[i] <= post.comments.length){
                                    bids.splice(i, 0, post.comments.length);
                                    items.splice(i, 0, post);
                                    break;
                                }
                                
                            }
                        break;
                    default:
                        items.push(post);
                }
                
            });
            res.render("offers/offers", {posts: items, page: page, params: params});
        }
    });
});

routes.post("/", middleware.isLoggedIn, function(req, res){
    if( req.body.title == "" || req.body.descr == "" || req.body.price == ""){
        res.redirect("/offers/new");
    } else {
        Post.create({
            author: req.user.username,
            title: req.body.title,
            descr: req.body.descr,
            price: req.body.price,
            date : Date.now()
        }, function(err, item){
            if(err){
                console.log("error");
                res.render("offers/new");
            } else {
                res.render("offers/show", {post: item, status: false});
            }
        });
    }
});

routes.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("offers/new");
});





function search(object, wordRequest){
    var relevancy = false;
    var text = object.title.split(" ");
    text.push.apply(text, object.descr.split(" "));
    wordRequest = wordRequest.split(" ");
    wordRequest.forEach(function(wordRequested){
        text.forEach(function(word){
            word = word.replace(/,|\.|\?|!|\"/g, "");
           if(word.toLowerCase() == wordRequested.toLowerCase()){
                relevancy++;
           }
        });
    });
    return relevancy;
}



module.exports = routes;