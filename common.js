/* ================================================================
   秦言三韵 · 共享 JS
   陕西地域方言智能文创
   ================================================================ */

// ── HMAC-SHA256 (file:// compatible) ─────────────────────
var XF_HMAC = (function(){
    var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    function ROTR(n,x){return (x>>>n)|(x<<(32-n));}
    function SHR(n,x){return x>>>n;}
    function Ch(x,y,z){return (x&y)^(~x&z);}
    function Maj(x,y,z){return (x&y)^(x&z)^(y&z);}
    function Sigma0(x){return ROTR(2,x)^ROTR(13,x)^ROTR(22,x);}
    function Sigma1(x){return ROTR(6,x)^ROTR(11,x)^ROTR(25,x);}
    function sigma0(x){return ROTR(7,x)^ROTR(18,x)^SHR(3,x);}
    function sigma1(x){return ROTR(17,x)^ROTR(19,x)^SHR(10,x);}
    function toBytes(str){var b=[];for(var i=0;i<str.length;i++){var c=str.charCodeAt(i);if(c<128)b.push(c);else if(c<2048){b.push(192|(c>>6));b.push(128|(c&63));}else if(c<55296||c>=57344){b.push(224|(c>>12));b.push(128|((c>>6)&63));b.push(128|(c&63));}else{i++;c=((c&1023)<<10)|(str.charCodeAt(i)&1023);b.push(240|(c>>18));b.push(128|((c>>12)&63));b.push(128|((c>>6)&63));b.push(128|(c&63));}}return b;}
    function sha256(msg){var H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];var M=[];var bytes=typeof msg==='string'?toBytes(msg):msg;var bitLen=bytes.length*8;bytes.push(0x80);while((bytes.length*8+64)%512!==0)bytes.push(0);for(var i=0;i<8;i++)bytes.push((bitLen>>>((7-i)*8))&0xff);for(var i=0;i<bytes.length;i+=64){for(var t=0;t<16;t++)M[t]=((bytes[i+t*4]<<24)|(bytes[i+t*4+1]<<16)|(bytes[i+t*4+2]<<8)|bytes[i+t*4+3])>>>0;for(var t=16;t<64;t++)M[t]=(sigma1(M[t-2])+M[t-7]+sigma0(M[t-15])+M[t-16])>>>0;var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];for(var t=0;t<64;t++){var T1=(h+Sigma1(e)+Ch(e,f,g)+K[t]+M[t])>>>0;var T2=(Sigma0(a)+Maj(a,b,c))>>>0;h=g;g=f;f=e;e=(d+T1)>>>0;d=c;c=b;b=a;a=(T1+T2)>>>0;}H[0]=(H[0]+a)>>>0;H[1]=(H[1]+b)>>>0;H[2]=(H[2]+c)>>>0;H[3]=(H[3]+d)>>>0;H[4]=(H[4]+e)>>>0;H[5]=(H[5]+f)>>>0;H[6]=(H[6]+g)>>>0;H[7]=(H[7]+h)>>>0;}var r='';for(var i=0;i<8;i++)for(var j=0;j<4;j++)r+='0123456789abcdef'[(H[i]>>>((3-j)*8))>>4&15]+'0123456789abcdef'[H[i]>>>((3-j)*8)&15];return r;}
    function hmac_sha256(key,msg){var kb=typeof key==='string'?toBytes(key):key;if(kb.length>64){var h=sha256(kb);kb=[];for(var i=0;i<h.length;i+=2)kb.push(parseInt(h.substr(i,2),16));}while(kb.length<64)kb.push(0);var op=[],ip=[];for(var i=0;i<64;i++){op.push(kb[i]^0x5c);ip.push(kb[i]^0x36);}var ih=sha256(ip.concat(typeof msg==='string'?toBytes(msg):msg));var ib=[];for(var i=0;i<ih.length;i+=2)ib.push(parseInt(ih.substr(i,2),16));return sha256(op.concat(ib));}
    function toBase64(str){var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';var bytes=typeof str==='string'?toBytes(str):str;var r='';for(var i=0;i<bytes.length;i+=3){var b=((bytes[i]<<16)|(bytes[i+1]<<8)|bytes[i+2])>>>0;r+=chars[(b>>18)&63]+chars[(b>>12)&63]+chars[(b>>6)&63]+chars[b&63];}var pad=bytes.length%3;if(pad===1)r=r.substr(0,r.length-2)+'==';else if(pad===2)r=r.substr(0,r.length-1)+'=';return r;}
    function hexToBytes(hex){var b=[];for(var i=0;i<hex.length;i+=2)b.push(parseInt(hex.substr(i,2),16));return b;}
    return {hmac:function(k,m){return hmac_sha256(k,m);},hmacBase64:function(k,m){var h=hmac_sha256(k,m);return toBase64(hexToBytes(h));},sha256:function(m){return sha256(m);}};
})();

// ── API 配置 ─────────────────────────────────────────
var API_VOLC={name:'火山引擎·豆包',apiKey:(typeof CONFIG!=='undefined'&&CONFIG.VOLC_API_KEY)||'YOUR_API_KEY',model:(typeof CONFIG!=='undefined'&&CONFIG.VOLC_MODEL)||'YOUR_MODEL',url:'https://ark.cn-beijing.volces.com/api/v3/chat/completions'};
var API_DEEPSEEK={name:'DeepSeek',apiKey:'YOUR_DEEPSEEK_API_KEY_HERE',model:'deepseek-chat',url:'https://api.deepseek.com/chat/completions'};

// ── 状态管理（localStorage 持久化）─────────────────────
var STATE = {
    get provider(){ return localStorage.getItem('qy_provider')||'volc'; },
    set provider(v){ localStorage.setItem('qy_provider',v); },
    get voiceEngine(){ return localStorage.getItem('qy_voiceEngine')||'edgetts'; },
    set voiceEngine(v){ localStorage.setItem('qy_voiceEngine',v); },
    get edgeTtsUrl(){ return localStorage.getItem('qy_edgettsUrl')||'http://localhost:9880'; },
    set edgeTtsUrl(v){ localStorage.setItem('qy_edgettsUrl',v); },
    get xfAppId(){ return localStorage.getItem('qy_xfAppId')||(typeof CONFIG!=='undefined'&&CONFIG.XF_APP_ID)||''; },
    set xfAppId(v){ localStorage.setItem('qy_xfAppId',v); },
    get xfApiKey(){ return localStorage.getItem('qy_xfApiKey')||(typeof CONFIG!=='undefined'&&CONFIG.XF_API_KEY)||''; },
    set xfApiKey(v){ localStorage.setItem('qy_xfApiKey',v); },
    get xfApiSecret(){ return localStorage.getItem('qy_xfApiSecret')||(typeof CONFIG!=='undefined'&&CONFIG.XF_API_SECRET)||''; },
    set xfApiSecret(v){ localStorage.setItem('qy_xfApiSecret',v); }
};

function getCurrentAPIConfig(){ return STATE.provider==='deepseek'?API_DEEPSEEK:API_VOLC; }

// ── 语音引擎 ────────────────────────────────────────
var EDGE_TTS = { get apiUrl(){ return STATE.edgeTtsUrl; }, set apiUrl(v){ STATE.edgeTtsUrl=v; } };
var XUNFEI = {
    get appId(){ return STATE.xfAppId; }, set appId(v){ STATE.xfAppId=v; },
    get apiKey(){ return STATE.xfApiKey; }, set apiKey(v){ STATE.xfApiKey=v; },
    get apiSecret(){ return STATE.xfApiSecret; }, set apiSecret(v){ STATE.xfApiSecret=v; },
    voices: { guanzhong:'aisxde', shanbei:'aisxds', shannan:'aisxdn', classical:'aisxde', normal:'aisxde' }
};

function getVoiceEngine(){ return STATE.voiceEngine; }
function setVoiceEngine(v){ STATE.voiceEngine=v; }

// ── AI 调用 ─────────────────────────────────────────
function setApiStatus(msg, err){
    var el=document.getElementById('apiStatus');
    if(el){ el.textContent=msg; el.style.color=err?'#CC3333':'var(--ink)'; }
}

async function callAI(sp, ui){
    var cfg=getCurrentAPIConfig();
    setApiStatus('⏳ 调用 '+cfg.name+'...');
    var resp=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+cfg.apiKey},body:JSON.stringify({model:cfg.model,messages:[{role:'system',content:sp},{role:'user',content:ui}],max_tokens:150,temperature:0.2})});
    if(!resp.ok){ var e=''; try{var d=await resp.json();e=d.error?.message||JSON.stringify(d);}catch(ex){e='HTTP '+resp.status;} throw new Error(cfg.name+' 失败: '+e); }
    var data=await resp.json(); setApiStatus('✅ 调用成功');
    return (data.choices?.[0]?.message?.content||'').trim();
}

// ── 提示词 ─────────────────────────────────────────
var PROMPTS = {
    guanzhong: '你扮演地道老西安本地人，只用纯正关中市井口语改写用户输入。使用西安方言字词——"吃"→"咥"、"聊天"→"谝闲传"、"很好"→"嫽咋咧"、"散步"→"溜达溜达"、"怎么了"→"咋咧"、"舒服"→"受活"。句式简短接地气。只输出方言文字，控制在50字内，使用标准汉字。',
    shanbei:   '你扮演陕北黄土高原本地老乡，用豪迈质朴的陕北乡土口语改写内容。使用陕北方言——"敞亮""舒坦""走哇""咋咧""可美咧""好活"。语言直白爽朗。只输出方言文字，控制在50字内，标准汉字。',
    shannan:   '你扮演陕南本地居民，用轻柔温婉的陕南口语风格改写内容。使用陕南方言——"蛮舒服""可好啦""晓得不""得行""莫问题"。语气舒缓柔和。只输出结果，控制在50字内，标准汉字。',
    classical: '将用户输入的陕西相关现代文案转化为贴合大唐长安风格的古典文雅短句，文风古韵十足。只输出改写后古风文字，控制在60字内，用词典雅。',
    dict:      '对用户输入的陕西方言词汇或生僻字进行解码，按以下格式输出：1.【发音】标注读音和声调 2.【释义】标准含义 3.【地域】所属方言区（关中/陕北/陕南）4.【典故】由来的民俗背景或历史典故。条理清晰，控制在120字内。'
};

// ── 文本预处理（让 TTS 读得更自然）─────────────────
function normalizeText(text){
    text = text.trim().replace(/\s+/g, '');
    if (!/[。！？!?]$/.test(text)) text += '。';
    // 语气词后加逗号停顿
    text = text.replace(/([咧呢嘛哈呀哇哦咯哩呗噢啊])([^\s，,。！？!?])/g, '$1，$2');
    // 短句过长(>18字)且无停顿 → 在动词/方位词后加逗号
    var parts = text.split(/[，,。！？!?]/);
    var result = [];
    for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.length > 18 && !/[，,]/.test(p)) {
            p = p.replace(/(.{8,12})(?=[走去来上到在给把被让跟和与])/g, '$1，');
        }
        result.push(p);
    }
    return result.join('，');
}

// ── Edge-TTS ──────────────────────────────────────
function speakWithEdgeTTS(text, style, btn){
    return new Promise(function(resolve, reject){
        var url = EDGE_TTS.apiUrl + '/tts?text=' + encodeURIComponent(normalizeText(text)) + '&style=' + (style||'normal');
        if(btn){ btn.disabled=true; btn.classList.add('playing'); btn.querySelector('.btn-label')?btn.querySelector('.btn-label').textContent='合成中...':btn.innerHTML='🎧 合成中...'; }
        fetch(url, { signal: AbortSignal.timeout(30000) }).then(function(r){
            if(!r.ok) return r.text().then(function(t){ throw new Error('TTS失败: ' + t.substring(0,100)); });
            return r.blob();
        }).then(function(blob){
            var u=URL.createObjectURL(blob); var a=new Audio(u);
            a.onended=function(){ URL.revokeObjectURL(u); if(btn){ btn.disabled=false; btn.classList.remove('playing'); btn.querySelector('.btn-label')?btn.querySelector('.btn-label').textContent='播放方言':btn.innerHTML='🔊 播放方言语音'; } resolve(); };
            a.onerror=function(){ URL.revokeObjectURL(u); reject(new Error('播放失败')); };
            a.play().catch(function(e){ URL.revokeObjectURL(u); reject(e); });
        }).catch(function(e){ if(btn){ btn.disabled=false; btn.classList.remove('playing'); btn.querySelector('.btn-label')?btn.querySelector('.btn-label').textContent='播放方言':btn.innerHTML='🔊 播放方言语音'; } reject(e); });
    });
}

// ── 讯飞 ──────────────────────────────────────────
function speakWithXunfei(text, style, btn){
    return new Promise(function(resolve, reject){
        try{
            var vn = XUNFEI.voices[style]||XUNFEI.voices.normal;
            var host='tts-api.xfyun.cn'; var date=new Date().toUTCString();
            var sig=XF_HMAC.hmacBase64(XUNFEI.apiSecret, 'host: '+host+'\ndate: '+date+'\nGET /v2/tts HTTP/1.1');
            var auth='api_key="'+XUNFEI.apiKey+'", algorithm="hmac-sha256", headers="host date request-line", signature="'+sig+'"';
            var wsUrl='wss://'+host+'/v2/tts?authorization='+encodeURIComponent(auth)+'&date='+encodeURIComponent(date)+'&host='+host;
            if(btn){ btn.disabled=true; btn.classList.add('playing'); btn.querySelector('.btn-label')?btn.querySelector('.btn-label').textContent='播放中...':btn.innerHTML='🔊 播放中...'; }
            var ws=new WebSocket(wsUrl); var chunks=[]; var perr=null; var closed=false;
            ws.onopen=function(){ ws.send(JSON.stringify({common:{app_id:XUNFEI.appId},business:{aue:'lame',sfl:1,vcn:vn,speed:50,pitch:50,volume:50,tte:'UTF8'},data:{status:2,text:btoa(unescape(encodeURIComponent(text)))}})); };
            ws.onmessage=function(ev){ try{ var r=JSON.parse(ev.data); if(r.code!==0){ perr=new Error(r.message); ws.close(); } if(r.data&&r.data.audio)chunks.push(r.data.audio); if(r.data&&r.data.status===2)ws.close(); }catch(ex){ perr=ex; ws.close(); } };
            ws.onclose=function(){
                closed=true; if(btn){ btn.disabled=false; btn.classList.remove('playing'); btn.querySelector('.btn-label')?btn.querySelector('.btn-label').textContent='播放方言':btn.innerHTML='🔊 播放方言语音'; }
                if(perr){ reject(perr); return; }
                if(!chunks.length){ reject(new Error('无音频数据')); return; }
                var fb64=chunks.join(''); var bs=atob(fb64); var bytes=new Uint8Array(bs.length);
                for(var i=0;i<bs.length;i++)bytes[i]=bs.charCodeAt(i);
                var blob=new Blob([bytes],{type:'audio/mpeg'}); var u=URL.createObjectURL(blob); var a=new Audio(u);
                a.onended=function(){ URL.revokeObjectURL(u); resolve(); };
                a.onerror=function(){ URL.revokeObjectURL(u); reject(new Error('播放失败')); };
                a.play().catch(function(e){ URL.revokeObjectURL(u); reject(e); });
            };
            setTimeout(function(){ if(!closed){ closed=true; ws.close(); reject(new Error('超时')); } },15000);
        }catch(e){ if(btn){ btn.disabled=false; btn.classList.remove('playing'); btn.querySelector('.btn-label')?btn.querySelector('.btn-label').textContent='播放方言':btn.innerHTML='🔊 播放方言语音'; } reject(e); }
    });
}

// ── Web Speech ────────────────────────────────────
function speakWithWebSpeech(text, style, btn){
    return new Promise(function(resolve, reject){
        if(!window.speechSynthesis){ reject(new Error('浏览器不支持')); return; }
        window.speechSynthesis.cancel();
        var styles={guanzhong:{rate:1.15,pitch:1.15},shanbei:{rate:0.85,pitch:0.85},shannan:{rate:0.95,pitch:1.05},classical:{rate:0.7,pitch:0.95},normal:{rate:1.0,pitch:1.0}};
        var vs=styles[style]||styles.normal;
        var u=new SpeechSynthesisUtterance(text); u.lang='zh-CN'; u.rate=vs.rate; u.pitch=vs.pitch; u.volume=1;
        var zh=speechSynthesis.getVoices().find(function(v){return v.lang.startsWith('zh');}); if(zh)u.voice=zh;
        if(btn){ btn.disabled=true; btn.classList.add('playing'); btn.querySelector('.btn-label')?btn.querySelector('.btn-label').textContent='播放中...':btn.innerHTML='🔊 播放中...'; }
        u.onend=function(){ if(btn){ btn.disabled=false; btn.classList.remove('playing'); btn.querySelector('.btn-label')?btn.querySelector('.btn-label').textContent='播放方言':btn.innerHTML='🔊 播放方言语音'; } resolve(); };
        u.onerror=function(){ if(btn){ btn.disabled=false; btn.classList.remove('playing'); btn.querySelector('.btn-label')?btn.querySelector('.btn-label').textContent='播放方言':btn.innerHTML='🔊 播放方言语音'; } reject(new Error('失败')); };
        speechSynthesis.speak(u);
    });
}

// ── 引擎路由 ───────────────────────────────────────
function speakText(text, style, btn){
    var eng = getVoiceEngine();
    if(eng==='edgetts') return speakWithEdgeTTS(text, style, btn).catch(function(e){ console.warn(e); return speakWithWebSpeech(text, style, btn); });
    if(eng==='xunfei')  return speakWithXunfei(text, style, btn).catch(function(e){ console.warn(e); return speakWithWebSpeech(text, style, btn); });
    return speakWithWebSpeech(text, style, btn);
}

async function playVoice(resultTextId, btnId, style){
    var textEl=document.getElementById(resultTextId);
    var btn=document.getElementById(btnId);
    if(!btn) return;
    var text=btn.dataset.voiceText||(textEl?textEl.textContent:'');
    var st=btn.dataset.voiceStyle||style;
    if(!text){ alert('没有可播放的文字'); return; }
    btn.disabled=true; if(btn.querySelector('.btn-label')){btn.querySelector('.btn-label').textContent='加载中...';}else{btn.innerHTML='<span class="loading"><span class="spinner"></span>加载语音...</span>';}
    try{ await speakText(text, st, btn); }
    catch(e){ alert('语音播放失败: '+e.message); btn.disabled=false; btn.classList.remove('playing'); btn.querySelector('.btn-label')?btn.querySelector('.btn-label').textContent='播放方言':btn.innerHTML='🔊 播放方言语音'; }
}

// ── 通用模态 ───────────────────────────────────────
function showModal(title, body, btnText, cb){
    var ex=document.querySelector('.modal-overlay'); if(ex) ex.remove();
    var ov=document.createElement('div'); ov.className='modal-overlay';
    ov.innerHTML='<div class="modal-box"><h3>'+title+'</h3><p>'+body+'</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;"><button class="btn btn-red btn-sm" id="modalBtn">'+btnText+'</button><button class="btn btn-gold btn-sm" id="modalCopy">📋 复制</button></div></div>';
    document.body.appendChild(ov);
    var close=function(){ ov.remove(); if(cb) cb(); };
    ov.querySelector('#modalBtn').onclick=close;
    // 复制按钮
    var plainText = body.replace(/<[^>]+>/g, '').replace(/<br\/?>/g, '\n').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
    ov.querySelector('#modalCopy').onclick = function(){
        navigator.clipboard.writeText(title+'\n'+plainText).then(function(){
            var b = ov.querySelector('#modalCopy'); b.textContent = '✅ 已复制';
            setTimeout(function(){ b.textContent = '📋 复制'; }, 1500);
        }).catch(function(){
            var b = ov.querySelector('#modalCopy'); b.textContent = '❌ 失败';
            setTimeout(function(){ b.textContent = '📋 复制'; }, 1500);
        });
    };
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
}

// ── 页面导航（跳转时加过渡） ─────────────────────────
function navigateTo(url){
    document.body.style.opacity='0';
    document.body.style.transition='opacity 0.15s ease-out';
    setTimeout(function(){ window.location.href=url; }, 150);
}

// ── 后端数据库 API ────────────────────────────────
var DB_URL = (typeof CONFIG!=='undefined'&&CONFIG.DB_URL)||'http://localhost:9881';

function dbFetch(path, opts){
    opts = opts || {};
    var url = DB_URL + path;
    var init = { method: opts.method || 'GET', headers: {'Content-Type':'application/json'} };
    if(opts.body) init.body = JSON.stringify(opts.body);
    return fetch(url, init).then(function(r){
        if(!r.ok) return r.json().then(function(e){ throw new Error(e.error||'DB error'); });
        return r.json();
    });
}

// 同步历史记录到后端
function syncHistoryToBackend(type, data){
    dbFetch('/api/history', {method:'POST', body:{type:type, data:data}}).catch(function(){});
}

// 同步评测结果到后端
function syncEvalToBackend(original, dialect, translated, score){
    dbFetch('/api/eval', {method:'POST', body:{original:original, dialect:dialect, translated:translated, score:score}}).catch(function(){});
}

// 同步设置到后端
function syncSettingsToBackend(settings){
    dbFetch('/api/settings', {method:'POST', body:settings}).catch(function(){});
}

// 从后端加载历史
function loadHistoryFromBackend(cb){
    dbFetch('/api/history?limit=50').then(function(data){ cb(data); }).catch(function(){ cb(null); });
}

// 从后端加载评测统计
function loadEvalStatsFromBackend(cb){
    dbFetch('/api/eval/stats').then(function(data){ cb(data); }).catch(function(){ cb(null); });
}

// 从后端查询方言词汇
function queryVocabularyFromBackend(word, region, cb){
    var q = '/api/vocabulary?';
    if(word) q += 'word='+encodeURIComponent(word)+'&';
    if(region) q += 'region='+encodeURIComponent(region);
    dbFetch(q).then(function(data){ cb(data); }).catch(function(){ cb([]); });
}

// ── 用户历史记录（本地 + 后端双写）──────────────────
function saveHistory(type, data){
    var key = 'qy_history';
    var all = JSON.parse(localStorage.getItem(key)||'[]');
    all.unshift({ type:type, data:data, time:Date.now() });
    if(all.length > 200) all = all.slice(0, 200);
    localStorage.setItem(key, JSON.stringify(all));
    // 异步同步到后端（不阻塞）
    syncHistoryToBackend(type, data);
}
function getHistory(){ return JSON.parse(localStorage.getItem('qy_history')||'[]'); }

// ── 音效引擎（Web Audio API 合成，无需外部文件）─────────────────
var SFX = (function(){
    var ctx = null;
    function getCtx(){ if(!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)(); return ctx; }
    return {
        // 转盘咔嗒声
        tick: function(){
            try{ var c=getCtx(),o=c.createOscillator(),g=c.createGain();
                o.type='triangle'; o.frequency.value=800;
                g.gain.setValueAtTime(0.08,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.04);
                o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime+0.04);
            }catch(e){}
        },
        // 转盘停止 · 铜锣声
        gong: function(){
            try{ var c=getCtx(),o=c.createOscillator(),g=c.createGain();
                o.type='sine'; o.frequency.setValueAtTime(520,c.currentTime); o.frequency.exponentialRampToValueAtTime(200,c.currentTime+0.6);
                g.gain.setValueAtTime(0.15,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.7);
                o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime+0.7);
            }catch(e){}
        },
        // 签筒摇晃
        rattle: function(){
            try{ var c=getCtx();
                for(var i=0;i<6;i++){
                    var o=c.createOscillator(),g=c.createGain();
                    o.type='square'; o.frequency.value=300+Math.random()*600;
                    var t=c.currentTime+i*0.04;
                    g.gain.setValueAtTime(0.04,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.03);
                    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+0.03);
                }
            }catch(e){}
        },
        // 官印盖下
        stamp: function(){
            try{ var c=getCtx(),o=c.createOscillator(),g=c.createGain();
                o.type='sine'; o.frequency.setValueAtTime(120,c.currentTime); o.frequency.exponentialRampToValueAtTime(40,c.currentTime+0.25);
                g.gain.setValueAtTime(0.2,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.3);
                o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime+0.3);
                // 叠加混响感
                var o2=c.createOscillator(),g2=c.createGain();
                o2.type='triangle'; o2.frequency.value=60;
                g2.gain.setValueAtTime(0.1,c.currentTime); g2.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.2);
                o2.connect(g2); g2.connect(c.destination); o2.start(c.currentTime); o2.stop(c.currentTime+0.2);
            }catch(e){}
        }
    };
})();

// ── 页面预加载（导航瞬间切换）─────────────────────
(function(){
    var pages = ['translate.html','classical.html','dict.html','quiz.html','fortune.html','roulette.html','settings.html','eval.html','history.html','protect.html'];
    var cache = {};
    window.preloadPages = function(){
        pages.forEach(function(p){
            var xhr = new XMLHttpRequest();
            xhr.open('GET', p, true);
            xhr.onload = function(){
                if(xhr.status === 200) cache[p] = xhr.responseText;
            };
            xhr.send();
        });
    };
    window.getCachedPage = function(p){ return cache[p] || null; };
    // 首页加载完成后自动预加载
    if(document.readyState === 'complete') preloadPages();
    else window.addEventListener('load', preloadPages);
})();

console.log('🏮 秦言三韵 · common.js 已加载');
