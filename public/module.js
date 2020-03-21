function HighlightRow(obj){

	var table = document.getElementId("listtable_id");
	var tr = table.getElementsByTagName("tr");
	for(var i=0; i<tr.length; i++){
		tr[i].style.background = "white";
	}
	obj.style.backgroundColor = "#FCE6E0";
}