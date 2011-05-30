// Copyright 2011 Martin Borho <martin@borho.net>
// GPL2 - see license.txt for details

var db= new Mojo.Depot ({name:"NewsGDb",version:1,replace:false}, dbOpenOK, dbOpenFail);
function dbOpenOK() {
   Mojo.Log.error('DATABASE OK: '+db);
}

function dbOpenFail(code) {
   Mojo.Log.error('DATABASE FAILS: '+code);
}

function dbSuccess() {
    //Mojo.Log.info("........","depot saved OK");
} 

function dbFailure(transaction,result) { 
    Mojo.Log.warn("Database save error (#", result.message, ")"); 
    Mojo.Controller.errorDialog("Database save error (#" + result.message + ")"); 
}

var Settings = function() {

    var getDepotValue = function(response) {
            var recordSize = Object.values(response).size();  
            if(recordSize > 0) {
                return response.value
            }
            return '';   
        };
    
    return {
        scrollerHeight: '402px',
        defaultTopic: '',
        topic: '',
        defaultNed: '',
        ned: '',
        loadImages: '',
        dblClick: '',
        mobilizer: '',
        color: '',        
        topicsOrder: false,
        topicsHidden: false,
        topics: {
            "h":  {label: "Top Stories", value: "h"},
            "w":  {label: "World", value: "w"},
            "n":  {label: "National", value: "n"},
            "b":  {label: "Business", value: "b"},            
            "t":  {label: "Science/Technology", value: "t"},
            "p":  {label: "Politics", value: "p"},
            "e":  {label: "Entertainment", value: "e"},
            "s":  {label: "Sports", value: "s"},
            "m":  {label: "Health", value: "m"},
            "ir": {label: "Spotlight", value: "ir"},
            "po": {label: "Most Popular", value: "po"}
        },                    
        searchColor: '#4272DB',
        
        loadFromDepot: function() {
            this.setDeviceSettings();
            this.loadDefaultEdition();
            this.loadDefaultTopic();
            this.loadDefaultDblClick();
            this.loadDefaultMobilizer();
            this.loadDefaultImgLoad();
            this.loadTopicsOrder();
            this.loadTopicsHidden();
        },
        
        setDeviceSettings: function() {
            if(Mojo.Environment.DeviceInfo.screenHeight == 400) {
                Settings.scrollerHeight = '322px';
            }
        },
        
        loadDefaultEdition: function() {
            db.get('settings.defaultEdition', function(response) {
                    var value = getDepotValue(response);
                    if(value != '') Settings.defaultNed = value;              
                    else Settings.defaultNed = 'us';
                }, dbFailure);            
        },
        
        loadDefaultTopic: function() {
            db.get('settings.defaultTopic', function(response) {
                    var value = getDepotValue(response);
                    if(value != '') Settings.defaultTopic = value;              
                    else Settings.defaultTopic = 'h';
                }, dbFailure);
        },
        
        loadDefaultDblClick: function() {
            db.get('settings.dblClick', function(response) {
                    var value = getDepotValue(response);
                    if(value != '') Settings.dblClick = value;              
                    else Settings.dblClick = 'Off';
                }, dbFailure);            
        },
        
        loadDefaultMobilizer: function() {
            db.get('settings.mobilizer', function(response) {
                    var value = getDepotValue(response);
                    if(value != '') Settings.mobilizer = value;              
                    else Settings.mobilizer = 'Off';
                }, dbFailure);            
        },
        
        
        loadDefaultImgLoad: function() {
            db.get('settings.loadImages', function(response) {
                    var value = getDepotValue(response);
                    if(value != '') Settings.loadImages = value;              
                    else Settings.loadImages = 'On';
                }, dbFailure);
        }, 
        
        loadTopicsOrder: function() {            
            db.get('settings.topicsOrder', function(response) {
                    var value = getDepotValue(response);
                    if(value != '') {
                        Settings.topicsOrder = value;              
                    } else {
                        Settings.topicsOrder = ["h","w","n","b","t","p","e","s","m","ir","po"];
                    }
                }, dbFailure);
        }, 
        
        loadTopicsHidden: function() {
            db.get('settings.topicsHidden', function(response) {
                    var value = getDepotValue(response);
                    if(value != '') {
                        Settings.topicsHidden = value;              
                    } else {
                        Settings.topicsHidden = [];
                    }
                }, dbFailure);
        },   
            
        isHiddenTopic: function(topic) {
            for(jj=0;jj < Settings.topicsHidden.length;jj++) {
                if(topic == this.topicsHidden[jj]) {
                    return true;
                }
            }
            return false;
        }, 
        
        getManagedTopics: function() {
            var topics = [];
            for(i=0;i<this.topicsOrder.length;i++) {
                var data = this.topics[this.topicsOrder[i]];
                data.visibility = 'show';
                if(this.isHiddenTopic(this.topicsOrder[i])) {
                    data.visibility = 'hidden';
                }
                topics.push(data);
            }
            return topics;
        },
        
        getEditionTopics: function() {
            var topics = [];
            for(i=0;i<this.topicsOrder.length;i++) {
                if(this.isHiddenTopic(this.topicsOrder[i]) === false) {
                    topics.push({label: getTopicLabel(this.ned, this.topicsOrder[i]), value:this.topicsOrder[i]});
                }
            }
            return topics;
        }
        
    }    
}();   

var ApiCaller = function() {
    
    return {
        request: function(url, successCall, errorCall) {
            //Mojo.Log.error('API URL: '+url);
            var request = new Ajax.Request(url,{
            method: 'GET',
            //parameters: {'op': 'getAllRecords', 'table': table},
            evalJSON: 'true',
            onSuccess: successCall,
            onFailure: errorCall,
            });
        },
        readResults: function(response, renderer, resultHandler) {
            var data=response.responseText;  
            try {  
                var json = data.evalJSON();  
            } catch(e) {  
                Mojo.Log.error(e);  
            }  
    
            try {
                var resultData = json['responseData']['results'];
                resultHandler.cursor = json['responseData']['cursor'];
                renderer(resultData);
            } catch(e) {
                Mojo.Log.error(e);
            }        
        },
    }
    
}();

var TopicResult = function() {
    return {
        page: 1,
        pageTriggered: 1,
        pageLength: 8,
        cursor: false,
        reset: function() {
            this.page = 1;
            this.pageTriggered = 1;
        },
        getMaxPage: function() {
             try {
                return this.cursor.pages.toArray().length;
             } catch(e) {}
             return 1;
        },    
    }    
}(); 

var SearchResult = function() {
    return {
        term: '',
        page: 1,
        pageTriggered: 1,
        pageLength: 8,
        cursor: false,
        reset: function() {
            this.page = 1;
            this.pageTriggered = 1;
        },
        getMaxPage: function() {
             try {
                return this.cursor.pages.toArray().length;
             } catch(e) {}
             return 1;
        },    
    }    
}(); 

var ListHandler = function() {
    return {
        reloadFirstPage: function(assistant) { 
            assistant.newsModel["items"] = [];
            assistant.newsUrls = {};
            assistant.controller.modelChanged(assistant.newsModel);
            assistant.apiResult.reset();
            Mojo.Log.error('reload search:' + assistant.apiResult.page);
            assistant.spinnerAction('start');
            assistant.requestApi();
        },
        loadNextPage: function(assistant) { 
            try {$('load-more-icon').hide();} catch(e){};            
            assistant.apiResult.page = assistant.apiResult.page + 1;
            Mojo.Log.error('load more:' + assistant.apiResult.page);
            assistant.spinnerAction('start');
            assistant.requestApi();
        },
        scrollerMoved: function(assistant) {
            var index = assistant.controller.get(assistant.resultWidgetName).mojo.getLength()-1
            var itemNode = assistant.controller.get(assistant.resultWidgetName).mojo.getNodeByIndex(index);        
            var startNode = assistant.controller.get(assistant.resultWidgetName).mojo.getNodeByIndex(0); 
            if(itemNode && startNode){                
                    var startOffset = Element.viewportOffset(startNode); 
                    var offset = Element.viewportOffset(itemNode); 
                    //Mojo.Log.error('COUNTER: '+assistant.pulled_counter+' / '+offset.toArray()[1]+' / Tr:'+assistant.apiResult.pageTriggered+' == Pa:'+assistant.apiResult.page+ ' MAX: '+assistant.apiResult.getMaxPage()+' RLTR:'+assistant.reloadTriggered);
                    if(startOffset.toArray()[1] > 100 && assistant.reloadTriggered == 0) {
                        assistant.pulled_counter++;
                        if(assistant.pulled_counter >= 16) {
                            assistant.reloadTriggered = 1;
                            //this.reloadFirstPage();
                            this.reloadFirstPage(assistant);
                            assistant.pulled_counter = 0;
                        }
                    } else if(offset.toArray()[1] < 85 && assistant.apiResult.pageTriggered == assistant.apiResult.page) {
                        assistant.pulled_counter++;
                        //Mojo.Log.error('COUNTER: '+assistant.pulled_counter+' / '+offset.toArray()[1]);
                        if(assistant.pulled_counter >= 16) {
                            //Mojo.Log.error('COUNTER TRIGGERED: '+this.pulled_counter);                        
                            this.loadNextPage(assistant);
                            assistant.pulled_counter = 0;
                        }
                    } else assistant.pulled_counter = 0;
            }             
        },
    }
}();

Settings.loadFromDepot();

var interValId = false
function settingsChecker () {
  Mojo.Log.error('Waiting for settings: ' + intervalId); 
  Mojo.Log.error();
  if(Settings.defaultNed != '' && Settings.defaultTopic != '' 
        && Settings.loadImages != ''  && Settings.dblClick != ''
            && Settings.mobilizer != '' && Settings.topicsOrder != false
                && Settings.topicsHidden !== false) {
      Settings.ned = Settings.defaultNed;
      Settings.topic = Settings.defaultTopic;
      clearInterval(intervalId);
      Mojo.Controller.stageController.pushScene({name: "main", disableSceneScroller: true});
  }
}
        
function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
   // Setup Application Menu
   newsMenuAttr = {omitDefaultItems: true};
   newsMenuModel = {
     visible: true,
     items: [
       {label: "Edition", command: 'do-edition', shortcut: 'e'},
       {label: "Manage Topics", command: 'do-topics', shortcut: 't'},
       {label: "Settings", command: 'do-prefs', shortcut: 'p'},
       {label: "About", command: 'do-about', shortcut: 'a'},
     ]
   };
   this.waitForSettings();
   this.controller.setWindowOrientation("portrait");
};

StageAssistant.prototype.waitForSettings = function() {
   intervalId = setInterval ( "settingsChecker()", 200 );
}

StageAssistant.prototype.openSearchScene = function() {
    Mojo.Log.error('Opening serch scene');
    Mojo.Controller.stageController.pushScene({name: "search", disableSceneScroller: true});
}    

StageAssistant.prototype.handleCommand = function(event) {
    this.controller=Mojo.Controller.stageController.activeScene();
    
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
	            case 'do-about':
	                var msg = '<small>&#169; 2011, Martin Borho <a href="mailto:martin@borho.net">martin@borho.net</a><br/>';
	                msg += 'License: GNU General Public License (GPL) Vers.2<br/>';
	                msg += 'Source: <a href="http://github.com/mborho/newsg">http://github.com/mborho/newsg</a>';
	                msg += '<br/><br/><div><b>Changelog:</b><br/>'
//                     msg += '<div>* 2.0 - minor tweaks</div>';
                    msg += '<div>* 1.9.1 - topics now configurable - editions added - bug fixes</div>';
                    msg += '<div>* 1.7.0 - search added - pull to reload gesture added - option for google mobilizer</div>';
	                msg += '<div>* 1.4.2 - pull to refresh gesture added - more editions - this changelog</div>';
	                msg += '<div>* 1.4.0 - taiwanese and korean editions added - option for opening links with double click added</div>';
	                msg += '</div>';
	                msg += '</small>';
	                this.controller.showAlertDialog({
	                    onChoose: function(value) {},
	                    title: $L("NewsG - daily headlines from Google News. Simple yet elegant."),
	                    message: msg,
	                    allowHTMLMessage: true,
	                    choices:[
	                        {label:$L("OK"), value:""}
	                    ]
	                });
	                break;
	            case 'do-edition':
	                this.controller.showDialog({
	                   template: 'main/edition-dialog',
	                   assistant: new EditionDialogAssistant(this)
	                });
	                break;
                case 'do-topics':
                    this.controller.showDialog({
                       template: 'main/topics-dialog',
                       assistant: new TopicsDialogAssistant(this)
                    });
                    break;                    
	            case 'do-prefs':
	                this.controller.showDialog({
	                   template: 'main/prefs-dialog',
	                   assistant: new PreferencesDialogAssistant(this)
	                });
	                break;
        }        
    }
};

StageAssistant.prototype.moreLinkClicked = function(link) {
    url = link.href;
    if(Settings.mobilizer == 'On') {
        url = 'http://google.com/gwt/x?u='+encodeURIComponent(link.href)
    }      
    //Mojo.Log.info('open browser: '+url);
    var request = new Mojo.Service.Request('palm://com.palm.applicationManager', {
        method: 'open',
        parameters: {
            id: 'com.palm.app.browser',
            params: {
                target: url
            }
        }
    });
};

StageAssistant.prototype.getMoreListItem = function() {
    var html = '<div class="no-separator load-more" x-mojo-touch-feedback="immediate" ';
    html += ' id="itemLoadMore">'; 
    html += '<div class="palm-row-wrapper" id="load-more-icon" style="border-bottom:1px solid #fff;">';
    //html += '&#9660</div>';    
    html += '<img src="./icons/down.png" />';
    html += '</div></div>';
    return html;
};
