import $ from 'jquery';
import _ from 'lodash';
import './style.scss';
import ColorPicker from './color-picker';
// import DrawCanvas from './draw';
var draw = require('./draw');
import RenderWorker from './worker/render.worker.js';
import PreviewWorker from './worker/preview.worker.js';


var colorPicker;



$( document ).ready(function() {
  colorPicker = new ColorPicker($);
  draw.newCanvas($)
  draw.adjustFrame();
});

