(function(){
  var scenarios = {
    tokyo: {
      title:'Tokyo et ses environs',
      verdict:'Pas de JR Pass national.',
      text:'Pour Tokyo, Yokohama et quelques excursions proches, une IC Card + des billets au cas par cas sont beaucoup plus simples. Pour Nikko, Hakone ou Kawaguchiko, regardez plutôt les passes locaux dédiés.',
      family:'À regarder : pass Nikko / Hakone / Fuji selon vos excursions.',
      badge:'Billets locaux'
    },
    golden: {
      title:'Tokyo → Kyoto → Osaka → Tokyo',
      verdict:'Le JR Pass national est généralement trop cher.',
      text:'Même avec un aller-retour sur le Tokaido Shinkansen, le pass national 7 jours à 50 000 ¥ reste en général au-dessus du prix des billets individuels. Réserver les grands trajets séparément est souvent le meilleur réflexe.',
      family:'À regarder : SmartEX + IC Card. Un pass Kansai local peut aider si vous multipliez les excursions autour de Kyoto/Osaka.',
      badge:'Billets à l’unité'
    },
    hiroshima: {
      title:'Tokyo → Kyoto / Osaka → Hiroshima → Tokyo',
      verdict:'Regardez d’abord un pass régional, pas le national.',
      text:'C’est le premier itinéraire où le coût ferroviaire devient vraiment important, mais un montage billet Tokyo↔Kansai + pass JR West peut rester plus intéressant qu’un JR Pass national.',
      family:'À regarder : Kansai-Hiroshima Area Pass, puis comparez avec le JR Pass 7 jours si les gros trajets tiennent dans une semaine.',
      badge:'Pass régional'
    },
    custom: {
      title:'Voyage plus large',
      verdict:'Ça dépend surtout des régions traversées et du nombre de gros trajets.',
      text:'Ouvrez le mode personnalisé : cochez simplement les grandes zones prévues. On vous indiquera quelle famille de pass mérite vraiment d’être comparée.',
      family:'Le but est de vous orienter, pas de remplacer un calcul tarifaire précis.',
      badge:'À simuler'
    }
  };

  var places = [
    {id:'tokyo',name:'Tokyo / Yokohama',sub:'Kantō',zone:'east'},
    {id:'nikko',name:'Nikko',sub:'Excursion depuis Tokyo',zone:'east'},
    {id:'tohoku',name:'Sendai / Tohoku',sub:'Nord-est de Honshu',zone:'east'},
    {id:'nagano',name:'Nagano / Matsumoto',sub:'Alpes japonaises',zone:'east'},
    {id:'fuji',name:'Hakone / Fuji',sub:'Beaucoup de lignes non-JR',zone:'fuji'},
    {id:'kanazawa',name:'Kanazawa / Hokuriku',sub:'Côte de la mer du Japon',zone:'hokuriku'},
    {id:'kansai',name:'Kyoto / Osaka / Nara',sub:'Kansai',zone:'kansai'},
    {id:'hiroshima',name:'Hiroshima / Miyajima',sub:'Ouest de Honshu',zone:'west'},
    {id:'fukuoka',name:'Fukuoka',sub:'Nord de Kyushu',zone:'kyushu'},
    {id:'beppu',name:'Beppu / Yufuin',sub:'Est de Kyushu',zone:'kyushu'},
    {id:'kagoshima',name:'Kagoshima',sub:'Sud de Kyushu',zone:'kyushu'},
    {id:'hokkaido',name:'Hokkaido',sub:'Sapporo / Furano / Hakodate',zone:'hokkaido'}
  ];

  function scenarioHtml(s){
    return '<div class="calc-verdict"><strong>'+s.verdict+'</strong><p>'+s.text+'</p><div class="pass-family">'+s.family+'</div></div>';
  }

  function init(){
    var root=document.getElementById('jrCalculator');
    if(!root) return;

    root.querySelectorAll('[data-scenario]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var key=btn.getAttribute('data-scenario');
        var scenario=scenarios[key];
        root.querySelector('[data-scenario-result]').innerHTML=scenarioHtml(scenario);
        if(key==='custom') openCustom(root);
      });
    });

    var toggle=root.querySelector('[data-custom-toggle]');
    toggle.addEventListener('click',function(){openCustom(root);});

    var grid=root.querySelector('[data-destinations]');
    places.forEach(function(place){
      var label=document.createElement('label');
      label.className='destination-check';
      label.innerHTML='<input type="checkbox" value="'+place.id+'" data-place><span><strong>'+place.name+'</strong><small>'+place.sub+'</small></span>';
      grid.appendChild(label);
    });

    root.querySelectorAll('[data-place]').forEach(function(el){el.addEventListener('change',calculateCustom);});
    root.querySelector('[data-days]').addEventListener('change',calculateCustom);

    root.querySelector('[data-scenario-result]').innerHTML=scenarioHtml(scenarios.tokyo);
  }

  function openCustom(root){
    var panel=root.querySelector('[data-custom-panel]');
    panel.classList.add('open');
    panel.scrollIntoView({behavior:'smooth',block:'nearest'});
    calculateCustom();
  }

  function calculateCustom(){
    var root=document.getElementById('jrCalculator');
    var selected=Array.prototype.slice.call(root.querySelectorAll('[data-place]:checked')).map(function(el){return el.value;});
    var days=parseInt(root.querySelector('[data-days]').value,10);
    var out=root.querySelector('[data-custom-result]');

    if(!selected.length){
      out.innerHTML='<div class="calc-verdict"><strong>Cochez les grandes étapes de votre voyage.</strong><p>Pas besoin d’être précis : choisissez simplement les régions / villes majeures que vous pensez traverser.</p></div>';
      return;
    }

    var zones={east:0,fuji:0,hokuriku:0,kansai:0,west:0,kyushu:0,hokkaido:0};
    selected.forEach(function(id){
      var p=places.find(function(x){return x.id===id;});
      if(p) zones[p.zone]++;
    });

    var majorZones=['east','hokuriku','kansai','west','kyushu'].filter(function(z){return zones[z]>0;});
    var hasTokyo=selected.indexOf('tokyo')!==-1;
    var hasFuji=zones.fuji>0;
    var verdict='';
    var text='';
    var family='';
    var examples=[];

    if(zones.hokkaido && majorZones.length){
      verdict='Ne choisissez pas le JR Pass national juste pour relier Hokkaido au reste.';
      text='Pour un voyage qui mélange Hokkaido et Honshu/Kyushu, l’avion est souvent plus logique pour la grande liaison, puis un pass régional sur place si vous faites beaucoup de train.';
      family='À regarder : Hokkaido Rail Pass pour la partie Hokkaido + billets / passes séparés ailleurs.';
      examples=['Hokkaido Rail Pass','vol intérieur','IC Card'];
    } else if(zones.hokkaido && majorZones.length===0){
      verdict='Un pass Hokkaido peut clairement valoir le coup.';
      text='Si vous faites plusieurs longues étapes autour de Sapporo, Asahikawa, Furano ou Hakodate, le pass régional est bien plus naturel que le JR Pass national.';
      family='À regarder : Hokkaido Rail Pass ou les passes Sapporo–Furano / Sapporo–Noboribetsu.';
      examples=['Hokkaido Rail Pass','Sapporo–Furano'];
    } else if(zones.kyushu && majorZones.length===1){
      verdict='Regardez un pass JR Kyushu.';
      text='Si votre voyage reste essentiellement à Kyushu, inutile de payer un pass national. Les passes Northern, Southern ou All Kyushu sont beaucoup mieux ciblés.';
      family='À regarder : Northern / Southern / All Kyushu selon vos étapes.';
      examples=['All Kyushu','Northern Kyushu','Southern Kyushu'];
    } else if(zones.kansai && zones.west && !zones.east && !zones.hokuriku && !zones.kyushu){
      verdict='Un pass JR West est probablement le bon réflexe.';
      text='Kyoto / Osaka + Hiroshima / Miyajima est exactement le type d’itinéraire pour lequel les passes régionaux JR West sont intéressants.';
      family='À regarder : Kansai-Hiroshima Area Pass. Ajoutez Kansai WIDE si Kinosaki / Okayama entrent dans le voyage.';
      examples=['Kansai-Hiroshima','Kansai WIDE'];
    } else if(zones.east && zones.hokuriku && zones.kansai && !zones.west && !zones.kyushu){
      verdict='Le Hokuriku Arch Pass mérite clairement une comparaison.';
      text='Tokyo → Nagano / Kanazawa → Kyoto / Osaka est précisément le corridor pour lequel ce pass existe. Il peut être plus pertinent que le trajet direct par le Tokaido.';
      family='À regarder : Hokuriku Arch Pass.';
      examples=['Hokuriku Arch Pass'];
    } else if(zones.east && !zones.kansai && !zones.west && !zones.kyushu && !zones.hokuriku){
      if(selected.length<=2 && !selected.includes('tohoku')){
        verdict='Pas de pass national.';
        text='Pour Tokyo avec Nikko, Nagano ou une seule excursion, les billets séparés / passes locaux restent généralement plus simples.';
        family='À regarder : pass local de destination ou JR EAST si vous enchaînez plusieurs longues étapes.';
        examples=['Nikko Pass','JR EAST PASS'];
      } else {
        verdict='Un JR EAST PASS peut devenir intéressant.';
        text='Dès que vous combinez plusieurs destinations comme Tohoku, Nagano ou Niigata autour de Tokyo, le pass régional JR East est le premier à comparer.';
        family='À regarder : JR EAST PASS 5 ou 10 jours.';
        examples=['JR EAST PASS'];
      }
    } else if(zones.east && zones.kansai && !zones.west && !zones.kyushu && !zones.hokuriku){
      verdict='Le JR Pass national reste probablement inutile.';
      text='Tokyo + Kyoto / Osaka est le grand classique : même avec plusieurs trajets locaux, les billets longue distance séparés restent généralement moins chers que le pass national.';
      family='À regarder : SmartEX + IC Card + éventuellement un pass local Kansai.';
      examples=['SmartEX','Kansai Area Pass'];
    } else if(zones.east && zones.kansai && zones.west && !zones.kyushu){
      verdict=days<=7 ? 'Le JR Pass national mérite enfin d’être comparé — mais il n’est pas automatiquement gagnant.' : 'Regardez plutôt un pass JR West + billets longue distance séparés.';
      text=days<=7
        ? 'Tokyo + Kansai + Hiroshima sur une fenêtre courte fait monter la facture. Le national 7 jours devient plausible, mais un pass Kansai-Hiroshima combiné à des billets Tokyo/Kansai peut encore être meilleur.'
        : 'Si vos gros trajets sont étalés sur plus d’une semaine, le pass national perd rapidement son intérêt. Un pass régional côté Kansai/Hiroshima est souvent plus logique.';
      family='À comparer : JR Pass 7 jours vs Kansai-Hiroshima Area Pass + billets Tokyo/Kansai.';
      examples=['JR Pass 7j','Kansai-Hiroshima'];
    } else if(majorZones.length>=4 || (zones.east && zones.kyushu)){
      verdict=days<=7 ? 'Oui, le JR Pass national vaut vraiment la peine d’être chiffré.' : 'Vous traversez assez de régions pour comparer le national, mais la durée compte énormément.';
      text=days<=7
        ? 'Vous couvrez une grande partie du pays avec plusieurs longues distances rapprochées : c’est le type de voyage où le pass national peut retrouver du sens.'
        : 'Sur un voyage très étalé, plusieurs passes régionaux + quelques billets séparés peuvent rester moins chers qu’un pass national de 14 ou 21 jours.';
      family='À comparer : JR Pass national + combinaisons JR West / JR Kyushu selon votre ordre de voyage.';
      examples=['JR Pass','JR West','JR Kyushu'];
    } else if(zones.kyushu && (zones.west || zones.kansai) && !zones.east){
      verdict='Un combo JR West + JR Kyushu est souvent plus logique que le national.';
      text='Si vous partez de Kansai/Hiroshima vers Fukuoka puis Kyushu, les passes régionaux peuvent couvrir une grosse partie du voyage à bien moindre coût.';
      family='À regarder : Sanyo-San’in / JR-WEST All Area + JR Kyushu.';
      examples=['Sanyo-San’in','All Kyushu'];
    } else {
      verdict='Un pass régional semble plus prometteur que le pass national.';
      text='Votre sélection reste concentrée sur quelques zones. Commencez par le pass de la région où se trouvent vos plus longues étapes, puis complétez avec des billets séparés.';
      family='Le pass national devient surtout intéressant quand plusieurs longues liaisons inter-régionales sont rapprochées.';
      examples=['pass régional','billets séparés'];
    }

    if(hasFuji){
      text += ' Hakone / Fuji utilise en plus des lignes et bus qui ne sont pas tous JR : un pass JR ne couvrira donc pas toute cette partie.';
      examples.push('Hakone Freepass');
    }

    var labels=selected.map(function(id){
      var p=places.find(function(x){return x.id===id;});
      return p ? p.name : id;
    }).join(' · ');

    out.innerHTML='<div class="calc-verdict"><strong>'+verdict+'</strong><p>'+text+'</p><div class="pass-family">'+family+'</div>'+
      '<div class="calc-examples">'+examples.map(function(e){return '<span>'+e+'</span>';}).join('')+'</div></div>'+
      '<p class="calc-note"><strong>Votre sélection :</strong> '+labels+'. Estimation d’orientation uniquement : vérifiez ensuite les prix exacts selon les dates, trains et votre ordre réel de voyage.</p>';
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();