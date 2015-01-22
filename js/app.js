$(document).ready( function() {
var etsyKey = "lw0y75472kxputmk49tlocx6";
/*
get request to LOC using user search term
parse LOC data to get image and subject/photo information 
display images from LOC

user clicks on image
get data from image
get request to Etsy using LOC image subject
display image, name, shop & price from Etsy
link through Etsy images to Etsy site
new search clears prior results
*/

var showLocImages = function(locImage) {

	var resultLoc = $('.templates .result-loc').clone();

	var imageElem = resultLoc.find('.loc-image');
	imageElem.attr('src', locImage.image.square);

	return resultLoc;
};

var getLocImages = function(keyword) {
	var locParams = {
		q: keyword,
		fo: 'json'
	};

	var result = $.ajax({
		url: "http://loc.gov/pictures/search",
		data: locParams,
		type: "get",
		dataType: "jsonp"
	})
	.done(function(result){
		console.log(result.results);
		$.each(result.results, function(index, photo){
			var locImage = showLocImages(photo);
			$(".loc-image-subcontainer").append(locImage);
			/*console.log(photo.subjects);*/
		});
	});
};

$("#user-search-form").submit(function(event) {
		var keyword = $("#search-field").val();
		event.preventDefault();
		getLocImages(keyword);
	});


});