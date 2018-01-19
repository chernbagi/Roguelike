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
    if (this.cache) {
      if (this.cache.split("\n").length == 100){
        this.cache = this.cache[0, this.cache.split("\n").length - this.cache.split("\n")[99].length - 1]
      }
    }
    this.render();
  },
  clear: function(){
    this.curMessage = '';
  },
  clearCache: function() {
    this.cache = '';
  }
};
