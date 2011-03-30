var Gnews = function() {
    
    var result = '';
    
    return {

        testText: function(text) {
            return "text: "+text;        
        },
        
        handleResponse: function(resp) {
      
        }
        
        //apiCall: function() {
        //    var request = new Ajax.Request("http://ajax.googleapis.com/ajax/services/search/news?v=1.0&rsz=large&topic=h", {
        //        method: 'get',
        //        evalJSON: 'false',
        //        onSuccess: this.handleResponsefeedRequestSuccess.bind(this),
        //        onFailure: this.feedRequestFailure.bind(this)
        //});
    }

}();
