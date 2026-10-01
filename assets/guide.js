(function () {
  var places = window.GUIDE_PLACES || [];

  var photos = window.GUIDE_PHOTOS || {};

  function commonsUrl(file,width){
    return 'https://commons.wikimedia.org/wiki/Special:Redirect/file/' + encodeURIComponent(file) + '?width=' + width;
  }
  function commonsPage(file){
    return 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file).replace(/%20/g,'_');
  }

  var lightbox = document.getElementById('photoLightbox');
  var lightboxImage = document.getElementById('lightboxImage');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');

  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    lightboxImage.removeAttribute('src');
    document.body.style.overflow='';
  }
  function openLightbox(photo, alt){
    lightboxImage.src = commonsUrl(photo.file,1600);
    lightboxImage.alt = alt;
    lightboxCaption.innerHTML = photo.label + ' · <a href="' + commonsPage(photo.file) + '" target="_blank" rel="noopener">photo, auteur & licence sur Wikimedia Commons ↗</a>';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }

  Object.keys(photos).forEach(function(id){
    var card = document.getElementById(id);
    var photo = photos[id];
    if(!card || !photo) return;

    var body = document.createElement('div');
    body.className = 'place-body';
    while(card.firstChild) body.appendChild(card.firstChild);

    var figure = document.createElement('figure');
    figure.className = 'place-media';
    figure.setAttribute('tabindex','0');
    figure.setAttribute('role','button');
    figure.setAttribute('aria-label','Agrandir la photo de ' + photo.label);

    var img = document.createElement('img');
    img.src = commonsUrl(photo.file,520);
    img.alt = photo.label;
    img.loading = 'lazy';
    img.decoding = 'async';

    var caption = document.createElement('figcaption');
    caption.innerHTML = '<a href="' + commonsPage(photo.file) + '" target="_blank" rel="noopener" title="Auteur et licence">Wikimedia Commons ↗</a>';
    caption.addEventListener('click',function(e){ e.stopPropagation(); });

    figure.appendChild(img);
    figure.appendChild(caption);
    figure.addEventListener('click',function(){ openLightbox(photo,photo.label); });
    figure.addEventListener('keydown',function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(photo,photo.label); }
    });

    card.appendChild(figure);
    card.appendChild(body);
    card.classList.add('has-photo');
  });

  lightboxClose.addEventListener('click',closeLightbox);
  lightbox.addEventListener('click',function(e){ if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown',function(e){ if(e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });

  var center = window.GUIDE_CENTER || (places.length ? [places[0].lat, places[0].lng] : [0,0]);
  var zoom = window.GUIDE_ZOOM || 13;
  var map = L.map('map', {zoomControl:true, scrollWheelZoom:true}).setView(center,zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var markers = {};
  var bounds = [];

  function iconFor(place) {
    var extra = place.kind === 'hotel' ? ' hotel' : place.kind === 'food' ? ' food' : place.kind === 'maybe' ? ' maybe-pin' : '';
    return L.divIcon({
      className:'custom-marker' + extra,
      html:'<div class="pin"><span>' + place.emoji + '</span></div>',
      iconSize:[36,36],
      iconAnchor:[18,34],
      popupAnchor:[0,-31]
    });
  }

  function isMobileMapMode(){
    return window.matchMedia('(max-width: 980px)').matches;
  }

  function themeLabel(place){
    if(place.kind === 'hotel') return 'Hôtel';
    if(place.kind === 'food') return 'Café / gourmandise';
    return 'Visite';
  }

  function guideCityName(){
    var brand = document.querySelector('.brand');
    if(!brand) return '';
    return brand.textContent.replace(/^\s*[^A-Za-zÀ-ÿ]+\s*/,'').trim();
  }

  function googleMapsUrl(place){
    if(place && Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lng))){
      return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place.lat + ',' + place.lng);
    }
    var query = ((place && place.name) || '') + ' ' + guideCityName();
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query.trim());
  }

  function addGoogleMapsLink(card, place){
    if(!card || card.querySelector('.google-map-link')) return;
    var actions = card.querySelector('.actions');
    if(!actions){
      actions = document.createElement('div');
      actions.className = 'actions';
      var body = card.querySelector('.place-body') || card;
      body.appendChild(actions);
    }
    var link = document.createElement('a');
    link.className = 'google-map-link';
    link.href = googleMapsUrl(place);
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Google Maps ↗';
    link.setAttribute('aria-label','Ouvrir ' + ((place && place.name) || 'ce lieu') + ' dans Google Maps');
    actions.appendChild(link);
  }

  function openMobilePlacePreview(place, marker){
    var wrapper = document.createElement('div');
    wrapper.className = 'mobile-map-card';

    var photo = photos[place.id];
    if(photo){
      var img = document.createElement('img');
      img.src = commonsUrl(photo.file,520);
      img.alt = photo.label;
      img.loading = 'eager';
      wrapper.appendChild(img);
    }

    var body = document.createElement('div');
    body.className = 'mobile-map-card-body';

    var theme = document.createElement('div');
    theme.className = 'mobile-map-theme';
    theme.textContent = themeLabel(place);

    var title = document.createElement('h4');
    title.textContent = place.name;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-detail-btn';
    button.textContent = 'Voir le détail';
    button.addEventListener('click', function(){
      map.closePopup();
      window.focusPlace(place.id,true);
    });

    var mapsLink = document.createElement('a');
    mapsLink.className = 'mobile-google-map-link';
    mapsLink.href = googleMapsUrl(place);
    mapsLink.target = '_blank';
    mapsLink.rel = 'noopener';
    mapsLink.textContent = 'Google Maps ↗';

    body.appendChild(theme);
    body.appendChild(title);
    body.appendChild(button);
    body.appendChild(mapsLink);
    wrapper.appendChild(body);

    L.popup({
      className:'mobile-place-popup',
      maxWidth:250,
      minWidth:230,
      autoPan:true,
      closeButton:true,
      offset:[0,-20]
    })
      .setLatLng(marker.getLatLng())
      .setContent(wrapper)
      .openOn(map);
  }

  places.forEach(function(place){
    addGoogleMapsLink(document.getElementById(place.id), place);
    var marker = L.marker([place.lat,place.lng],{icon:iconFor(place)}).addTo(map);
    marker.bindTooltip(place.name,{direction:'top',offset:[0,-28],opacity:.92});
    marker.on('click', function(){
      if(isMobileMapMode()){
        setFocused(place.id);
        openMobilePlacePreview(place,marker);
      } else {
        window.focusPlace(place.id,true);
      }
    });
    markers[place.id] = marker;
    bounds.push([place.lat,place.lng]);
  });

  document.querySelectorAll('.place').forEach(function(card){
    if(card.querySelector('.google-map-link')) return;
    var title = card.querySelector('h3');
    if(!title) return;
    addGoogleMapsLink(card,{name:title.textContent.trim()});
  });

  function refreshMap(fit) {
    map.invalidateSize({pan:false});
    if (fit && bounds.length) map.fitBounds(bounds,{padding:[24,24]});
  }

  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ refreshMap(true); });
  });
  window.addEventListener('load', function(){
    setTimeout(function(){ refreshMap(false); }, 120);
  });

  if (window.ResizeObserver) {
    var resizeObserver = new ResizeObserver(function(){
      requestAnimationFrame(function(){ refreshMap(false); });
    });
    resizeObserver.observe(document.getElementById('mapPanel'));
  }

  function setFocused(id){
    document.querySelectorAll('.place.is-focused').forEach(function(el){el.classList.remove('is-focused');});
    var card = document.getElementById(id);
    if(card) card.classList.add('is-focused');
  }

  window.focusPlace = function(id, scrollToCard){
    var place = places.find(function(p){return p.id === id;});
    if(!place) return;
    setFocused(id);
    map.flyTo([place.lat,place.lng], Math.max(map.getZoom(),15), {duration:.65});
    if(!isMobileMapMode()) markers[id].openTooltip();
    if(scrollToCard){
      var card = document.getElementById(id);
      if(card) setTimeout(function(){card.scrollIntoView({behavior:'smooth',block:'center'});},120);
    }
    if(history.replaceState) history.replaceState(null,'','#' + id);
  };

  document.querySelectorAll('[data-focus]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var id = btn.getAttribute('data-focus');
      var isMobile = window.matchMedia('(max-width: 980px)').matches;

      if(isMobile){
        panel.classList.remove('collapsed');
        toggle.textContent = 'Réduire la carte';
        setTimeout(function(){
          refreshMap(false);
          window.focusPlace(id,false);
          panel.scrollIntoView({behavior:'smooth',block:'start'});
          setTimeout(function(){
            refreshMap(false);
            var place = places.find(function(p){return p.id === id;});
            if(place && markers[id]) openMobilePlacePreview(place,markers[id]);
          },450);
        },80);
      } else {
        window.focusPlace(id,false);
      }
    });
  });

  var panel = document.getElementById('mapPanel');
  var toggle = document.getElementById('mapToggle');
  toggle.addEventListener('click',function(){
    panel.classList.toggle('collapsed');
    var collapsed = panel.classList.contains('collapsed');
    toggle.textContent = collapsed ? 'Afficher la carte' : 'Réduire la carte';
    if(!collapsed) setTimeout(function(){refreshMap(false);},200);
  });

  window.addEventListener('resize',function(){setTimeout(function(){refreshMap(false);},80);});

  var nav = document.querySelector('.nav');
  var topbarInner = document.querySelector('.topbar-inner');
  function updateNavFade(){
    if(!nav || !topbarInner) return;
    var atEnd = nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 8;
    topbarInner.classList.toggle('nav-at-end', atEnd);
  }
  if(nav){
    nav.addEventListener('scroll',updateNavFade,{passive:true});
    window.addEventListener('resize',updateNavFade);
    requestAnimationFrame(updateNavFade);
  }

  var backToTop = document.getElementById('backToTop');
  function updateBackToTop(){
    backToTop.classList.toggle('visible', window.scrollY > 850);
  }
  window.addEventListener('scroll',updateBackToTop,{passive:true});
  updateBackToTop();
  backToTop.addEventListener('click',function(){
    window.scrollTo({top:0,behavior:'smooth'});
  });

  if(location.hash){
    var initial = location.hash.slice(1);
    if(markers[initial]) setTimeout(function(){window.focusPlace(initial,false);},400);
  }
})();