var selectedStyle='Anime Style';
var fileBase64=null;
var resultUrl=null;
var qty=1;

var navbar=document.getElementById('navbar');
window.addEventListener('scroll',function(){navbar.classList.toggle('scrolled',window.scrollY>40);});

var revealObs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(function(el){revealObs.observe(el);});

function scrollToTop(){window.scrollTo({top:0,behavior:'smooth'});}
function scrollTo(id){var el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
function openModal(id){document.getElementById(id).classList.add('open');document.body.style.overflow='hidden';}
function closeModal(id){document.getElementById(id).classList.remove('open');document.body.style.overflow='';}
function overlayClose(e,id){if(e.target===document.getElementById(id))closeModal(id);}
document.addEventListener('keydown',function(e){if(e.key==='Escape')document.querySelectorAll('.modal-overlay.open').forEach(function(m){m.classList.remove('open');document.body.style.overflow='';});});

var toastTimer;
function showToast(msg,type){var t=document.getElementById('toast');t.textContent=msg;t.className='toast'+(type?' '+type:'')+' show';clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove('show');},3000);}

function selectStyle(el,name){document.querySelectorAll('.style-card').forEach(function(c){c.classList.remove('active');});el.classList.add('active');}
function selectAndUpload(el,name){selectStyle(el,name);selectedStyle=name;openModal('upload-modal');}
function pickStyle(el,name){document.querySelectorAll('.style-chip').forEach(function(c){c.classList.remove('selected');});el.classList.add('selected');selectedStyle=name;}

function dragOver(e){e.preventDefault();document.getElementById('upload-zone').classList.add('drag-over');}
function dragLeave(){document.getElementById('upload-zone').classList.remove('drag-over');}
function handleDrop(e){e.preventDefault();dragLeave();var f=e.dataTransfer.files[0];if(f)processFile(f);}
function handleFile(e){if(e.target.files[0])processFile(e.target.files[0]);}

function processFile(file){
  if(!file.type.startsWith('image/')){showError('Please upload an image file.');return;}
  if(file.size>10*1024*1024){showError('File too large. Max 10MB.');return;}
  var reader=new FileReader();
  reader.onload=function(e){
    fileBase64=e.target.result;
    document.getElementById('preview-img').src=fileBase64;
    document.getElementById('preview-filename').textContent='✓ '+file.name.toUpperCase();
    document.getElementById('upload-zone').style.display='none';
    document.getElementById('upload-preview').style.display='block';
    hideError();
  };
  reader.readAsDataURL(file);
}

function showError(msg){var b=document.getElementById('error-box');b.textContent='⚠ '+msg;b.style.display='block';}
function hideError(){document.getElementById('error-box').style.display='none';}

function generateArt(){
  if(!fileBase64){showError('Please upload a photo first.');return;}
  hideError();
  var styleEmojis={'Anime Style':'🌸','Cyberpunk':'⚡','Line Art':'✦','Watercolor':'💧','Oil Painting':'🎭','Pixel Art':'🕹','Impressionist':'🌅','Ukiyo-e':'🗻'};
  document.getElementById('upload-form').style.display='none';
  var loader=document.getElementById('upload-loader');
  loader.style.display='block';
  document.getElementById('loader-emoji').textContent=styleEmojis[selectedStyle]||'🎨';
  document.getElementById('loader-step').textContent='GENERATING ART...';
  document.getElementById('loader-substep').textContent='Please wait 20-40 seconds';

  var pct=0;
  var pctInterval=setInterval(function(){
    pct=Math.min(pct+2,90);
    document.getElementById('progress-fill').style.width=pct+'%';
    document.getElementById('progress-pct').textContent=pct+'%';
  },800);

  var stylePrompts={
    'Anime Style':'anime style portrait illustration manga art vibrant colors bold outlines high quality',
    'Cyberpunk':'cyberpunk portrait neon lights dystopian city electric colors high quality',
    'Line Art':'minimal line art portrait clean ink drawing black and white elegant high quality',
    'Watercolor':'watercolor portrait painting soft color washes artistic dreamy high quality',
    'Oil Painting':'oil painting portrait classic fine art rich textures painterly high quality',
    'Pixel Art':'pixel art portrait 16-bit retro game art colorful high quality',
    'Impressionist':'impressionist portrait Monet style soft light loose brushstrokes high quality',
    'Ukiyo-e':'ukiyo-e Japanese woodblock print portrait flat colors bold outlines traditional'
  };

  var prompt=encodeURIComponent(stylePrompts[selectedStyle]||'artistic portrait illustration high quality');
  var seed=Math.floor(Math.random()*1000000);
  var imageUrl='https://image.pollinations.ai/prompt/'+prompt+'?width=512&height=512&seed='+seed+'&nologo=true';

  setTimeout(function(){
    clearInterval(pctInterval);
    document.getElementById('progress-fill').style.width='100%';
    document.getElementById('progress-pct').textContent='100%';
    loader.style.display='none';
    document.getElementById('result-img').src=imageUrl;
    document.getElementById('result-label').textContent=selectedStyle+' Transformation';
    document.getElementById('result-view').style.display='block';
    resultUrl=imageUrl;
    showToast('Your artwork is ready!','gold');
  },20000);
}

function downloadResult(){
  if(!resultUrl)return;
  var a=document.createElement('a');
  a.href=resultUrl;
  a.target='_blank';
  a.click();
  showToast('Opening image...','gold');
}

function resetUpload(){
  fileBase64=null;resultUrl=null;
  document.getElementById('upload-form').style.display='block';
  document.getElementById('upload-zone').style.display='block';
  document.getElementById('upload-preview').style.display='none';
  document.getElementById('upload-loader').style.display='none';
  document.getElementById('result-view').style.display='none';
  document.getElementById('file-input').value='';
  document.getElementById('progress-fill').style.width='0%';
  hideError();
}

function openProductModal(name,emoji,price,desc){
  var parts=name.split(' ');
  document.getElementById('pm-title').innerHTML=parts.slice(0,-1).join(' ')+' <em>'+parts.slice(-1)+'</em>';
  document.getElementById('pm-emoji').textContent=emoji;
  document.getElementById('pm-price').textContent=price;
  document.getElementById('pm-desc').textContent=desc;
  qty=1;document.getElementById('qty-display').textContent=1;
  openModal('product-modal');
}
function selectSize(el){document.querySelectorAll('.size-btn').forEach(function(b){b.classList.remove('selected');});el.classList.add('selected');}
function changeQty(d){qty=Math.max(1,qty+d);document.getElementById('qty-display').textContent=qty;}
function addToCart(){
  var name=document.getElementById('pm-title').textContent;
  var size=document.querySelector('.size-btn.selected');
  showToast(qty+'x '+name+' ('+(size?size.textContent:'M')+') added','gold');
  closeModal('product-modal');
}
function submitContact(){
  var name=document.getElementById('contact-name').value.trim();
  var email=document.getElementById('contact-email').value.trim();
  var msg=document.getElementById('contact-msg').value.trim();
  if(!name||!email||!msg){showToast('Please fill in all fields');return;}
  if(!email.includes('@')){showToast('Invalid email');return;}
  showToast('Message sent!','gold');
  closeModal('contact-modal');
  ['contact-name','contact-email','contact-msg'].forEach(function(id){document.getElementById(id).value='';});
}
