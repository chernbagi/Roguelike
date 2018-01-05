export let Message = {
  curMessage: '',
  targetDisplay: '',
  init: function(targetDisplay){
    this.targetDisplay = targetDisplay;
  },
  render: function() {
    if(!this.targetDisplay){return;}
    this.targetDisplay.clear();
    this.targetDisplay.drawText(1,1,this.curMessage,'#fff','#000')
  },
  send: function(msg){
    this.curMessage = msg;
    this.render();
  },
  clear: function(){
    this.curMessage = '';
  }
};
