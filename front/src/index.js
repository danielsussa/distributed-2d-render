import _ from 'lodash';
import './style.scss';
import ColorPicker from './color-picker';
import DrawCanvas from './draw';
var draw = require('./draw');
import RenderWorker from './worker/render.worker.js';
import PreviewWorker from './worker/preview.worker.js';


var colorPicker;

const renderWorker = new RenderWorker();

// worker.postMessage({ a: 1 });
// worker.onmessage = function (event) {};


$( document ).ready(function() {
  colorPicker = new ColorPicker(document.getElementById('color-picker-canvas'));
  draw.newCanvas(document.getElementById('draw-canvas'))
  draw.adjustFrame();
});

