function resize_content()
{
	var content_height = $(window).height() - $("#page-header").outerHeight(true);
	content_height -= ($("#page-content").outerHeight(true) - $("#page-content").height());
	$("#page-content").height(content_height);
}

resize_content();
$(window).resize(function() { resize_content(); });