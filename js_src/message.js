export let Message = {
  curMessage: '',
  targetDisplay: '',
  cache: '',
  init: function(targetDisplay){
    this.targetDisplay = targetDisplay;
  },
  render: function() {
    if(!this.targetDisplay){console.log("ploop");return;}
    this.targetDisplay.clear();
    this.targetDisplay.drawText(1,1,this.curMessage,'#fff','#000');
  },
  send: function(msg){
    this.curMessage = msg;
    this.cache = this.curMessage + "\n" + this.cache;
    if (this.curMessage.includes("\n")) {
      if (this.cache.str.split(/\r\n|\r|\n/).length == 5){
        this.cache = this.cache[0, this.cache.str.split(/\r\n|\r|\n/).length - this.cache.str.split(/\r\n|\r|\n/)[100].length - 1]
      }
    }
    this.render();
    console.log(this.curMessage);
  },
  clear: function(){
    this.curMessage = '';
  }
};
