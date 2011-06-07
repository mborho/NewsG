// Copyright 2011 Martin Borho <martin@borho.net>
// GPL2 - see license.txt for details

function SearchAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

SearchAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
    SearchResult.reset()
    
    this.resultWidgetName = "searchListWgt";
    this.apiResult = SearchResult;
    
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */    
    this.controller.setupWidget("searchField",
        this.attributes = {
            hintText: "",
            multiline: false,
            enterSubmits: true,
            focus: true,
            autoFocus: true,
            autoReplace: false,
            requiresEnterKey: true,
//             focusMode: Mojo.Widget.focusInsertMode
        },
        this.model = {
            value: '',
            disabled: false
        }
    );

    this.searchField = this.controller.get('searchField');
    
    // search icon
    this.searchOrderHandler = this.handleSearchOrder.bindAsEventListener(this);
    Mojo.Event.listen(this.controller.get("searchOrder"), Mojo.Event.tap, this.searchOrderHandler);
    
    // search icon
    this.searchHandler = this.handleSearchSubmit.bindAsEventListener(this);
    Mojo.Event.listen(this.controller.get("searchCorner"), Mojo.Event.tap, this.searchHandler);
    
    this.handleInputBlur = this.onInputBlur.bind(this);    
    Mojo.Event.listenForFocusChanges(this.searchField, this.handleInputBlur);
    
    Mojo.Event.listen(this.searchField, Mojo.Event.propertyChange, this.searchHandler);  
    
     // list widget
     this.newsUrls = {};
     this.newsModel = {"items": []} // [{title:'foo'}]}
     this.controller.setupWidget(this.resultWidgetName,
        this.attributes = {
            itemTemplate: "main/mainRowTemplate",
            listTemplate: "search/searchListTemplate",
            swipeToDelete: false,
            renderLimit: 100,
            reorderable: false
        },
        this.newsModel
    );
    this.controller.listen(this.resultWidgetName, Mojo.Event.listTap, function(event){});
	
    // handler for pull to refesh
    this.controller.listen("searchScroller",Mojo.Event.scrollStarting, this._scrollStart.bind(this));
    
    // spinner
    this.controller.setupWidget("search_spinner",
        this.attributes = {spinnerSize: "large"},
        this.model = {spinning: false }
    ); 
    this.controller.setupWidget("search_spinner_small",
        this.attributes = {spinnerSize: "small"},
        this.model = {spinning: false }
    ); 

    // set scroller height
    this.controller.get('searchScroller').style.height = Settings.scrollerHeight;    
    this.controller.get('searchContainer').style.height = Settings.scrollerHeight;    
    
    /* add event handlers to listen to events from widgets */
    
    
};

SearchAssistant.prototype.pulled_counter =  0;
SearchAssistant.prototype.reloadTriggered = 0;

SearchAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

SearchAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

SearchAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

SearchAssistant.prototype.onInputBlur= function(e) {
    try {
        var term = this.searchField.mojo.getValue().replace (/^\s+/, '').replace (/\s+$/, '');
        if(term.length < 2) {
            this.searchField.mojo.focus();
        }
    } catch(e) {};
    return true;
};

SearchAssistant.prototype.hideSearchOrder = function(event) {
    this.controller.get('searchOrderRel').style.display = 'none';
    this.controller.get('searchOrderDate').style.display = 'none';    
}

SearchAssistant.prototype.showSearchOrder = function(event) {
    if(Settings.searchOrder == 'Date') {
        this.controller.get('searchOrderRel').style.display = 'none';
        this.controller.get('searchOrderDate').style.display = 'block';
    } else if(Settings.searchOrder == 'Rel') {
        this.controller.get('searchOrderRel').style.display = 'block';
        this.controller.get('searchOrderDate').style.display = 'none';
    }
}

SearchAssistant.prototype.handleSearchOrder = function(event) {
    if(Settings.searchOrder == 'Rel') {
        Settings.searchOrder = 'Date';
    } else if(Settings.searchOrder == 'Date') {
        Settings.searchOrder = 'Rel';
    }
    this.showSearchOrder();
    if(this.newsModel["items"].length > 0) ListHandler.reloadFirstPage(this);
};

SearchAssistant.prototype.handleSearchSubmit = function(event) {
//     Mojo.Log.error('handling search submit: '+ event);
    this.hideSearchOrder();
    this.apiResult.reset();
    $('searchStartIcon').hide();
    this.showNoResult('none');
    this.newsModel["items"] = [];
    this.newsUrls = {};
    this.controller.modelChanged(this.newsModel);
    this.apiResult.term = this.searchField.mojo.getValue().replace (/^\s+/, '').replace (/\s+$/, '');    
    if(this.apiResult.term.length > 1) {
        this.spinnerAction('start');
        this.requestApi();    
    } else {//if (/*event.target !== this.searchField && */!event.target.up('div#'+this.searchField.id)) {  
        event.preventDefault();        
        if(this.apiResult.term.length == 1) {
            this.showNoResult('block');
        }
    }    
};

SearchAssistant.prototype.setSearchColor = function(with_items) {    
    var color = Settings.searchColor;
    if(with_items == true) {   
       var elems = $$('#searchContainer div.moreSourcesBox');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.borderColor = color} catch(e) {};}
       var elems = $$('#searchContainer div.moreSourcesBoxWrapper');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.background = color} catch(e) {};}
       var elems = $$('#searchContainer  div.moreCorner');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.backgroundColor = color} catch(e) {};}       
       var elems = $$('#searchContainer  div.moreSources');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.borderColor = color} catch(e) {};}             
       var elems = $$('#searchContainer  div.moreLabel');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.color = color} catch(e) {};}             
    }
    var elems = $$('div.empty-more-border');
    for (i=0;i<=elems.length;i++) {try {elems[i].style.borderColor = color} catch(e) {};}             
} 

SearchAssistant.prototype.requestApi = function() {
    try {         
        term = this.apiResult.term
        var start = (this.apiResult.page-1)*this.apiResult.pageLength;
        var url = 'http://ajax.googleapis.com/ajax/services/search/news?v=1.0';
        url += '&ned='+Settings.ned+'&rsz=large&q='+encodeURIComponent(term)+'&start='+start;
        if(Settings.searchOrder == 'Date') url += '&scoring=d';
        ApiCaller.request(url,this.requestSearchSuccess.bind(this), function(){
                Mojo.Log.error('Failed to get Ajax response');
                this.spinnerAction('stop');
            });            
    }
    catch(e) { Mojo.Log.error(e); }
}

SearchAssistant.prototype.requestSearchSuccess = function(response) { 
    ApiCaller.readResults(response, this.renderSearch.bind(this), this.apiResult);   
}

SearchAssistant.prototype.renderSearch = function(data) {
    var newData = [];
    var more_display = 'none';
    var onClick = 'StageAssistant.prototype.moreLinkClicked(this);return false;';
    var dblClick = 'return false;';
    if(Settings.dblClick == 'On') {
        var dblClick = 'StageAssistant.prototype.moreLinkClicked(this);return false;';
        var onClick = 'return false;';
    }        
     
    for (j=0;j<data.length;j++) {
        res = j;
        try {
            var url = decodeURIComponent(data[res]['url']);
            var headline = data[res]['titleNoFormatting'];
            var content = data[res]['content'];
            var publisher = data[res]['publisher'];

            var date = new Date(data[res]['publishedDate']);
            var published = Mojo.Format.formatDate(date,{date:'medium',time:'short'});
            var imageData = data[res]['image']
            var imageHtml = ''
            if(Settings.loadImages == "On") {
                try {
                    var ratio = 110 / imageData['tbWidth'];
                    imageHtml += '<img src="'+imageData['url']+'" alt="" ';
                    imageHtml += 'style="width:'+(imageData['tbWidth']*ratio)+'px; height:'+(imageData['tbHeight']*ratio)+'px;" class="newsPic" />';              
                } catch(e) {}
            }
            var relatedsHtml = ''

            var more_display = 'block';
            var extra_class = '';
            try {
                var rel = data[res]['relatedStories']; 
                for (i=0;i<=rel.length;i++) {
                    var mUrl = rel[i]['unescapedUrl'];
                    relatedsHtml += '<div><a href="'+mUrl+'" class="moreLink" ';
                    relatedsHtml += 'onClick="'+onClick+'" onDblClick="'+dblClick+'"';
                    relatedsHtml += '>'+rel[i]['titleNoFormatting']+'</a>&#160;&#160;<span class="morePublisher">'+rel[i]['publisher']+'</span></div>';
                }
            } catch(e) {}    
            if(relatedsHtml == '') {
                more_display = 'none';
                extra_class = 'empty-more-border';
            }
            itemIndex = (this.apiResult.page*this.apiResult.pageLength)+res
            var add = true;
            var display = 'block';          
            if(this.newsUrls.hasOwnProperty(url)) {
                display = 'none';
                Mojo.Log.error('ALREADY EXISTS'+url);
            }
            this.newsUrls[url] = 1;
            newData[res] = {
                index: itemIndex,
                title: headline, 
                href:url, 
                teaser: content, 
                publisher:publisher,
                date: published,
                image: imageHtml,
                more_label: gnewsEditions[Settings.ned].more,
                more_display: more_display,
                extra_class: extra_class,
                relateds: relatedsHtml,
                display:display,
                onclick:onClick,
                ondblclick:dblClick              
            }                          
        } catch(e) {
          Mojo.Log.error(e);
        }
    }
    this.spinnerAction('stop');
    if(this.apiResult.page > 1) {
       this.newsModel["items"] = this.newsModel["items"].concat(newData);
    } else {
       this.newsUrls = [];
       this.newsModel["items"] = newData;
       if(newData.length == 0) {
            this.showNoResult('block');
            this.hideSearchOrder();
       } else {
            this.showSearchOrder();      
       }
    }
    this.controller.modelChanged(this.newsModel);
    this.setSearchColor(true);      
    if(this.apiResult.page+1 <= this.apiResult.getMaxPage() && newData.length == this.apiResult.pageLength) {
        $("searchlist").insert(StageAssistant.prototype.getMoreListItem());
        this.controller.listen("itemLoadMore", Mojo.Event.tap, ListHandler.loadNextPage.bind(this, this))
    }
    if(this.apiResult.page == 1) {
       this.reloadTriggered = 0;
       this.controller.get('searchScroller').mojo.revealTop()
       if(this.apiResult.getMaxPage() == 1) {
          this.apiResult.pageTriggered = 0;
       }
    } else if(this.apiResult.getMaxPage() > this.apiResult.page) {
       this.apiResult.pageTriggered = this.apiResult.page;
    }
}
    
SearchAssistant.prototype._scrollStart = function(event) {
    //the event object returned is a pointer to the moved event of the list, which returns some cool info about the scrolling of list: position, if its finishing up moving, etc
    event.addListener(this);
};

SearchAssistant.prototype.moved = function(stopped,position) {
    ListHandler.scrollerMoved(this);
};

SearchAssistant.prototype.showNoResult = function(display) {
    this.controller.get('searchNoResult').style.display = display;
}

SearchAssistant.prototype.spinnerAction = function(mode) {
   var spinner_id = 'search_spinner';
   if(this.apiResult.page > 1) spinner_id += '_small';
   if(mode == "start") {
      this.controller.get(spinner_id).mojo.start()
   } else if(mode == "stop") {
      this.controller.get(spinner_id).mojo.stop()
   }
}
