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
    }
});
