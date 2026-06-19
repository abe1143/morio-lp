/* ============================================================
   MORIO ｜ LTV Simulator — logic + i18n (ja / en / zh)
   Self-contained IIFE. Reads window.__pageLang. Depends on Chart.js
   (loaded once via CDN before this file). Namespaced to avoid any
   collision with the site's own scripts.
   ============================================================ */
(function(){
  'use strict';

  var LANG = (window.__pageLang === 'en' || window.__pageLang === 'zh') ? window.__pageLang : 'ja';

  /* fixed model premises (the very thing that separates timeless vs conventional) */
  var FIX = { rentM:4.0, rentT:2.0 };

  /* ---------------- i18n ---------------- */
  var I18N = {
    ja:{
      cta_k:'LTV Simulator',
      cta_t:'永く収益を生み続ける、タイムレスな不動産をプロデュースする意味。',
      cta_run:'試算する',
      m_eyebrow:'賃料積算シミュレーター ｜ 本質比較',
      m_title:'建て替えるか、建て替えないか。<br>それだけで、家賃の積算は分かれる。',
      doctrine:'タイムレスな不動産 ―― 高付加価値（賃料プレミアム）× サスティナブル（経年不変）。100年、性能は新築のまま。',
      m_sub:'土地・売却・借入は置きません。家賃の積算から建築費を引いた「正味の積み上げ」だけで比べます。通常は約50年で建て替え、タイムレスな不動産は建て替えません。',
      bl_cond:'条件', bl_cond_n:'3項目だけ',
      f_area:'賃貸面積', u_tsubo:'坪',
      f_unit:'建築坪単価', u_unit:'万/坪・通常',
      f_H:'検証期間', u_year:'年',
      bc_label:'一棟あたり建築費',
      bc_conv:'通常', bc_tl:'タイムレス', u_oku:'億',
      bl_fixed:'固定前提', bl_fixed_n:'タイムレス vs 通常の差そのもの',
      fx1_l:'新築賃料', fx1_v:'通常 2.0 ／ <b>タイムレス 4.0</b><small>万/坪/月</small>',
      fx2_l:'建築坪単価', fx2_v:'通常 ×1 ／ <b>タイムレス ×1.5</b>',
      fx3_l:'賃料下落率', fx3_v:'<b>タイムレス ＝ 通常の 1/2</b>',
      fx4_l:'建て替え', fx4_v:'通常 約50年 ／ <b>タイムレス なし</b>',
      fx_note:'※ タイムレスの新築賃料（4.0万/坤・月）は、MORIOプロデュース物件のトラックレコードに基づく設定値です。通常の2倍という前提は、立地・仕様により変動します。',
      v_conv:'通常 ｜ 正味の積み上げ', v_tl:'タイムレス ｜ 正味の積み上げ', v_mult:'正味 倍率', u_mult:'倍',
      bl_yield:'利回り ｜ 建築費をどれだけ回収したか', bl_yield_n:'土地除く・100年',
      th_conv:'通常デベロッパー', th_tl:'タイムレス',
      y1:'初年度利回り（対建築費）', y2:'建て替え回数', y3:'累計建築投資', y4:'賃料回収倍率（積算÷建築投資）',
      u_times:'回',
      leg_tl:'タイムレス（正味）', leg_conv:'通常建築（正味）', leg_rb:'通常の建て替え（−建築費でガクッと下落）',
      d_summary:'詳細設定',
      d_floor:'通常の賃料の床（新築比）', d_tau:'賃料減衰τ（年）', d_cycle:'建て替え周期（通常・年）', d_dt:'建て替えダウンタイム（年）',
      foot:'固定前提：新築賃料 通常2.0／タイムレス4.0万・坪・月、建築坪単価はタイムレスが通常の1.5倍、賃料下落率はタイムレスが通常の1/2（＝高い床）、通常は約50年周期で建て替え（建築費を再投下＋工事期間は家賃ゼロ）、タイムレスは建て替えなし。土地・売却・借入は対象外。賃料は粗賃料、利回りは建築費に対する表面利回り（土地を含まないため高めに出ます）。賃料下落は三井住友トラスト基礎研究所の築年帯別下落率に較正した非線形カーブ。回収倍率＝賃料の積算÷累計建築投資。タイムレスは一棟の建築費が1.5倍でも、建て替えないため100年の累計建築投資は通常（複数回建設）より小さくなります。',
      ax_x:'経過年数', ax_y:'正味の積み上げ（億円）',
      verLine:function(d){return '正味の積み上げ＝<b>累計家賃 − 累計建築投資</b>。通常は'+d.H+'年で<b>'+d.Tb+'回</b>建て替え、そのたび建築費でガクッと沈む。タイムレスは一棟に1.5倍かけても建て替えず、登り続ける。正味は通常 <b>＋'+d.Tnet+'億</b> に対しタイムレス <b>＋'+d.Mnet+'億</b>（<b>'+d.mult+'倍</b>、差 ＋'+d.gap+'億）。';},
      cap:function(d){return '100年の正味の積み上げ（家賃−建築投資）： <b>差 ＋'+d.gap+'億</b>　<span class="sub">通常 ＋'+d.Tnet+'億 → タイムレス ＋'+d.Mnet+'億</span>';},
      tipTitle:function(y){return y+' 年目';},
      tipTL:' タイムレス：', tipConv:' 通常：', tipUnit:' 億',
      tipDiff:function(g){return '差分：＋'+g+' 億';},
      annoRebuild:function(c){return '建て替え −'+c+'億';},
      annoGap:function(g){return '差 ＋'+g+'億';}
    },
    en:{
      cta_k:'LTV Simulator',
      cta_t:'On your own site — how far does a century of LTV diverge?',
      cta_run:'Run the numbers',
      m_eyebrow:'Rent-Accrual Simulator ｜ Like-for-like',
      m_title:'Rebuild, or never rebuild.<br>That alone splits the rent that accrues.',
      doctrine:'Timeless real estate — high added value (a rent premium) × sustainable (performance unchanged by age). A century on, still as new.',
      m_sub:'No land, no resale, no debt. We compare only the net build-up — accrued rent minus construction cost. The conventional asset rebuilds roughly every 50 years; the timeless one never does.',
      bl_cond:'Inputs', bl_cond_n:'Just three',
      f_area:'Leasable area', u_tsubo:'tsubo',
      f_unit:'Build cost / tsubo', u_unit:'¥10k/tsubo · conv.',
      f_H:'Horizon', u_year:'yrs',
      bc_label:'Build cost per building',
      bc_conv:'Conv.', bc_tl:'Timeless', u_oku:'¥100M',
      bl_fixed:'Fixed Premises', bl_fixed_n:'What sets timeless apart',
      fx1_l:'New-build rent', fx1_v:'Conv. 2.0 / <b>Timeless 4.0</b><small>¥10k/tsubo/mo</small>',
      fx2_l:'Build cost / tsubo', fx2_v:'Conv. ×1 / <b>Timeless ×1.5</b>',
      fx3_l:'Rent decline', fx3_v:'<b>Timeless = ½ of conventional</b>',
      fx4_l:'Rebuild', fx4_v:'Conv. ~50 yrs / <b>Timeless none</b>',
      fx_note:'* The timeless new-build rent (¥40k/tsubo·month) is a setting calibrated to the track record of MORIO-produced properties. The 2× premium over conventional varies with location and specification.',
      v_conv:'Conventional · Net build-up', v_tl:'Timeless · Net build-up', v_mult:'Net multiple', u_mult:'×',
      bl_yield:'Yield ｜ How much of the build cost is recovered', bl_yield_n:'Land excluded · 100 yrs',
      th_conv:'Conventional developer', th_tl:'Timeless',
      y1:'First-year yield (on build cost)', y2:'Rebuilds', y3:'Cumulative build investment', y4:'Rent recovery multiple (accrued ÷ invested)',
      u_times:'×',
      leg_tl:'Timeless (net)', leg_conv:'Conventional (net)', leg_rb:'Conventional rebuild (−build cost, a sharp drop)',
      d_summary:'Advanced settings',
      d_floor:'Conventional rent floor (vs new-build)', d_tau:'Rent decay τ (yrs)', d_cycle:'Rebuild cycle (conv., yrs)', d_dt:'Rebuild downtime (yrs)',
      foot:'Fixed premises: new-build rent ¥20k / ¥40k per tsubo·month (conventional / timeless); build cost per tsubo is 1.5× for timeless; rent declines at half the conventional rate (a higher floor); the conventional asset rebuilds about every 50 years (build cost reinvested, zero rent during works); the timeless asset never rebuilds. Land, resale and debt are out of scope. Rents are gross; yields are nominal on build cost (land excluded, so they read high). Rent decline follows a non-linear curve calibrated to age-band decline rates from the Sumitomo Mitsui Trust Research Institute. Recovery multiple = accrued rent ÷ cumulative build investment. Although a single timeless building costs 1.5× more, because it is never rebuilt its 100-year cumulative build investment is smaller than the conventional case (multiple builds). Figures are in ¥100M.',
      ax_x:'Years elapsed', ax_y:'Net build-up (¥100M)',
      verLine:function(d){return 'Net build-up = <b>accrued rent − cumulative build investment</b>. Over '+d.H+' years the conventional asset rebuilds <b>'+d.Tb+'×</b>, sinking on build cost each time. The timeless asset spends 1.5× on one building and never rebuilds — it keeps climbing. Net: <b>+'+d.Tnet+'</b> conventional vs <b>+'+d.Mnet+'</b> timeless (¥100M; <b>'+d.mult+'×</b>, a gap of +'+d.gap+').';},
      cap:function(d){return 'A century of net build-up (rent − build investment): <b>gap +'+d.gap+'</b>　<span class="sub">conv. +'+d.Tnet+' → timeless +'+d.Mnet+' (¥100M)</span>';},
      tipTitle:function(y){return 'Year '+y;},
      tipTL:' Timeless: ', tipConv:' Conventional: ', tipUnit:'',
      tipDiff:function(g){return 'Gap: +'+g+' (¥100M)';},
      annoRebuild:function(c){return 'Rebuild −'+c;},
      annoGap:function(g){return 'Gap +'+g;}
    },
    zh:{
      cta_k:'LTV Simulator',
      cta_t:'在您的土地上，百年 LTV 究竟拉开多大差距。',
      cta_run:'试算',
      m_eyebrow:'租金积算模拟器 ｜ 本质对比',
      m_title:'拆与不拆，<br>仅此一念，租金积算便已分野。',
      doctrine:'永恒不动产 —— 高附加值（租金溢价）× 可持续（历久不衰）。百年之后，性能仍如新筑。',
      m_sub:'不计土地、转售与借贷。仅以「净积累」——租金积算减去建筑费——来比较。常规不动产约每 50 年重建一次，永恒不动产则永不重建。',
      bl_cond:'条件', bl_cond_n:'仅三项',
      f_area:'可租面积', u_tsubo:'坪',
      f_unit:'建筑坪单价', u_unit:'万/坪·常规',
      f_H:'检验期', u_year:'年',
      bc_label:'每栋建筑费',
      bc_conv:'常规', bc_tl:'永恒', u_oku:'亿日元',
      bl_fixed:'固定前提', bl_fixed_n:'永恒与常规之差所在',
      fx1_l:'新筑租金', fx1_v:'常规 2.0 ／ <b>永恒 4.0</b><small>万/坪·月</small>',
      fx2_l:'建筑坪单价', fx2_v:'常规 ×1 ／ <b>永恒 ×1.5</b>',
      fx3_l:'租金下滑率', fx3_v:'<b>永恒 ＝ 常规之半</b>',
      fx4_l:'重建', fx4_v:'常规 约50年 ／ <b>永恒 无</b>',
      fx_note:'※ 永恒不动产的新筑租金（4.0万日元/坤·月）为依 MORIO 操盘项目实绩校准的设定值。较常规 2 倍的前提会随地段与规格而变动。',
      v_conv:'常规 ｜ 净积累', v_tl:'永恒 ｜ 净积累', v_mult:'净额倍数', u_mult:'倍',
      bl_yield:'回报 ｜ 建筑费回收几何', bl_yield_n:'不含土地 · 100 年',
      th_conv:'常规开发商', th_tl:'永恒',
      y1:'首年回报率（对建筑费）', y2:'重建次数', y3:'累计建筑投资', y4:'租金回收倍数（积算÷投资）',
      u_times:'次',
      leg_tl:'永恒（净额）', leg_conv:'常规（净额）', leg_rb:'常规重建（−建筑费，骤降）',
      d_summary:'高级设置',
      d_floor:'常规租金下限（对新筑）', d_tau:'租金衰减 τ（年）', d_cycle:'重建周期（常规·年）', d_dt:'重建停工期（年）',
      foot:'固定前提：新筑租金 常规2.0／永恒4.0万日元·坪·月；建筑坪单价永恒为常规的1.5倍；租金下滑率永恒为常规的1/2（即更高的下限）；常规约每50年重建一次（建筑费再投入，施工期租金为零）；永恒不重建。不含土地、转售与借贷。租金为毛租金，回报为对建筑费的表面回报（不含土地，故偏高）。租金下滑采用依三井住友信托基础研究所各楼龄段下滑率校准的非线性曲线。回收倍数＝租金积算÷累计建筑投资。永恒不动产单栋建筑费虽为1.5倍，但因不重建，其百年累计建筑投资反而小于常规（多次建设）。数值单位为亿日元。',
      ax_x:'经过年数', ax_y:'净积累（亿日元）',
      verLine:function(d){return '净积累＝<b>累计租金 − 累计建筑投资</b>。'+d.H+' 年间，常规重建 <b>'+d.Tb+' 次</b>，每次都因建筑费而骤降。永恒不动产单栋多投 1.5 倍却不重建，持续攀升。净额：常规 <b>＋'+d.Tnet+'</b> 对永恒 <b>＋'+d.Mnet+'</b>（亿日元；<b>'+d.mult+' 倍</b>，差 ＋'+d.gap+'）。';},
      cap:function(d){return '百年净积累（租金−建筑投资）： <b>差 ＋'+d.gap+'</b>　<span class="sub">常规 ＋'+d.Tnet+' → 永恒 ＋'+d.Mnet+'（亿日元）</span>';},
      tipTitle:function(y){return '第 '+y+' 年';},
      tipTL:' 永恒：', tipConv:' 常规：', tipUnit:' 亿',
      tipDiff:function(g){return '差额：＋'+g+' 亿';},
      annoRebuild:function(c){return '重建 −'+c;},
      annoGap:function(g){return '差 ＋'+g;}
    }
  };
  var T = I18N[LANG];

  /* ---------------- helpers ---------------- */
  var $ = function(id){ return document.getElementById(id); };
  var oku = function(x){ return x/10000; };
  var f1 = function(x){ return x.toFixed(1); };
  function P(id){ var el=$(id); return el ? (parseFloat(el.value)||0) : 0; }

  /* ---------------- model ---------------- */
  function calc(){
    var A=P('ls_area'), unit=P('ls_unit'), H=Math.round(P('ls_H'));
    var tau=P('ls_tau'), DT=Math.round(P('ls_dt')), cycle=Math.round(P('ls_cycle'));
    var floorT=P('ls_floorT'), floorM=1-0.5*(1-floorT);
    function side(rent,floor,rebuild,mult){
      var uc=unit*mult, build=uc*A, builds=1, age=0, down=0, acc=0, net=-build;
      var cum=[0], netArr=[-build], rb=[];
      for(var y=1;y<=H;y++){
        var r=0, capex=0;
        if(down>0){ down--; if(down===0) age=0; }
        else if(rebuild && age>=cycle){ builds++; down=DT; capex=build; rb.push(y); }
        else { r=rent*12*A*(floor+(1-floor)*Math.exp(-age/tau)); age++; }
        acc+=r; net+=r-capex; cum.push(acc); netArr.push(net);
      }
      return {cum:cum,netArr:netArr,total:acc,netEnd:net,builds:builds,invest:build*builds,
              initYield:rent*12/uc,recovery:acc/(build*builds),build:build,rb:rb};
    }
    return {A:A,unit:unit,H:H,floorM:floorM,floorT:floorT,
            M:side(FIX.rentM,floorM,false,1.5),T:side(FIX.rentT,floorT,true,1)};
  }

  /* ---------------- chart ---------------- */
  var chart=null;
  var C={ gold:'#c2a25f', gold2:'#d9be84', muted:'#898376', warn:'#c2724f',
          ink:'#ece7dd', grid:'rgba(236,231,221,.07)', grid2:'rgba(236,231,221,.1)',
          zero:'rgba(236,231,221,.28)', bg:'#0b0b0c', tickTxt:'#898376', axTxt:'#898376' };

  function ensureChart(labels,dt,dm){
    var cv=$('ls_chart'); if(!cv) return;
    if(cv.clientWidth===0) return;            /* hidden — skip build */
    if(chart){
      chart.data.labels=labels; chart.data.datasets[0].data=dt; chart.data.datasets[1].data=dm;
      return;
    }
    chart=new Chart(cv.getContext('2d'),{type:'line',
      data:{labels:labels,datasets:[
        {data:dt,borderColor:C.muted,backgroundColor:'rgba(137,131,118,.14)',borderWidth:1.6,pointRadius:0,tension:.05,fill:'origin',order:2},
        {data:dm,borderColor:C.gold,backgroundColor:'rgba(194,162,95,.22)',borderWidth:2.4,pointRadius:0,tension:.05,fill:'-1',order:1}
      ]},
      options:{maintainAspectRatio:false,responsive:true,interaction:{mode:'index',intersect:false},layout:{padding:{right:6}},
        plugins:{legend:{display:false},tooltip:{backgroundColor:C.bg,titleColor:C.gold2,bodyColor:C.ink,borderColor:'rgba(236,231,221,.12)',borderWidth:1,padding:11,
          titleFont:{family:"'Jost',sans-serif"},bodyFont:{family:"'Jost',sans-serif"},
          callbacks:{title:function(i){return T.tipTitle(i[0].label);},
            label:function(c){return (c.datasetIndex===1?T.tipTL:T.tipConv)+f1(c.parsed.y)+T.tipUnit;},
            afterBody:function(items){var ch=items[0].chart,idx=items[0].dataIndex;
              var g=ch.data.datasets[1].data[idx]-ch.data.datasets[0].data[idx];return T.tipDiff(f1(g));}}}},
        scales:{x:{title:{display:true,text:T.ax_x,color:C.axTxt,font:{size:10,family:"'Jost',sans-serif"}},grid:{color:C.grid},ticks:{color:C.tickTxt,font:{size:10,family:"'Jost',sans-serif"},maxTicksLimit:11}},
          y:{title:{display:true,text:T.ax_y,color:C.axTxt,font:{size:10,family:"'Jost',sans-serif"}},grid:{color:C.grid2},ticks:{color:C.tickTxt,font:{size:10,family:"'Jost',sans-serif"}}}}},
      plugins:[{id:'lsanno',afterDraw:function(c){
        var xa=c.scales.x, ya=c.scales.y, ctx=c.ctx;
        var y0=ya.getPixelForValue(ya.max), y1=ya.getPixelForValue(ya.min);
        ctx.save();
        var yz=ya.getPixelForValue(0);
        ctx.strokeStyle=C.zero; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(xa.left,yz); ctx.lineTo(xa.right,yz); ctx.stroke();
        ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(194,114,79,.55)'; ctx.lineWidth=1;
        (c.$rb||[]).forEach(function(yr){var px=xa.getPixelForValue(yr); ctx.beginPath(); ctx.moveTo(px,y0); ctx.lineTo(px,y1); ctx.stroke();});
        ctx.setLineDash([]);
        if(c.$rb && c.$rb.length){var px=xa.getPixelForValue(c.$rb[0]);
          ctx.fillStyle=C.warn; ctx.font="400 11px 'Jost',sans-serif"; ctx.textAlign='center'; ctx.textBaseline='top';
          ctx.fillText(T.annoRebuild(c.$capex),px,y0+6);}
        if(c.$mEnd!=null){var xR=xa.getPixelForValue(c.$H), yM=ya.getPixelForValue(c.$mEnd), yT=ya.getPixelForValue(c.$tEnd);
          ctx.strokeStyle=C.gold; ctx.lineWidth=1.3; ctx.beginPath();
          ctx.moveTo(xR,yM); ctx.lineTo(xR,yT); ctx.moveTo(xR-5,yM); ctx.lineTo(xR,yM); ctx.moveTo(xR-5,yT); ctx.lineTo(xR,yT); ctx.stroke();
          ctx.fillStyle=C.gold2; ctx.font="400 13px 'Noto Serif JP',serif"; ctx.textAlign='right'; ctx.textBaseline='middle';
          ctx.fillText(T.annoGap(c.$gap),xR-9,(yM+yT)/2);}
        ctx.restore();
      }}]
    });
  }

  /* ---------------- render ---------------- */
  function setTxt(id,v){ var el=$(id); if(el) el.textContent=v; }
  function render(){
    setTxt('ls_v_area',Math.round(P('ls_area')));
    setTxt('ls_v_unit',Math.round(P('ls_unit')));
    setTxt('ls_v_H',Math.round(P('ls_H')));
    var d=calc(), M=d.M, Tn=d.T;
    setTxt('ls_ver_t',f1(oku(Tn.netEnd))); setTxt('ls_ver_m',f1(oku(M.netEnd)));
    var mult=Tn.netEnd>0?M.netEnd/Tn.netEnd:NaN;
    setTxt('ls_ver_mult',isFinite(mult)?f1(mult):'—');
    var tpl={H:d.H,Tb:Tn.builds,Tnet:f1(oku(Tn.netEnd)),Mnet:f1(oku(M.netEnd)),
             mult:isFinite(mult)?f1(mult):'—',gap:f1(oku(M.netEnd-Tn.netEnd))};
    var vl=$('ls_ver_line'); if(vl) vl.innerHTML=T.verLine(tpl);
    setTxt('ls_y_initt',(Tn.initYield*100).toFixed(1)+'%'); setTxt('ls_y_initm',(M.initYield*100).toFixed(1)+'%');
    setTxt('ls_y_buildt',Tn.builds+' '+T.u_times); setTxt('ls_y_buildm',M.builds+' '+T.u_times);
    setTxt('ls_y_invt',f1(oku(Tn.invest))+' '+T.u_oku); setTxt('ls_y_invm',f1(oku(M.invest))+' '+T.u_oku);
    setTxt('ls_y_rect',Tn.recovery.toFixed(1)+'x'); setTxt('ls_y_recm',M.recovery.toFixed(1)+'x');
    setTxt('ls_bc_t',f1(oku(Tn.build))); setTxt('ls_bc_m',f1(oku(M.build)));
    var H=d.H, labels=[], i;
    for(i=0;i<=H;i++) labels.push(i);
    var dm=M.netArr.map(oku), dt=Tn.netArr.map(oku);
    ensureChart(labels,dt,dm);
    if(chart){
      chart.$rb=Tn.rb; chart.$H=H; chart.$tEnd=oku(Tn.netEnd); chart.$mEnd=oku(M.netEnd);
      chart.$gap=f1(oku(M.netEnd-Tn.netEnd)); chart.$capex=f1(oku(Tn.build));
      chart.update('none');
    }
    var cap=$('ls_chartcap'); if(cap) cap.innerHTML=T.cap(tpl);
  }

  /* ---------------- i18n apply ---------------- */
  function applyI18n(){
    document.querySelectorAll('[data-ls]').forEach(function(el){
      var k=el.getAttribute('data-ls'); if(T[k]!=null) el.textContent=T[k];
    });
    document.querySelectorAll('[data-ls-html]').forEach(function(el){
      var k=el.getAttribute('data-ls-html'); if(T[k]!=null) el.innerHTML=T[k];
    });
  }

  /* ---------------- open / close ---------------- */
  function openSim(){
    var ov=$('ls_overlay'); if(!ov) return;
    ov.classList.add('open'); document.body.style.overflow='hidden';
    requestAnimationFrame(function(){ render(); if(chart) chart.resize(); });
    setTimeout(function(){ render(); if(chart) chart.resize(); },120);
  }
  function closeSim(){
    var ov=$('ls_overlay'); if(!ov) return;
    ov.classList.remove('open'); document.body.style.overflow='';
  }

  function init(){
    if(!$('ls_overlay')) return;
    applyI18n();
    var cta=$('ls_cta');
    if(cta){
      cta.addEventListener('click',openSim);
      cta.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openSim(); } });
    }
    var cl=$('ls_close'); if(cl) cl.addEventListener('click',closeSim);
    var ov=$('ls_overlay');
    ov.addEventListener('click',function(e){ if(e.target===ov) closeSim(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeSim(); });
    ov.querySelectorAll('input').forEach(function(el){ el.addEventListener('input',render); });
    render(); /* populate numbers (chart deferred until visible) */
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
