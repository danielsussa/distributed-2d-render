import $ from 'jquery';
import _ from 'lodash';
import './style.scss';
import ColorPicker from './color-picker';
// import DrawCanvas from './draw';
var draw = require('./draw');
var toolbar = require('./toolbar');
import PreviewWorker from './worker/view-render.worker.js';



var previewWorker = null;

$( document ).ready(function() {
  new ColorPicker($);
  toolbar.start($);
  draw.newCanvas($)
  draw.adjustFrame();
});

var renderStatus = 'stopper'

$("body").on("draw-render-info", function(e, sceneInfo){
  preparePreviewCanvas(sceneInfo.size);

  const renderWorker = new Worker('worker/render.worker.js');
  renderWorker.postMessage({data:sceneInfo, action: 'preview-render'});

  renderWorker.addEventListener('message', function(e) {
    if (e.data.action === 'ready'){
      renderStatus = 'started';
      $(".preview-stage").fadeIn();
      $(".back-to-editor").click(function(){
        renderStatus = 'stopper'
      });
    }
    
    if (e.data.action === 'send_data'){
      previewWorker.postMessage({action: 'render'});
    }
    if (e.data.action === 'drawSphereLight' || e.data.action === 'debugDrawPixel' || e.data.action === `debugLineRender` || e.data.action === 'drawRaytrace'){
        // console.log(e.data.action)
        previewWorker.postMessage({action: e.data.action, data: e.data.data});
    }
    if (e.data.action == 'counter'){
      if (renderStatus === 'started'){
        renderWorker.postMessage({action: 'continue'});
      }
    }

  }, false);
})



function preparePreviewCanvas(size){
  var canvasOffscreen = document.getElementById('light-canvas').transferControlToOffscreen();
  canvasOffscreen.width = size.w;
  canvasOffscreen.height = size.h;
  previewWorker = new PreviewWorker();
  previewWorker.postMessage({canvas: canvasOffscreen}, [canvasOffscreen]);
}