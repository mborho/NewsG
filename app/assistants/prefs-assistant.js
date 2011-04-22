var PreferencesDialogAssistant = Class.create({
  
    initialize: function(sceneAssistant) {
        this.sceneAssistant = sceneAssistant;
        this.controller = sceneAssistant.controller;
    },
 
    setup : function(widget) {
        this.widget = widget;
        this.refresh = false;
        
        this.defaultEditionModel = getEditionList();
        this.controller.setupWidget("defaultEditionSelector",
           this.attributes = {choices: this.defaultEditionModel},
           this.model = {
               value: getEditionLabel(Settings.defaultNed),
               disabled: false
           }
         ); 
         this.defaultEditionSelectorHandler = this.handleDefaultEditionSelect.bindAsEventListener(this);    
         this.controller.listen("defaultEditionSelector", Mojo.Event.propertyChange, this.defaultEditionSelectorHandler);        
                                   
        this.defaultTopicModel = [
            {label: "Top Stories", value: "h"},
            {label: "World", value: "w"},
            {label: "National", value: "n"},
            {label: "Business", value: "b"},            
            {label: "Science/Technology", value: "t"},
            {label: "Politics", value: "p"},
            {label: "Entertainment", value: "e"},
            {label: "Sports", value: "s"},
            {label: "Health", value: "m"},
            {label: "Spotlight", value: "ir"},
            {label: "Most Popular", value: "po"}
        ]
        var topicLabel = getTopicLabel('us', Settings.defaultTopic);
        if(Settings.defaultTopic == 'n') topicLabel = 'National';

        this.controller.setupWidget("defaultTopicSelector",
           this.attributes = {choices: this.defaultTopicModel},
           this.model = {
               value: topicLabel,
               disabled: false
           }
         ); 
         this.defaultTopicSelectorHandler = this.handleDefaultTopicSelect.bindAsEventListener(this);    
         this.controller.listen("defaultTopicSelector", Mojo.Event.propertyChange, this.defaultTopicSelectorHandler);        
         
         this.controller.setupWidget("defaultLoadImages",
            this.attributes = {
               trueValue: "On",
               falseValue: "Off"
            },
            this.model = {
               value: Settings.loadImages,
               disabled: false
             }
         ); 
         this.loadImagesHandler = this.handleLoadImagesSelect.bindAsEventListener(this);    
         this.controller.listen("defaultLoadImages", Mojo.Event.propertyChange, this.loadImagesHandler);          
         
         this.controller.setupWidget("defaultDblClick",
            this.attributes = {
               trueValue: "On",
               falseValue: "Off"
            },
            this.model = {
               value: Settings.dblClick,
               disabled: false
             }
         ); 
         this.dblClickHandler = this.handleDblClickSelect.bindAsEventListener(this);    
         this.controller.listen("defaultDblClick", Mojo.Event.propertyChange, this.dblClickHandler);                  
         
         this.controller.setupWidget("defaultMobilizer",
            this.attributes = {
               trueValue: "On",
               falseValue: "Off"
            },
            this.model = {
               value: Settings.mobilizer,
               disabled: false
             }
         ); 
         this.mobilizerHandler = this.handleMobilizerSelect.bindAsEventListener(this);    
         this.controller.listen("defaultMobilizer", Mojo.Event.propertyChange, this.mobilizerHandler);           
    },
 
    cleanup: function (widget) {
       if(this.refresh == true) {
           Mojo.Controller.stageController.swapScene({name: "main", disableSceneScroller: true});
       }
    }, 
    handleDefaultEditionSelect: function(event) {        
        Settings.defaultNed = event.value
        db.add('settings.defaultEdition', {"value":event.value}, dbSuccess, dbFailure);
    },
    
    handleDefaultTopicSelect: function(event) {        
        Settings.defaultTopic = event.value
        db.add('settings.defaultTopic', {"value":event.value}, dbSuccess, dbFailure);
    },
    
    handleLoadImagesSelect: function(event) {        
        Settings.loadImages = event.value        
        db.add('settings.loadImages', {"value":event.value}, dbSuccess, dbFailure);
        this.refresh = true;
    },
    
    handleDblClickSelect: function(event) {        
        Settings.dblClick = event.value
        db.add('settings.dblClick', {"value":event.value}, dbSuccess, dbFailure);
        this.refresh = true;        
    },
    handleMobilizerSelect: function(event) {        
        Settings.mobilizer = event.value
        db.add('settings.mobilizer', {"value":event.value}, dbSuccess, dbFailure);
        this.refresh = true;        
    }   
});
