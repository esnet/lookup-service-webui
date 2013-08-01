function resize_content()
{
	var header_height = $("#page-header").outerHeight(true);
	var content_height = $(window).height() - header_height;
	var difference = ($("#page-content").outerHeight(true) - $("#page-content").height());
	var min_height = parseInt($("body").css("min-height"))
	if (content_height >= min_height)
		$("#page-content").height(content_height - difference);
	else
		$("#page-content").height(min_height - header_height - difference);
}

resize_content();
$(window).resize(function() { resize_content(); });