import { wordWrap } from '../../helpers.js'

export default function textToMultilineFormat(text, targetFormat = 1, charsPerLine = 0.4, correctWay = false) {

  const chars = text.split("");

  const dividers = [];

  for (var i = 1; i <= chars.length; i++) {
    // How much chars per line would it be?
    /*const divideResult = chars.length / i;
    console.log(divideResult);
    // Round result to next integer
    const divideNextInt = Math.round(divideResult);
    // If this amount of chars per line already is listened, ignore it
    if (!dividers.includes(divideNextInt)) {
      dividers.push(divideNextInt);
    }*/
    dividers.push(i);
  }


  if (correctWay) {
    // Use the dividers (numbers that definitely divide the text to equal long parts) as wrapping borders
    const wraps = dividers.map(wrapBorder => {
      const linesAmount = Math.round(chars.length / wrapBorder);

      const wrappedLines = wordWrap(text, wrapBorder + 1).split("\n");

      const maxLength = Math.max(...wrappedLines.map(line => line.length));

      const linesInWidth = maxLength * charsPerLine;
      const format = wrappedLines.length / linesInWidth;

      return {
        wrapBorder: wrapBorder,
        format: format,
        lines: wrappedLines
      };
    });

    const closestWrap = wraps.sort((a, b) => {
      const formatDiffA = Math.abs(a.format - targetFormat);
      const formatDiffB = Math.abs(b.format - targetFormat);

      return formatDiffA > formatDiffB ? 1 : -1;
    })[0];


    return closestWrap.lines;
  }


  else {
    const bestWrap = dividers.map(wrapBorder => {

      const linesAmount = Math.round(chars.length / wrapBorder);

      const linesInWidth = wrapBorder * charsPerLine;
      const format = linesAmount / linesInWidth;


      return {
        linesAmount: linesAmount,
        format: format,
        wrapBorder: wrapBorder
      };
    }).sort((a, b) => {
      const formatDiffA = Math.abs(a.format - targetFormat);
      const formatDiffB = Math.abs(b.format - targetFormat);

      return formatDiffA > formatDiffB ? 1 : -1;
    })[0];

    //console.log(bestWrap.linesAmount);

    const lines = wordWrap(text, bestWrap.wrapBorder).split("\n");

    return lines;
  }



}
