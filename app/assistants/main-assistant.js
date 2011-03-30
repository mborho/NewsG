function MainAssistant(argFromPusher) {
}

MainAssistant.prototype = {
	setup: function() {
		Ares.setupSceneAssistant(this);
		
     // list widget
     this.newsModel = {"items": []} // [{title:'foo'}]}
     this.controller.setupWidget("mainListWgt",
        this.attributes = {
            itemTemplate: "main/mainRowTemplate",
            listTemplate: "main/mainListTemplate",
            swipeToDelete: false,
            renderLimit: 40,
            reorderable: false
        },
        this.newsModel
    );
    this.mainListHandler = this.loadDataSource.bindAsEventListener(this);    
    this.controller.listen("mainListWgt", Mojo.Event.listTap, this.mainListHandler);
    
    this.controller.setupWidget("topicSelector",
        this.attributes = {
           choices: [
{label: "Top Headlines", value: "h"},
{label: "World", value: "w"},
{label: "Business", value: "b"},
{label: "Nation", value: "n"},
{label: "Science/Technology", value: "t"},
{label: "Politics", value: "p"},
{label: "Entertainment", value: "e"},
{label: "Sports", value: "s"},
{label: "Health", value: "m"}
            ]
        },
        this.model = {
          value: "Top Headlines",
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
    this.requestApi('h');
	},
	cleanup: function() {
		Ares.cleanupSceneAssistant(this);
	}
};

MainAssistant.prototype.loadDataSource = function(event)
{
    Mojo.Controller.stageController.pushScene( this.listItems[event.index].title.toLowerCase() );
}

MainAssistant.prototype.handleTopicSelect = function(event)
{
    Mojo.Log.error("Topic selected: "+event.value);
    this.newsModel["items"] = [];
    this.controller.modelChanged(this.newsModel);
    this.controller.get('spinner').mojo.start()
    this.requestApi(event.value);
}

MainAssistant.prototype.requestApi = function(topic) {
 
    Mojo.Log.error(topic);
    try {    
        if(!topic) {
            throw('requestApi(): topic must be defined');
        }
        var url = 'http://ajax.googleapis.com/ajax/services/search/news?v=1.0&ned=de&rsz=large&topic='+topic;
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
          var imagHtml = ''
          if(imageData['url']) {
              imageHtml = '<img src="'+imageData['url']+'" alt="" ';
              imageHtml += 'style="width:125px; float:left; margin:5px 5px 2px 0;" class="newsPic" />';              
          }
          newData[res] = {
              title: headline, 
              href:url, 
              teaser: content, 
              publisher:publisher,
              date: published,
              image: imageHtml}                  
        } catch(e) {
          Mojo.Log.error(e);
        }
    }
    Mojo.Log.error(newData);
    this.controller.get('spinner').mojo.stop() 
    this.newsModel["items"] = newData;
    this.controller.modelChanged(this.newsModel);
    this.controller.get('newsScroller').mojo.revealTop()
}