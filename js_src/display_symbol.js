//create basis for things to be displayed on the map

import {Color} from './colors.js';

export class DisplaySymbol {

  constructor(chr, fg, bg) {
    this.chr = chr || ' ';
    this.fg = fg || Color.FG;
    this.bg = bg || Color.BG;
  }

  render(display, consoleX, consoleY) {
    display.draw(consoleX, consoleY, this.chr, this.fg, this.bg);
  }

}

console.dir(new DisplaySymbol('x'));
