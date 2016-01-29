/**
 * Created by Samuel Gratzl on 16.12.2015
 */

import template = require('../clue/template');
import cmode = require('../caleydo_provenance/mode');
import plugins = require('../caleydo_core/plugin');
import targid = require('./Targid');
import $ = require('jquery');

let helper = document.getElementById('app');

const elems = template.create(document.body, {
  app: 'Targid V2',
  application: '/targid2',
  id: 'targid2'
});

const main = <HTMLElement>elems.$main.node();
main.classList.add('targid');
while (helper.firstChild) {
  main.appendChild(helper.firstChild);
}

var $left_data = $('div.browser');
if (cmode.getMode().exploration < 0.8) {
  $left_data.hide();
} else {
  $left_data.show();
}
elems.on('modeChanged', function (event, new_) {
  if (new_.exploration < 0.8) {
    $left_data.animate({height: 'hide'}, 'fast');
  } else {
    $left_data.animate({height: 'show'}, 'fast');
  }
});

elems.graph.then((graph) => {
  const t = targid.create(graph, main);

  const views = plugins.list('targidView');
  const $views = elems.$main.select('div.browser').selectAll('button').data(views);
  $views.enter().append('button').on('click', (d) =>  {
    t.push(d.id);
  });
  $views.text((d) => '+ '+ d.name);
});

elems.jumpToStored();
