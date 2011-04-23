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
        defaultTopic: '',
        topic: '',
        defaultNed: '',
        ned: '',
        loadImages: '',
        dblClick: '',
        mobilizer: '',
        color: '',
        page: 1,
        pageTriggered: 1,
        pageLength: 8,
        
        loadFromDepot: function() {
            this.loadDefaultEdition();
            this.loadDefaultTopic();
            this.loadDefaultDblClick();
            this.loadDefaultMobilizer();
            this.loadDefaultImgLoad();
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
    }    
}();   

var ApiResult = function() {
    return {
        cursor: false,
        getMaxPage: function() {
             try {
                return this.cursor.pages.toArray().length;
             } catch(e) {}
             return 1;
        },    
    }    
}(); 

Settings.loadFromDepot();

var interValId = false
function settingsChecker () {
  Mojo.Log.error('Waiting for settings: ' + intervalId); 
  if(Settings.defaultNed != '' && Settings.defaultTopic != '' 
        && Settings.loadImages != ''  && Settings.dblClick != ''
            && Settings.mobilizer != '') {
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

StageAssistant.prototype.handleCommand = function(event) {
    this.controller=Mojo.Controller.stageController.activeScene();
    
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
	            case 'do-about':
	                var msg = '<small>&#169; 2011, Martin Borho <a href="mailto:martin@borho.net">martin@borho.net</a><br/>';
	                msg += 'License: GNU General Public License (GPL) Vers.2<br/>';
	                msg += 'Source: <a href="http://github.com/mborho/newsg">http://github.com/mborho/newsg</a>';
	                msg += '<br/><br/><div><b>Changelog:</b><br/>'
	                msg += '<div>* 1.4.2<br/> - pull to refresh gesture added<br/> - more editions<br/> - this changelog</div>';
	                msg += '<div>* 1.4.0<br/> - taiwanese and korean editions added<br/> - option for opening links with double click added</div>';
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
	            case 'do-prefs':
	                this.controller.showDialog({
	                   template: 'main/prefs-dialog',
	                   assistant: new PreferencesDialogAssistant(this)
	                });
	                break;
        }        
    }
}; 