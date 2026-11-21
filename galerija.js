const element = id => document.getElementById(id);
const gallery = element('gallery'), dialog = document.querySelector('dialog');
const format = new Intl.DateTimeFormat('hr-HR', {day:'numeric',month:'long',year:'numeric'});
const datum = photo => format.format(new Date(photo.datum + 'T12:00:00'));
let visible = [], current = 0;
const albums = new Map();
for (const photo of [...fotografije].sort((a,b) => b.datum.localeCompare(a.datum) || (b.vrijeme || '').localeCompare(a.vrijeme || '') || (a.vrijeme && b.vrijeme ? b.naslov.localeCompare(a.naslov, 'hr', {numeric:true}) : 0))) {
  const name = photo.album || photo.datum.slice(0,4);
  if (!albums.has(name)) albums.set(name, []);
  albums.get(name).push(photo);
}
const children = new Set([...albums].filter(([name, photos]) =>
  name !== 'export' && photos[0].src.startsWith('export/')
).map(([name]) => name));

function albumCard(album, photos) {
  const link = document.createElement('a');
  link.className = 'card';
  link.href = '#' + new URLSearchParams({album});
  link.innerHTML = '<img alt=""><span class="caption"><strong></strong><time></time></span>';
  link.querySelector('img').src = photos[0].src;
  link.querySelector('strong').textContent = album;
  link.querySelector('time').textContent = datum(photos[0]);
  return link;
}

function render(){
  const name = new URLSearchParams(location.hash.slice(1)).get('album');
  visible = albums.get(name) || [];
  const opened = albums.has(name);
  document.body.classList.toggle('album', opened);
  const back = element('back');
  back.href = children.has(name) ? '#album=export' : '#';
  back.textContent = children.has(name) ? 'Natrag na export' : 'Svi albumi';
  const folders = element('folders');
  folders.replaceChildren();
  folders.hidden = opened && name !== 'export';
  if (!folders.hidden) {
    for (const [album, photos] of albums) {
      if (children.has(album) === (name === 'export')) folders.append(albumCard(album, photos));
    }
  }
  element('back').hidden = !opened;
  element('subtitle').hidden = opened;
  document.title = (opened ? name : 'Fotoarhiv') + ' · Trag svjetla';
  gallery.replaceChildren();
  gallery.hidden = !opened;
  gallery.className = opened ? 'wall' : '';
  if (opened) {
    if (visible.every(photo => photo.vrijeme)) gallery.classList.add('chronological');
    visible.forEach((photo,index) => {
      const button = document.createElement('button');
      button.style.setProperty('--ratio', photo.width / photo.height);
      const image = document.createElement('img');
      image.loading = index < 8 ? 'eager' : 'lazy';
      image.width = photo.width;
      image.height = photo.height;
      image.src = photo.src;
      image.alt = photo.naslov;
      button.append(image);
      button.onclick = () => {show(index); dialog.showModal();};
      gallery.append(button);
    });
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
