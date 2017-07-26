/* global PIXI*/

var Useful = Useful || {};
Useful.GameView.TextBox = function (x,y,fs,wrap)  //x,y: position of text field; fs: fontsize
{
  var textBox = new PIXI.Text
  (
    "Message",
    {
      fontFamily: "Arial",
      fontWeight: "bold",
      stroke: "#ffffff",
      strokeThickness: 5,
      wordWrap: wrap,
      fill: "#ff0000",
      fontSize: fs,
    }
  );
  textBox.position.set(x,y);

  return textBox;
};
