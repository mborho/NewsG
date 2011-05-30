// Copyright 2011 Martin Borho <martin@borho.net>
// GPL2 - see license.txt for details

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
        this.controller.get("editionScroller").style.height = Settings.dialogScrollerHeight;
    },
 
    handleSelect: function(event) {        
        MainAssistant.prototype.editionUpdate(event.item.value);
        this.widget.mojo.close();
    }
});
