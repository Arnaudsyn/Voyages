(function(){
  var routes = [
    {id:'tokyo-sendai',name:'Tokyo ↔ Sendai',fare:11630,passes:['national','east']},
    {id:'tokyo-niigata',name:'Tokyo ↔ Niigata',fare:10980,passes:['national','east']},
    {id:'tokyo-nagano',name:'Tokyo ↔ Nagano',fare:8450,passes:['national','east','hokurikuArch']},
    {id:'tokyo-kanazawa',name:'Tokyo ↔ Kanazawa',fare:14600,passes:['national','hokurikuArch']},
    {id:'kanazawa-kyoto',name:'Kanazawa ↔ Kyoto',fare:8120,passes:['national','hokurikuArch','kansaiHokuriku','westAll']},
    {id:'tokyo-kyoto',name:'Tokyo ↔ Kyoto',fare:14170,passes:['national']},
    {id:'tokyo-osaka',name:'Tokyo ↔ Shin-Osaka',fare:14720,passes:['national']},
    {id:'kyoto-osaka',name:'Kyoto ↔ Osaka',fare:580,passes:['national','kansaiArea','kansaiWide','kansaiHiroshima','kansaiHokuriku','sanyoSanin','westAll','hokurikuArch']},
    {id:'osaka-kinosaki',name:'Osaka ↔ Kinosaki Onsen',fare:6140,passes:['national','kansaiWide','westAll']},
    {id:'osaka-hiroshima',name:'Shin-Osaka ↔ Hiroshima',fare:10750,passes:['national','kansaiHiroshima','sanyoSanin','westAll']},
    {id:'hiroshima-hakata',name:'Hiroshima ↔ Hakata',fare:9100,passes:['national','sanyoSanin','westAll']},
    {id:'hakata-kumamoto',name:'Hakata ↔ Kumamoto',fare:5840,passes:['national','kyushuAll','kyushuNorth']},
    {id:'hakata-beppu',name:'Hakata ↔ Beppu',fare:6910,passes:['national','kyushuAll','kyushuNorth']},
    {id:'hakata-kagoshima',name:'Hakata ↔ Kagoshima-Chuo',fare:11750,passes:['national','kyushuAll']},
    {id:'kumamoto-kagoshima',name:'Kumamoto ↔ Kagoshima-Chuo',fare:7770,passes:['national','kyushuAll','kyushuSouth']},
    {id:'chitose-sapporo',name:'New Chitose Airport ↔ Sapporo',fare:2230,passes:['national','hokkaido','sapporoFurano','sapporoNoboribetsu']},
    {id:'sapporo-asahikawa',name:'Sapporo ↔ Asahikawa',fare:5220,passes:['national','hokkaido','sapporoFurano']},
    {id:'sapporo-furano',name:'Sapporo ↔ Furano',fare:6760,passes:['national','hokkaido','sapporoFurano']},
    {id:'sapporo-hakodate',name:'Sapporo ↔ Hakodate',fare:9440,passes:['national','hokkaido']}
  ];

  var passes = [
    {id:'national',name:'Japan Rail Pass · 7 jours',days:7,price:50000,group:'Japan Rail Pass'},
    {id:'national',name:'Japan Rail Pass · 14 jours',days:14,price:80000,group:'Japan Rail Pass'},
    {id:'national',name:'Japan Rail Pass · 21 jours',days:21,price:100000,group:'Japan Rail Pass'},
    {id:'east',name:'JR EAST PASS · 5 jours',days:5,price:35000,group:'JR East'},
    {id:'east',name:'JR EAST PASS · 10 jours',days:10,price:50000,group:'JR East'},
    {id:'hokurikuArch',name:'Hokuriku Arch Pass · 7 jours',days:7,price:35000,group:'JR East / JR West'},
    {id:'kansaiArea',name:'Kansai Area Pass · 1 jour',days:1,price:2800,group:'JR West'},
    {id:'kansaiArea',name:'Kansai Area Pass · 2 jours',days:2,price:4800,group:'JR West'},
    {id:'kansaiArea',name:'Kansai Area Pass · 3 jours',days:3,price:5800,group:'JR West'},
    {id:'kansaiArea',name:'Kansai Area Pass · 4 jours',days:4,price:7000,group:'JR West'},
    {id:'kansaiWide',name:'Kansai WIDE Area Pass · 5 jours',days:5,price:12000,group:'JR West'},
    {id:'kansaiHiroshima',name:'Kansai-Hiroshima Area Pass · 5 jours',days:5,price:17000,group:'JR West'},
    {id:'kansaiHokuriku',name:'Kansai-Hokuriku Area Pass · 7 jours',days:7,price:19000,group:'JR West'},
    {id:'sanyoSanin',name:'Sanyo-San’in Area Pass · 7 jours',days:7,price:23000,group:'JR West'},
    {id:'westAll',name:'JR-WEST All Area Pass · 7 jours',days:7,price:26000,group:'JR West'},
    {id:'kyushuNorth',name:'Northern Kyushu Pass · 3 jours',days:3,price:15000,group:'JR Kyushu'},
    {id:'kyushuNorth',name:'Northern Kyushu Pass · 5 jours',days:5,price:17000,group:'JR Kyushu'},
    {id:'kyushuSouth',name:'Southern Kyushu Pass · 3 jours',days:3,price:12000,group:'JR Kyushu'},
    {id:'kyushuAll',name:'All Kyushu Pass · 3 jours',days:3,price:22000,group:'JR Kyushu'},
    {id:'kyushuAll',name:'All Kyushu Pass · 5 jours',days:5,price:24000,group:'JR Kyushu'},
    {id:'kyushuAll',name:'All Kyushu Pass · 7 jours',days:7,price:26000,group:'JR Kyushu'},
    {id:'hokkaido',name:'Hokkaido Rail Pass · 5 jours',days:5,price:22000,group:'JR Hokkaido'},
    {id:'hokkaido',name:'Hokkaido Rail Pass · 7 jours',days:7,price:28000,group:'JR Hokkaido'},
    {id:'hokkaido',name:'Hokkaido Rail Pass · 10 jours',days:10,price:37000,group:'JR Hokkaido'},
    {id:'sapporoFurano',name:'Sapporo-Furano Area Pass · 4 jours',days:4,price:11000,group:'JR Hokkaido'},
    {id:'sapporoNoboribetsu',name:'Sapporo-Noboribetsu Area Pass · 4 jours',days:4,price:10000,group:'JR Hokkaido'}
  ];

  function yen(n){ return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' ¥'; }

  function init(){
    var root=document.getElementById('jrCalculator');
    if(!root) return;
    var list=root.querySelector('[data-routes]');
    routes.forEach(function(route){
      var row=document.createElement('div');
      row.className='route-row';
      row.innerHTML='<div class="route-name"><strong>'+route.name+'</strong><small>tarif indicatif, adulte / sens simple</small></div>'+
        '<div class="route-count"><label for="r-'+route.id+'">Trajets</label><select id="r-'+route.id+'" data-route="'+route.id+'"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></div>'+
        '<div class="route-fare">'+yen(route.fare)+'</div>';
      list.appendChild(row);
    });
    root.querySelectorAll('select').forEach(function(el){el.addEventListener('change',calculate);});
    calculate();
  }

  function calculate(){
    var root=document.getElementById('jrCalculator');
    var activeDays=parseInt(root.querySelector('[data-days]').value,10);
    var selected=[];
    var point=0;
    routes.forEach(function(route){
      var el=root.querySelector('[data-route="'+route.id+'"]');
      var count=parseInt(el.value,10)||0;
      if(count){
        selected.push({route:route,count:count});
        point += route.fare*count;
      }
    });

    var results=root.querySelector('[data-results]');
    if(!selected.length){
      results.innerHTML='<div class="calc-verdict"><strong>Ajoutez vos trajets principaux 👆</strong><p>Le calculateur comparera ensuite les billets à l’unité avec les passes qui couvrent réellement ces segments.</p></div>';
      return;
    }

    var candidates=[];
    passes.forEach(function(pass){
      if(pass.days < activeDays) return;
      var coveredValue=0;
      var uncovered=0;
      selected.forEach(function(item){
        var cost=item.route.fare*item.count;
        if(item.route.passes.indexOf(pass.id)!==-1) coveredValue += cost;
        else uncovered += cost;
      });
      if(!coveredValue) return;
      candidates.push({
        name:pass.name,
        total:pass.price+uncovered,
        passPrice:pass.price,
        uncovered:uncovered,
        coveredValue:coveredValue,
        group:pass.group
      });
    });

    candidates.sort(function(a,b){return a.total-b.total;});
    var best=candidates[0];
    var cheapest=Math.min(point,best ? best.total : Infinity);
    var saving=point-cheapest;
    var recommendation;

    if(best && best.total < point*0.97){
      recommendation='<strong>Oui : '+best.name+' semble le plus intéressant.</strong><p>Estimation : '+yen(best.total)+' au total, soit environ '+yen(saving)+' de moins que les billets à l’unité. Les trajets non couverts sont ajoutés au calcul.</p>';
    } else if(best && Math.abs(best.total-point) <= point*0.03){
      recommendation='<strong>C’est très serré.</strong><p>Le meilleur pass arrive presque au même prix que les billets à l’unité. Dans ce cas, on choisirait surtout selon la flexibilité et les réservations incluses.</p>';
    } else {
      recommendation='<strong>Probablement pas de pass.</strong><p>Sur cet itinéraire, les billets à l’unité restent moins chers que les passes testés. Gardez quand même un œil sur les tarifs anticipés SmartEX / JR et les passes locaux non modélisés.</p>';
    }

    var alts=candidates.slice(0,4).map(function(c){
      return '<div class="calc-alt-row"><span>'+c.name+'</span><strong>'+yen(c.total)+'</strong></div>';
    }).join('');

    results.innerHTML=
      '<div class="calc-summary">'+
        '<div class="calc-metric"><span>Billets à l’unité</span><strong>'+yen(point)+'</strong></div>'+
        '<div class="calc-metric"><span>Meilleure option calculée</span><strong>'+(best?yen(best.total):'—')+'</strong></div>'+
        '<div class="calc-metric"><span>Écart potentiel</span><strong>'+yen(Math.max(0,saving))+'</strong></div>'+
      '</div>'+
      '<div class="calc-verdict">'+recommendation+'</div>'+
      (alts?'<div class="calc-alt"><strong>Comparaison des passes pertinents</strong>'+alts+'</div>':'')+
      '<p class="calc-note">Estimations adulte, classe ordinaire, tarifs réguliers observés en septembre 2026. Les prix varient selon saison, train, réservation et canal d’achat. Le Japan Rail Pass national n’inclut pas Nozomi/Mizuho sans billet supplémentaire. Vérifiez toujours le tarif final sur le site JR concerné avant achat.</p>';
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();