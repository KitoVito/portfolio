const element = id => document.getElementById(id);
const gallery = element('gallery'), dialog = document.querySelector('dialog');
const format = new Intl.DateTimeFormat('hr-HR', {day:'numeric',month:'long',year:'numeric'});
const datum = photo => format.format(new Date(photo.datum + 'T12:00:00'));
let visible = [], current = 0;
const albums = new Map();
for (const photo of [...fotografije].sort((a,b) => b.datum.localeCompare(a.datum) || (b.vrijeme || '').localeCompare(a.vrijeme || ''))) {
  const name = photo.album || photo.datum.slice(0,4);
  if (!albums.has(name)) albums.set(name, []);
  albums.get(name).push(photo);
}
function render(){
  const name = new URLSearchParams(location.hash.slice(1)).get('album');
  visible = albums.get(name) || [];
  const opened = albums.has(name);
  document.body.classList.toggle('album', opened);
  element('back').hidden = !opened;
  element('subtitle').hidden = opened;
  document.title = (opened ? name : 'Fotoarhiv') + ' · Trag svjetla';
  gallery.replaceChildren();
  gallery.className = opened ? 'wall' : 'grid';
  if (opened) {
    let dayGrid;
    let previousDay;
    visible.forEach((photo,index) => {
      const button = document.createElement('button');
      const image = document.createElement('img');
      image.loading = index < 8 ? 'eager' : 'lazy';
      image.width = photo.width;
      image.height = photo.height;
      image.src = photo.src;
      image.alt = photo.naslov;
      button.append(image);
      button.onclick = () => {show(index); dialog.showModal();};
      if (photo.vrijeme) {
        if (previousDay !== photo.datum) {
          const heading = document.createElement('h2');
          heading.textContent = datum(photo);
          dayGrid = document.createElement('div');
          dayGrid.className = 'day-grid';
          gallery.append(heading, dayGrid);
          previousDay = photo.datum;
        }
        dayGrid.append(button);
      } else {
        gallery.append(button);
      }
    });
  } else {
    for (const [album,photos] of albums) {
      const link = document.createElement('a');
      link.className = 'card';
      link.href = '#' + new URLSearchParams({album});
      link.innerHTML = '<img alt=""><span class="caption"><strong></strong><time></time></span>';
      link.querySelector('img').src = photos[0].src;
      link.querySelector('strong').textContent = album;
      link.querySelector('time').textContent = datum(photos[0]);
      gallery.append(link);
    }
  }
}
window.addEventListener('hashchange', render);
function show(index){
  current = (index + visible.length) % visible.length;
  const photo = visible[current];
  element('large').src = photo.src;
  element('large').alt = photo.naslov;
  element('caption').textContent = photo.naslov + ' · ' + datum(photo) + (photo.vrijeme ? ' · ' + photo.vrijeme : '');
}
element('close').onclick = () => dialog.close();
element('prev').onclick = () => show(current-1);
element('next').onclick = () => show(current+1);
dialog.onkeydown = e => {
  if(e.key === 'ArrowLeft') show(current-1);
  if(e.key === 'ArrowRight') show(current+1);
};
render();
