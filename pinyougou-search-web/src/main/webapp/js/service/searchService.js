app.service('searchService',function($http){
	
	
	this.search=function(searchMap){
		debugger;
		return $http.post('itemSearch/search.do',searchMap);
	}
	
});