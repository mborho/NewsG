function MainAssistant(argFromPusher) {

}

MainAssistant.prototype = {
	setup: function() {
		Ares.setupSceneAssistant(this);
    this.appMenuModel = {
      items: [
        {label: "Edition", command: 'do-edition', shortcut: 'e'},
        {label: "About", command: 'do-about', shortcut: 'a'}
      ]};
 
     this.controller.setupWidget(Mojo.Menu.appMenu, {}, this.appMenuModel)
     
     // list widget
     this.newsModel = {"items": []} // [{title:'foo'}]}
     this.controller.setupWidget("mainListWgt",
        this.attributes = {
            itemTemplate: "main/mainRowTemplate",
            listTemplate: "main/mainListTemplate",
            swipeToDelete: false,
            //addItemLabel: " ",
            renderLimit: 40,
            reorderable: false
        },
        this.newsModel
    );
    this.mainListHandler = this.loadDataSource.bindAsEventListener(this);    
    this.controller.listen("mainListWgt", Mojo.Event.listTap, function(event){});//this.mainListHandler);
    //this.controller.listen("mainListWgt", Mojo.Event.listAdd, this.mainListLoadMore.bindAsEventListener(this))
    
    this.topicModel = getEditionTopics(global_ned);
    this.controller.setupWidget("topicSelector",
        this.attributes = {
           choices: this.topicModel
        },
        this.model = {
          value: getTopicLabel(global_ned, global_topic),
          disabled: false
       }
    ); 
    this.topicSelectorHandler = this.handleTopicSelect.bindAsEventListener(this);    
    this.controller.listen("topicSelector", Mojo.Event.propertyChange, this.topicSelectorHandler);

    // spinner
    this.controller.setupWidget("spinner",
        this.attributes = {
            spinnerSize: "large"
        },
        this.model = {
            spinning: true 
        }
    ); 
    this.requestApi(global_topic);
    this.setTopicColor(global_topic);
	},
	cleanup: function() {
		Ares.cleanupSceneAssistant(this);
	},
};

MainAssistant.prototype.setTopicColor = function(topic, with_items) {    
    Mojo.Log.error('set topic color');
    var color = getTopicColor(topic);
    this.controller.get('topicColorBox').style.backgroundColor = color;
    this.controller.get('topicSelector').style.borderColor = color;
    this.controller.get('topicSelector').style.color = color;
    if(with_items == true) {      
       var items = $$('div.newsitem');
       for (i=0;i<=items.length;i++) {
          try {
             items[i].style.borderColor = color;
          } catch(e) {};             
       }    
       var more = $$('div.moreSources');
       for (i=0;i<=more.length;i++) {
          try {
             more[i].style.background = color
          } catch(e) {};
       }
       var teaser = $$('div.moreSourcesTop');
       for (i=0;i<=teaser.length;i++) {
          try {
             teaser[i].style.backgroundColor = color
          } catch(e) {};
       }       
    }
}    

MainAssistant.prototype.loadDataSource = function(event)
{
    //Mojo.Controller.stageController.pushScene( this.listItems[event.index].title.toLowerCase() );
}

MainAssistant.prototype.mainListLoadMore = function(event)
{
    Mojo.Log.error("Load more newsitems");
    //Mojo.Controller.stageController.pushScene( this.listItems[event.index].title.toLowerCase() );
}

MainAssistant.prototype.handleTopicSelect = function(event)
{
    Mojo.Log.error("Topic selected: "+event.value);
    this.setTopicColor(event.value);  
    global_topic = event.value;
    this.newsModel["items"] = [];
    this.controller.modelChanged(this.newsModel);
    this.controller.get('spinner').mojo.start()
    this.requestApi(event.value);
}

MainAssistant.prototype.editionUpdate = function(edition) {
   Mojo.Log.error('edition updated: '+global_ned);
   global_ned = edition;
   //global_topic = 'h';
   Mojo.Controller.stageController.swapScene({name: "main", disableSceneScroller: true});   
}

MainAssistant.prototype.requestApi = function(topic) {
 
    Mojo.Log.error(topic);
    Mojo.Log.error('ned in action: '+global_ned);
    try {    
        if(!topic) {
            throw('requestApi(): topic must be defined');
        }
        var url = 'http://ajax.googleapis.com/ajax/services/search/news?v=1.0&ned='+global_ned+'&rsz=large&topic='+topic;
        var request = new Ajax.Request(url,{
            method: 'GET',
            //parameters: {'op': 'getAllRecords', 'table': table},
            evalJSON: 'true',
            onSuccess: this.requestNewsSuccess.bind(this),
            onFailure: function(){
                //Stuff to do if the request fails, ie. display error
                Mojo.Log.error('Failed to get Ajax response');
                this.controller.get('spinner').mojo.stop() 
            }
        });
    }
    catch(e) {
        Mojo.Log.error(e);
    }
}
 
MainAssistant.prototype.requestNewsSuccess = function(response) {
 
    Mojo.Log.error('Got Ajax response: ' + response.status);//responseText);
    Mojo.Log.error('Got Text: ' + response.responseText);
    var data=response.responseText;  
    try {  
       var json = data.evalJSON();  
    } catch(e) {  
       Mojo.Log.error(e);  
    }  
    
    try {
        var resultData = json['responseData']['results'];
        Mojo.Log.error(resultData);
        this.renderNews(resultData);
    }
    catch(e) {
        Mojo.Log.error(e);
    }
}

MainAssistant.prototype.renderNews = function(data) {
    var newData = [];
    for(res in data) {
        try {
          var url = decodeURIComponent(data[res]['url']);
          var headline = data[res]['titleNoFormatting'];
          var content = data[res]['content'];
          var publisher = data[res]['publisher'];

          var date = new Date(data[res]['publishedDate']);
          var published = date.getDate()+'.'+date.getMonth()+'.'+(1900+date.getYear())+' '+date.getHours()+':'+date.getMinutes();
          var imageData = data[res]['image']
          var imageHtml = ''
          try {
              var ratio = 110 / imageData['tbWidth'];
              imageHtml += '<img src="'+imageData['url']+'" alt="" ';
              imageHtml += 'style="width:'+(imageData['tbWidth']*ratio)+'px; height:'+(imageData['tbHeight']*ratio)+'px;" class="newsPic" />';              
          } catch(e) {
              //Mojo.Log.error(e);
          }
          var relatedsHtml = ''
          try {
              var rel = data[res]['relatedStories']; 
              for (i=0;i<=rel.length;i++) {
                 relatedsHtml += '<div><a href="'+rel[i]['unescapedUrl']+'" class="moreLink" ';
                 relatedsHtml += 'onClick="return false" onDblClick="MainAssistant.prototype.moreLinkClicked(this)"';
                 relatedsHtml += '>'+rel[i]['titleNoFormatting']+'</a>&#160;&#160;<span class="morePublisher">'+rel[i]['publisher']+'</span></div>';
              }
          } catch(e) {
              //Mojo.Log.error(e);
          }          
          newData[res] = {
              index: res,
              title: headline, 
              href:url, 
              teaser: content, 
              publisher:publisher,
              date: published,
              image: imageHtml,
              more_label: gnewsEditions[global_ned].more,
              relateds: relatedsHtml}                  
        } catch(e) {
          Mojo.Log.error(e);
        }
    }
    this.controller.get('spinner').mojo.stop() 
    this.newsModel["items"] = newData;
    this.controller.modelChanged(this.newsModel);
    this.setTopicColor(global_topic, true);
    //this.controller.get('mainListWgt').mojo.showAddItem(true);
    this.controller.get('newsScroller').mojo.revealTop()
}

MainAssistant.prototype.showMoreSources = function(index) {
   Mojo.Log.error("Show more sources: "+index);   
   //$('moreLabel_'+index).hide();
   $('moreExpand_'+index).toggle();
   $('moreCollapse_'+index).toggle();
   $('moreSources_'+index).toggle();
   //if($('moreSources_'+index).offsetHeight > 0) {
  //    $('moreSources_'+index).hide();
   //} else {
    //  $('moreSources_'+index).show();
   //}
}

MainAssistant.prototype.moreLinkClicked = function(link) {
   Mojo.Log.error('link clicked: '+link.href);
   var request = new Mojo.Service.Request('palm://com.palm.applicationManager', {
    method: 'open',
    parameters: {
      id: 'com.palm.app.browser',
      params: {
        target: link.href
      }
    }
  });
}