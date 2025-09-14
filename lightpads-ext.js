(function(Scratch){
  'use strict';
  const vm = Scratch.vm;
  let ws=null, connected=false, lastPad=0;
  function send(o){ if(ws && ws.readyState===1) ws.send(JSON.stringify(o)); }

  class Lightpads {
    getInfo(){ return {
      id:'lightpads', name:'Lightpads', color1:'#ff8c00',
      blocks:[
        {blockType:'label', text:'Connect'},
        {opcode:'connect', blockType:'command', text:'connect to [URL]',
          arguments:{URL:{type:'string', defaultValue:'ws://controller.local:8080/scratch'}}},
        {opcode:'isConnected', blockType:'Boolean', text:'controller connected?'},
        '---',
        {blockType:'label', text:'Pads'},
        {opcode:'setColor', blockType:'command', text:'set pad [PAD] color [COLOR]',
          arguments:{PAD:{type:'number', defaultValue:1}, COLOR:{type:'string', defaultValue:'#00FF88'}}},
        {opcode:'clear', blockType:'command', text:'clear pads'},
        '---',
        {blockType:'label', text:'Events'},
        {opcode:'whenPadPressed', blockType:'hat', text:'when pad [PAD] pressed',
          arguments:{PAD:{type:'number', defaultValue:1}}},
        {opcode:'lastPad', blockType:'reporter', text:'last pad'}
      ]};}
    connect({URL}) {
      if(ws) try{ws.close();}catch(e){}
      ws = new WebSocket(URL);
      ws.onopen = ()=> connected=true;
      ws.onclose = ()=> connected=false;
      ws.onerror = ()=> connected=false;
      ws.onmessage = ev=>{
        try{
          const m = JSON.parse(ev.data);
          if(m.op==='pad' && m.state==='press'){
            lastPad = m.pad;
            vm.runtime.startHats('lightpads_whenPadPressed',{PAD:m.pad});
          }
        }catch(e){}
      };
    }
    isConnected(){ return connected; }
    setColor({PAD,COLOR}){ send({op:'set_color', pad:Number(PAD), color:String(COLOR)}); }
    clear(){ send({op:'clear'}); }
    whenPadPressed(args){ return lastPad===Number(args.PAD); }
    lastPad(){ return lastPad||0; }
  }
  Scratch.extensions.register(new Lightpads());
})(window.Scratch);

