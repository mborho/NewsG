//function EditionAssistant(sceneAssistant) {
//  this.sceneAssistant = sceneAssistant;

var EditionDialogAssistant = Class.create({
  
    initialize: function(sceneAssistant) {
        this.sceneAssistant = sceneAssistant;
        this.controller = sceneAssistant.controller;
    },
 
    setup : function(widget) {
        this.widget = widget;
        
        // list widget
        this.editionModel2 = {"items": [
           {title:'United States', ned:'us'},
           {title:'United Kingdom', ned:'uk'},
           {title:'Germany', ned:'de'},
           {title:'France', ned:'fr'},
           {title:'Spain', ned:'es'},
           {title:'Italy', ned:'it'},
           {title:'Russia', ned:'ru'},
           {title:'Australia', ned:'au'}
        ]}
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
        MainAssistant.prototype.editionUpdate(event.item.ned);
        this.widget.mojo.close();
    }
});
