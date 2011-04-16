var EditionDialogAssistant = Class.create({
  
    initialize: function(sceneAssistant) {
        this.sceneAssistant = sceneAssistant;
        this.controller = sceneAssistant.controller;
    },
 
    setup : function(widget) {
        this.widget = widget;
        
        // list widget
        this.editionModel = {"items": getEditionList()};
        this.controller.setupWidget("editionListWgt",
          this.attributes = {
              itemTemplate: "main/editionRowTemplate",
              listTemplate: "main/editionListTemplate",
              swipeToDelete: false,
              renderLimit: 40,
              reorderable: false
          },
          this.editionModel
        );
        this.controller.listen("editionListWgt", Mojo.Event.listTap, this.handleSelect.bindAsEventListener(this));
    },
 
    handleSelect: function(event) {        
        MainAssistant.prototype.editionUpdate(event.item.value);
        this.widget.mojo.close();
    }
});