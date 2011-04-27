function MainAssistant(argFromPusher) {

}

MainAssistant.prototype = {
	setup: function() {
		Ares.setupSceneAssistant(this);

     this.controller.setupWidget(Mojo.Menu.appMenu, newsMenuAttr, newsMenuModel);
     
     this.resultWidgetName = "mainListWgt";
     
     this.apiResult = TopicResult;
     
     this.newsUrls = {};
     // list widget
     this.newsModel = {"items": []} // [{title:'foo'}]}
     this.controller.setupWidget(this.resultWidgetName,
        this.attributes = {
            itemTemplate: "main/mainRowTemplate",
            listTemplate: "main/mainListTemplate",
            swipeToDelete: false,
            renderLimit: 100,
            reorderable: false
        },
        this.newsModel
    );
    //this.mainListHandler = this.loadDataSource.bindAsEventListener(this);    
    this.controller.listen(this.resultWidgetName, Mojo.Event.listTap, function(event){});
    
    // handler for pull to refesh
    this.controller.listen("newsScroller",Mojo.Event.scrollStarting, this._scrollStart.bind(this));
    
    this.topicModel = getEditionTopics(Settings.ned);
    this.controller.setupWidget("topicSelector",
        this.attributes = {
           choices: this.topicModel
        },
        this.model = {
          value: getTopicLabel(Settings.ned, Settings.topic),
          disabled: false
       }
    ); 
    this.topicSelectorHandler = this.handleTopicSelect.bindAsEventListener(this);    
    this.controller.listen("topicSelector", Mojo.Event.propertyChange, this.topicSelectorHandler);

    this.openSearchHandler = this.openSearch.bindAsEventListener(this); 
    this.controller.listen("searchCorner", Mojo.Event.tap, this.openSearchHandler);
    
    // spinner
    this.controller.setupWidget("spinner",
        this.attributes = {spinnerSize: "large"},
        this.model = {spinning: true }
    ); 
    this.controller.setupWidget("spinner_small",
        this.attributes = {spinnerSize: "small"},
        this.model = {spinning: false }
    ); 
    this.apiResult.reset();
    this.requestApi();
    this.setTopicColor(Settings.topic);
	},
	cleanup: function() {
		Ares.cleanupSceneAssistant(this);
	},
	pulled_counter: 0,
    reloadTriggered: 0
};

MainAssistant.prototype.openSearch = function() {
    StageAssistant.prototype.openSearchScene();        
};

MainAssistant.prototype.setTopicColor = function(topic, with_items) {    
    var color = getTopicColor(topic);
    this.controller.get('topicColorBox').style.backgroundColor = color;
    this.controller.get('topicSelector').style.borderColor = color;
    this.controller.get('searchCorner').style.borderColor = color;
    this.controller.get('searchCorner').style.backgroundColor = color;
    this.controller.get('topicSelector').style.color = color;
    if(with_items == true) {         
       var elems = $$('div.moreSourcesBox');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.borderColor = color} catch(e) {};}
       var elems = $$('div.moreSourcesBoxWrapper');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.background = color} catch(e) {};}
       var elems = $$('div.moreCorner');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.backgroundColor = color} catch(e) {};}       
       var elems = $$('div.moreSources');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.borderColor = color} catch(e) {};}             
       var elems = $$('div.moreLabel');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.color = color} catch(e) {};}             
    } else {
       var elems = $$('div.newsitem');
       for (i=0;i<=elems.length;i++) {try {elems[i].style.borderColor = color} catch(e) {};}             
    }
}    

MainAssistant.prototype.loadDataSource = function(event) {}

MainAssistant.prototype.mainListLoadMore = function(event) {
    Mojo.Log.error("Load more newsitems");
}

MainAssistant.prototype.handleTopicSelect = function(event) {
    //Mojo.Log.error("Topic selected: "+event.value);
    this.setTopicColor(event.value);  
    Settings.topic = event.value;
    this.apiResult.reset();
    this.newsModel["items"] = [];
    this.newsUrls = {};
    this.controller.modelChanged(this.newsModel);
    this.spinnerAction('start');
    this.requestApi(event.value);
}

MainAssistant.prototype.editionUpdate = function(edition) {
   Mojo.Log.error('edition updated: '+Settings.ned);
   Settings.ned = edition;
   Mojo.Controller.stageController.swapScene({name: "main", disableSceneScroller: true});   
}

MainAssistant.prototype.requestApi = function() {
    try {         
        if(!Settings.topic) {
            throw('requestApi(): topic must be defined');
        }
        
        var start = (this.apiResult.page-1)*this.apiResult.pageLength;
        var url = 'http://ajax.googleapis.com/ajax/services/search/news?v=1.0';
        url += '&ned='+Settings.ned+'&rsz=large&topic='+Settings.topic+'&start='+start;
        ApiCaller.request(url,this.requestNewsSuccess.bind(this), function(){
                Mojo.Log.error('Failed to get Ajax response');
                this.spinnerAction('stop');
            });    }
    catch(e) { Mojo.Log.error(e);}
}
 
MainAssistant.prototype.requestNewsSuccess = function(response) {
    ApiCaller.readResults(response, this.renderNews.bind(this), this.apiResult);    
}

MainAssistant.prototype.renderNews = function(data) {
    var newData = [];
    var more_display = 'none';
    //Mojo.Log.error('LENGTH: '+data.length);
    if(Settings.topic != "ir") var more_display = 'block';
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
//             if(Settings.googleRedirect == "On") {
//                 url = data[res]['signedRedirectUrl'];
//             }
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

            try {
                var rel = data[res]['relatedStories']; 
                for (i=0;i<=rel.length;i++) {
                    var mUrl = rel[i]['unescapedUrl'];
//                     if(Settings.googleRedirect == "On") {
//                         mUrl = rel[i]['signedRedirectUrl']
//                     }
                    relatedsHtml += '<div><a href="'+mUrl+'" class="moreLink" ';
                    relatedsHtml += 'onClick="'+onClick+'" onDblClick="'+dblClick+'"';
                    relatedsHtml += '>'+rel[i]['titleNoFormatting']+'</a>&#160;&#160;<span class="morePublisher">'+rel[i]['publisher']+'</span></div>';
                }
            } catch(e) {}    
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
                    extra_class: '',
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
    }
    this.controller.modelChanged(this.newsModel);
    this.setTopicColor(Settings.topic, (more_display=='block'));      
    if(this.apiResult.page+1 <= this.apiResult.getMaxPage() && newData.length == this.apiResult.pageLength) {
        $('newslist').insert(StageAssistant.prototype.getMoreListItem());
        this.controller.listen("itemLoadMore", Mojo.Event.tap, ListHandler.loadNextPage.bind(this, this))
    }
    if(this.apiResult.page == 1) {
       this.reloadTriggered = 0;
       this.controller.get('newsScroller').mojo.revealTop()
    } else if(this.apiResult.getMaxPage() > this.apiResult.page) {
       this.apiResult.pageTriggered = this.apiResult.page;
    }
}

MainAssistant.prototype.showMoreSources = function(index) {
    //Mojo.Log.error("Show more sources: "+index);   
    $('moreExpandPrefix_'+index).toggle();
    $('moreExpandSuffix_'+index).toggle();
    $('moreCollapsePrefix_'+index).toggle();
    $('moreCollapseSuffix_'+index).toggle();
    $('moreSources_'+index).toggle();
}

MainAssistant.prototype._scrollStart = function(event) {
    //the event object returned is a pointer to the moved event of the list, which returns some cool info about the scrolling of list: position, if its finishing up moving, etc
    event.addListener(this);
};

MainAssistant.prototype.moved = function(stopped,position) {
    ListHandler.scrollerMoved(this);
};

MainAssistant.prototype.spinnerAction = function(mode) {
   var spinner_id = 'spinner';
   if(this.apiResult.page > 1) spinner_id += '_small';
   if(mode == "start") {
      this.controller.get(spinner_id).mojo.start()
   } else if(mode == "stop") {
      this.controller.get(spinner_id).mojo.stop()
   }
}