import textInfo from '../vue-helpers/textInfo.js'

const multiline = {
  props: ['x', 'y', 'text', 'padding', 'lineheight', 'background', 'css', 'verticalalign', 'align'],
  data: function() {
    return {
      a: 100
    };
  },
  computed: {
    pos() {
      return {
        x: Number(this.x),
        y: Number(this.y)
      };
    },
    offset() {
      const padding = this.padding.split(" ").map(Number);
      return [
        padding[0],
        padding[1] || padding[0],
        padding[2] || padding[0],
        padding[3] || padding[1] || padding[0]
      ];
    },
    computedStyle() {
      const testElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
      testElement.style = this.css;
      return testElement.style;
    },
    styleObj() {
      const computedStyle = this.computedStyle;

      const obj = {};
      for (let key in computedStyle) {
        if (computedStyle.hasOwnProperty(key)) {
          const value = computedStyle[key];
          if (key.match(/[^0-9]/) && value) {
            obj[key] = value;
          }
        }
      }
      return obj;
    },
    fontSize() {
      return Number(this.computedStyle["font-size"].replace(/[^0-9]/g, ""));
    },
    linesSortedByLength() {
      const lines = Array.from(this.text);
      const linesSorted = new Array(lines.length).fill(null).map((line, index) => {
        var maxIndex = null;
        for (var i = 0; i < lines.length; i++) {
          if (lines[i]) {
            if (maxIndex == null || lines[i].length > lines[maxIndex].length) {
              maxIndex = i;
            }
          }
        }

        const maxLine = lines[maxIndex];
        delete lines[maxIndex];

        return maxLine;
      });

      return linesSorted;

    },
    lines() {

      const viewBox = this.$root.$el.closest("svg").getAttribute("viewBox").split(" ").map(numberStr => parseInt(numberStr));
      const verticalAlign = this["verticalalign"];
      const align = this["align"];
      const lineHeight = Number(this.lineheight || 1.1);

      const totalRectSize = {
        width: this.offset[3] + textInfo(this.linesSortedByLength[0], this.styleObj).width + this.offset[1],
        height: this.offset[0] + (this.fontSize * 1) + this.offset[2]
      };

      const totalHeight = (totalRectSize.height * lineHeight) * this.text.length;

      const x = align == "right" ? (viewBox[2] - Number(this.x) - totalRectSize.width) : Number(this.x);
      const y = (viewBox[3] + Number(this.y)) % viewBox[3];

      return this.text.map((line, index) => {
        const yPos = y + (totalRectSize.height * lineHeight) * index;

        const rectSize = {
          width: this.offset[3] + textInfo(line, this.styleObj).width + this.offset[1],
          height: totalRectSize.height
        }

        return {
          text: line,
          x: x,
          y: verticalAlign == "center" ? (yPos - totalHeight / 2) : (Number(this.y) >= 0 ? yPos : (yPos - totalHeight)),
          width: rectSize.width,
          height: rectSize.height
        };
      });
    }
  },
  created() {

  },
  template: `
    <g>
      <g v-for="line in lines" v-bind:style="styleObj">
        <rect v-bind:x="line.x" v-bind:y="line.y" v-bind:height="line.height" v-bind:width="line.width" v-bind:style="{ fill: background }" />
        <text v-bind:x="line.x + offset[3]" v-bind:y="line.y + offset[0]" style="alignment-baseline: hanging;" letter-spacing="0">
          {{ line.text }}
        </text>
      </g>
    </g>
  `
};

const multilineComponent = {
  tagName: 'multiline-text',
  component: multiline
};

export default multilineComponent
