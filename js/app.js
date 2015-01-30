$(document).ready( function() {

	var etsyKey = "lw0y75472kxputmk49tlocx6";

	//setting etsy result counter to 0
	var numberEtsyResults = 0;

	//setting etsy api call counter to 0
	var etsyApiCycle = 0;

	//method for clearing loc and etsy results froom containers
	var clearResults = function() {
		$(".loc-image-subcontainer").html("");
		$(".etsy-images").html("");
		$(".etsy-container").addClass("hidden");
	};

	//method for displaying images obtained from loc api query
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

	//call to loc api
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
			var picCount = 0;
			if(result.results.length==0) {
				alert("Gulp! We couldn't find any images at the Library of Congress based on your search terms. Please try a different search.");
			} else {
			$.each(result.results, function(index, photo){
				var locImage = showLocImages(photo);
				if (photo.image.alt != "item not digitized thumbnail" && photo.image.alt != "group item thumbnail"  && photo.image.alt != "Look magazine thumbnail" && photo.image.alt != "habs/haer thumbnail") {
					$(".loc-image-subcontainer").append(locImage);
					picCount = picCount + 1;
				};
				if (picCount==20) return false;
			});
			$(".loc-results-container").removeClass("hidden");
			$('html, body').animate({
		    	scrollTop: $(".loc-results-container").offset().top - 10
				}, 1000);
			};
		});
	};

	//call to Etsy api
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
			etsyApiCycle = etsyApiCycle + 1;
			console.log(result.results);
			if (((result.results.length+numberEtsyResults) == 0) && (etsyApiCycle==3)){
				alert("Sorry, we couldn't find any Etsy items based on your selected image. Please choose another.")
			} else if (numberEtsyResults < 5){
				if (result.results.length>0){
					$('html, body').animate({
		    		scrollTop: $(".etsy-container").offset().top
					}, 1000);
				}
				$.each(result.results, function(index, listing){
					numberEtsyResults = numberEtsyResults + 1;
					var etsyListing = showEtsyItems(listing);
					$(".etsy-images").append(etsyListing);
				});
				//console.log(numberEtsyResults);
			};
		});
	};

	//method for displaying etsy results on page
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

	//display "return to top" button on scroll down
	$(window).scroll(function(event){
		event.preventDefault();
		if($(window).width() > 500) {
			$(".mobile-up-button").addClass("hidden");	
		};
		if ($(window).width() < 500) {
			$(".up-button").addClass("hidden");
		};
		if($(window).scrollTop() > 300 && ($(window).width() > 500)) {
		$(".up-button").removeClass("hidden");
		};
		if($(window).scrollTop() < 300) {
		$(".up-button").addClass("hidden");
		$(".mobile-up-button").addClass("hidden");
		};
		if($(window).scrollTop() > 300 && ($(window).width() < 500)) {
		$(".mobile-up-button").removeClass("hidden");
		};

	});

	//return to top of page on button click
	$(".top-link").click(function(event){
		event.preventDefault();
		$('html, body').animate({
	    		scrollTop: $("body").offset().top
				}, 1000);
	})

	//running loc api call on button click and displaying results
	$("#user-search-form").submit(function(event) {
			var keyword = $("#search-field").val();
			event.preventDefault();
			clearResults();
			$(".result-loc").removeClass("deemphasized");
			getLocImages(keyword);
			
		});

	//running etsy api call on loc image click and displaying results
	$(".loc-image-subcontainer").on("click", ".loc-link", function(event){
		event.preventDefault();
		numberEtsyResults = 0;
		etsyApiCycle = 0;

		//truncate data from loc image fo etsy search
		var keyword = $("#search-field").val();
		var searchTerms = $(this).attr("data-subject");
		var spaceAdjusted = searchTerms.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()0-9\[\]]/g," ").replace(/\s{2,}/g," ").replace(/^(.{21}[^\s]*).*/, "$1");
		var finalStringTwenty = spaceAdjusted + " " + keyword;
		var finalStringTen = spaceAdjusted.replace(/^(.{11}[^\s]*).*/, "$1") + " " + keyword;

		//highlight image selected and remove any prior results when a different image is selected 
		$(this).closest(".loc-image-subcontainer").find(".result-loc").removeClass("highlighted");
		$(this).closest(".result-loc").removeClass("deemphasized").addClass("highlighted");
		$(".result-loc").not(".highlighted").addClass("deemphasized");
		$(".etsy-images").empty();
		$(".etsy-container").removeClass("hidden");

		//loop for etsy API calls broadening on each successive step
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
				};
		};
	});

});