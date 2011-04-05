global_ned = 'de'
global_topic = 'h'
global_color = getTopicColor(global_topic);
link_clicked = false;

function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	this.controller.pushScene({name: "main", disableSceneScroller: true});
	this.controller.setWindowOrientation("portrait");
};

StageAssistant.prototype.handleCommand = function(event) {
    this.controller=Mojo.Controller.stageController.activeScene();
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'do-about':
                this.controller.showAlertDialog({
                    onChoose: function(value) {},
                    title: $L("NewsG - a simple reader for Google News"),
                    message: $L("Copyright 2011, Martin Borho"),
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
 
            //case 'do-appHelp':
            //    this.controller.pushScene("myAppHelp");
            //    break;
        }
    }
}; 