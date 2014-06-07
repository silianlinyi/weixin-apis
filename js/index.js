$(function() {

	$('#sidebar .header.item').on("click", function() {
		$('#sidebar a.item').css('display', 'none');
		$(this).siblings().css('display', 'block');
	});

	

});
