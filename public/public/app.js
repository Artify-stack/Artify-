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
  document.getElementById('loader-step').textContent='APPLYING '+selectedStyle.toUpperCase()+'...';
  document.getElementById('loader-substep').textContent='Transforming your photo';

  var pct=0;
  var pctInterval=setInterval(function(){
    pct=Math.min(pct+5,95);
    document.getElementById('progress-fill').style.width=pct+'%';
    document.getElementById('progress-pct').textContent=pct+'%';
  },100);

  setTimeout(function(){
    clearInterval(pctInterval);
    var canvas=document.createElement('canvas');
    var ctx=canvas.getContext('2d');
    var img=new Image();
    img.onload=function(){
      canvas.width=img.width;
      canvas.height=img.height;

      // Apply style filter
      var filters={
        'Anime Style':'saturate(2) contrast(1.4) brightness(1.1)',
        'Cyberpunk':'saturate(3) hue-rotate(200deg) contrast(1.5) brightness(0.8)',
        'Line Art':'grayscale(1) contrast(3) brightness(1.2)',
        'Watercolor':'saturate(1.8) blur(1px) brightness(1.15) contrast(0.9)',
        'Oil Painting':'saturate(1.6) contrast(1.3) brightness(1.05)',
        'Pixel Art':'contrast(1.4) saturate(1.8) brightness(1.1)',
        'Impressionist':'saturate(1.5) blur(0.8px) brightness(1.1) contrast(0.95)',
        'Ukiyo-e':'saturate(2.5) hue-rotate(20deg) contrast(1.6) brightness(0.95)'
      };

      ctx.filter=filters[selectedStyle]||'saturate(1.5) contrast(1.2)';
      ctx.drawImage(img,0,0);

      // Extra pixel art effect
      if(selectedStyle==='Pixel Art'){
        var size=8;
        var w=canvas.width,h=canvas.height;
        ctx.imageSmoothingEnabled=false;
        var tmp=document.createElement('canvas');
        tmp.width=Math.floor(w/size);
        tmp.height=Math.floor(h/size);
        tmp.getContext('2d').drawImage(canvas,0,0,tmp.width,tmp.height);
        ctx.clearRect(0,0,w,h);
        ctx.filter='none';
        ctx.drawImage(tmp,0,0,w,h);
      }

      // Extra line art effect
      if(selectedStyle==='Line Art'){
        var imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
        var d=imgData.data;
        for(var i=0;i<d.length;i+=4){
          var avg=(d[i]+d[i+1]+d[i+2])/3;
          var val=avg>128?255:0;
          d[i]=d[i+1]=d[i+2]=val;
        }
        ctx.putImageData(imgData,0,0);
      }

      var result=canvas.toDataURL('image/png');
      document.getElementById('progress-fill').style.width='100%';
      document.getElementById('progress-pct').textContent='100%';
      loader.style.display='none';
      document.getElementById('result-img').src=result;
      document.getElementById('result-label').textContent=selectedStyle+' Transformation';
      document.getElementById('result-view').style.display='block';
      resultUrl=result;
      showToast('Your artwork is ready!','gold');
    };
    img.src=fileBase64;
  },1500);
             }
function downloadResult(){
  if(!resultUrl)return;
  var a=document.createElement('a');
  a.href=resultUrl;
  a.download='artify-'+selectedStyle.replace(/ /g,'-').toLowerCase()+'.png';
  a.click();
  showToast('Downloading...','gold');
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
