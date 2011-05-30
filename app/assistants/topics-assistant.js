// Copyright 2011 Martin Borho <martin@borho.net>
// GPL2 - see license.txt for details

var TopicsDialogAssistant = Class.create({
  
    initialize: function(sceneAssistant) {
        this.sceneAssistant = sceneAssistant;
        this.controller = sceneAssistant.controller;
    },
 
    setup : function(widget) {
        this.widget = widget;
        
        // list widget
        this.controller.setupWidget("manageTopicsList",
          this.attributes = {
              itemTemplate: "main/topicRowTemplate",
              listTemplate: "main/topicListTemplate",
              swipeToDelete: false,
              renderLimit: 12,
              reorderable: true
          },
          {"items": Settings.getManagedTopics()}
        );
        this.controller.listen("manageTopicsList", Mojo.Event.listReorder , this.handleReordering.bindAsEventListener(this));        
        this.controller.listen("manageTopicsList", Mojo.Event.listTap , this.handleHiding.bindAsEventListener(this));        
        
        this.controller.get("manageTopicsScroller").style.height = Settings.dialogScrollerHeight;
    },
 
    cleanup: function (widget) {
       if(this.refresh == true) {
           Mojo.Controller.stageController.swapScene({name: "main", disableSceneScroller: true});
       }
    }, 
    
    handleReordering: function(event) { 
        // which topic was moved
        var movedTopic = Settings.topicsOrder.slice(event.fromIndex,event.fromIndex+1);
        // remove and insert
        Settings.topicsOrder.splice(event.fromIndex,1);
        Settings.topicsOrder.splice(event.toIndex,0, movedTopic);
        // save
        db.add('settings.topicsOrder', {"value":Settings.topicsOrder}, dbSuccess, dbFailure);
        this.refresh = true;
    },

    handleHiding: function(event) {
        var topic = event.item.value
        var icon = $('topicEye_'+topic)
        var icon_src = './icons/visibility_';
        if( Settings.isHiddenTopic(topic)) {
            Settings.topicsHidden.splice(Settings.topicsHidden.indexOf(topic),1); 
            icon.src = icon_src+'show.png';
        } else {
            Settings.topicsHidden.push(topic);
            icon.src = icon_src+'hidden.png';
        }
        Mojo.Log.error(Settings.topicsHidden);
        db.add('settings.topicsHidden', {"value": Settings.topicsHidden}, dbSuccess, dbFailure);
        this.refresh = true;
    }

});

