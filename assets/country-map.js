(function () {
  'use strict';
  var container = document.getElementById('countryMap');
  if (!container) return;
  var block = document.getElementById('countryMapBlock');
  var status = document.getElementById('countryMapStatus');
  var controls = document.getElementById('countryMapControls');
  var search = document.getElementById('countryMapSearch');
  var reset = document.getElementById('countryMapReset');
  var buttons = Array.from(controls.querySelectorAll('[data-category]'));

  function unavailable() {
    block.hidden = false;
    status.textContent = 'La carte est indisponible pour le moment. Retrouvez les lieux dans les guides ci-dessous.';
    container.hidden = true;
    controls.hidden = true;
  }
  if (!window.L) { unavailable(); return; }

  fetch(container.dataset.pointsUrl)
    .then(function (response) {
      if (!response.ok) throw new Error('Map data unavailable');
      return response.json();
    })
    .then(function (points) {
      block.hidden = false;
      var map = L.map(container, {scrollWheelZoom:false}).setView([37,138],5);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom:19,
        attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      var group = L.markerClusterGroup ? L.markerClusterGroup({
        showCoverageOnHover:false,
        maxClusterRadius:45,
        iconCreateFunction:function (cluster) {
          return L.divIcon({className:'country-cluster', html:'<span>'+cluster.getChildCount()+'</span>', iconSize:[44,44]});
        }
      }) : L.featureGroup();
      group.addTo(map);
      var labels = {visit:'Visite',hotel:'Hôtel',food:'Bonne table',onsen:'Bain & onsen'};
      var category = 'all';

      function popup(point) {
        var body = document.createElement('div');
        body.className = 'country-popup';
        var eyebrow = document.createElement('div');
        eyebrow.className = 'country-popup-city';
        eyebrow.textContent = point.city+' · '+labels[point.category];
        var title = document.createElement('h3');
        title.textContent = point.emoji+' '+point.name;
        var description = document.createElement('p');
        description.textContent = point.description;
        var guide = document.createElement('a');
        guide.className = 'country-popup-guide';
        guide.href = point.url;
        guide.textContent = 'Voir la fiche dans le guide →';
        var maps = document.createElement('a');
        maps.className = 'country-popup-maps';
        maps.href = point.mapsUrl;
        maps.target = '_blank';
        maps.rel = 'noopener';
        maps.textContent = 'Google Maps ↗';
        body.append(eyebrow,title,description,guide,maps);
        return body;
      }

      var entries = points.map(function (point) {
        var icon = L.divIcon({
          className:'country-pin country-pin-'+point.category,
          html:'<span>'+point.emoji+'</span>',
          iconSize:[36,36], iconAnchor:[18,18]
        });
        var marker = L.marker([point.lat,point.lng], {icon:icon,title:point.name,alt:point.name});
        marker.bindTooltip(point.name+' · '+point.city);
        marker.bindPopup(function () { return popup(point); }, {maxWidth:300,minWidth:210});
        return {point:point,marker:marker};
      });

      function normalize(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
      }
      function render() {
        var query = normalize(search.value);
        var visible = entries.filter(function (entry) {
          return (category === 'all' || entry.point.category === category) &&
            normalize(entry.point.name+' '+entry.point.city).includes(query);
        });
        map.closePopup();
        group.clearLayers();
        group.addLayers ? group.addLayers(visible.map(function (entry) { return entry.marker; })) : visible.forEach(function (entry) { group.addLayer(entry.marker); });
        buttons.forEach(function (button) { button.setAttribute('aria-pressed',String(button.dataset.category === category)); });
        if (visible.length) {
          map.fitBounds(L.latLngBounds(visible.map(function (entry) { return [entry.point.lat,entry.point.lng]; })), {padding:[30,30],maxZoom:13});
          var cities = new Set(visible.map(function (entry) { return entry.point.city; })).size;
          status.textContent = visible.length+' lieu'+(visible.length>1?'x':'')+' · '+cities+' guide'+(cities>1?'s':'');
        } else {
          status.textContent = 'Aucun lieu ne correspond. Essayez une autre recherche ou affichez tout.';
        }
      }
      buttons.forEach(function (button) {
        button.addEventListener('click',function () { category=button.dataset.category; render(); });
      });
      search.addEventListener('input',render);
      reset.addEventListener('click',function () { search.value=''; category='all'; render(); });
      controls.hidden = false;
      render();
      if (window.ResizeObserver) new ResizeObserver(function () { map.invalidateSize({pan:false}); }).observe(container);
    })
    .catch(unavailable);
})();
