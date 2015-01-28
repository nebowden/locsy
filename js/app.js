$(document).ready( function() {
var etsyKey = "lw0y75472kxputmk49tlocx6";

var clearResults = function() {
	$(".loc-image-subcontainer").html("");
	$(".etsy-images").html("");
	$(".etsy-container").addClass("hidden");
}

var showLocImages = function(locImage) {

	var resultLoc = $('.templates .result-loc').clone();

	var imageElem = resultLoc.find('.loc-image');
	imageElem.attr('src', locImage.image.square);

	var linkElem = resultLoc.find('.loc-link');
	if(locImage.subjects===null) {
	linkElem.attr('data-subject', locImage.title);
	} else {
	linkElem.attr('data-subject', locImage.subjects);};

	return resultLoc;
};

var getLocImages = function(keyword) {
	var locParams = {
		q: keyword,
		fo: 'json',
		c: 50
	};

	var result = $.ajax({
		url: "http://loc.gov/pictures/search",
		data: locParams,
		type: "get",
		dataType: "jsonp"
	})
	.done(function(result){
		console.log(result.results);
		var picCount = 1;
		/*THE WINDOW STILL SCROLLS DOWN HERE EVEN IF RESULTS ARE 0*/if(result.results.length==0) {
			alert("Gulp! We couldn't find any images at the Library of Congress based on your search terms. Please try a different search.");
		} else {
		$.each(result.results, function(index, photo){
			var locImage = showLocImages(photo);
			if (photo.image.alt != "item not digitized thumbnail" && photo.image.alt != "group item thumbnail"  && photo.image.alt != "Look magazine thumbnail" && photo.image.alt != "habs/haer thumbnail") {
				$(".loc-image-subcontainer").append(locImage);
				picCount = picCount + 1;
			};
			if (picCount==21) return false;
		});
		};
	});
};

var getEtsyItems = function(searchTerms){
	var etsyParams = {
		api_key: etsyKey,
		limit: 30,
		keywords: searchTerms,
		includes: "MainImage,Shop(shop_name)"
	};

	var result = $.ajax({
		url: "https://openapi.etsy.com/v2/listings/active.js",
		data: etsyParams,
		type: "get",
		dataType: "jsonp"
	})
	.done(function(result){
		console.log(result.results);
		$.each(result.results, function(index, listing){
			var etsyListing = showEtsyItems(listing);
			$(".etsy-images").append(etsyListing);
		});
	});
};

var showEtsyItems = function(etsyListing){

	var resultEtsy = $('.templates .result-etsy').clone();

	var imageElem = resultEtsy.find('.item-image');
	imageElem.attr('src', etsyListing.MainImage.url_75x75);

	var nameElem = resultEtsy.find('.item-name');
	nameElem.append(etsyListing.title);

	var shopElem = resultEtsy.find('.shop-name');
	shopElem.append(etsyListing.Shop.shop_name)

	var linkElem = resultEtsy.find('.etsy-link');
	linkElem.attr('href', etsyListing.url);

	var priceElem = resultEtsy.find('.amount');
	priceElem.append("$" + etsyListing.price)

	return resultEtsy;
};

$(window).scroll(function(event){
	event.preventDefault();
	if($(window).scrollTop() > 300 && ($(window).width() > 500)) {
	$(".up-button").removeClass("hidden");
	};
	if($(window).scrollTop() < 300) {
	$(".up-button").addClass("hidden");
	};
});

$(".top-link").click(function(event){
	event.preventDefault();
	$('html, body').animate({
    		scrollTop: $("body").offset().top
			}, 1000);
})

$("#user-search-form").submit(function(event) {
		var keyword = $("#search-field").val();
		event.preventDefault();
		clearResults();
		$(".result-loc").removeClass("deemphasized");
		getLocImages(keyword);
		if ($(".loc-image-subcontainer").has("div") ) {
			$(".loc-results-container").removeClass("hidden");
			$('html, body').animate({
	    		scrollTop: $(".loc-results-container").offset().top - 10
				}, 1000);
		};
	});

$(".loc-image-subcontainer").on("click", ".loc-link", function(event){
	event.preventDefault();
	$(this).closest(".loc-image-subcontainer").find(".result-loc").removeClass("highlighted");
	$(this).closest(".result-loc").removeClass("deemphasized").addClass("highlighted");
	$(".result-loc").not(".highlighted").addClass("deemphasized");
	$(".etsy-images").empty();
	var keyword = $("#search-field").val();
	var searchTerms = $(this).attr("data-subject");
	var spaceAdjusted = searchTerms.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()0-9\[\]]/g," ").replace(/\s{2,}/g," ").replace(/^(.{21}[^\s]*).*/, "$1");
	var finalStringTwenty = spaceAdjusted + " " + keyword;
	var finalStringTen = spaceAdjusted.replace(/^(.{11}[^\s]*).*/, "$1") + " " + keyword;

	$(".etsy-container").removeClass("hidden");

	for (var i = 0; i<3; i++) {
			if (i==0){
				console.log(finalStringTwenty);
				getEtsyItems(finalStringTwenty);	
			} else if (i==1) {
				console.log(finalStringTen);
				getEtsyItems(finalStringTen);
			} else if (i==2) {
				console.log(keyword);
				getEtsyItems(keyword);
				//NEED TO FIGURE OUT HOW TO CHECK FOR NO RESULTS.
				//if ($(".result-etsy").length == 0) {
				//alert("Whoops! No Etsy items could be found related to this. Choose again.");
				//};
			};
		
		/*THIS IS NOT TRIGGERING. NEED TO BE ABLE TO STOP LOOP ONCE SUFFICIENT RESULTS ARE GATHERED*/if ($(".etsy-images > div").length >= 5) {
			console.log("You have five.");
			return false;
		};
	
	};

	$('html, body').animate({
    		scrollTop: $(".etsy-container").offset().top
			}, 1000);

});



});