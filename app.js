const API = '/api';
const $ = s => document.querySelector(s);
const money = n => '₹' + Number(n||0).toFixed(2);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(path, options={}) {
  const res=await fetch(API+path,{credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.message||'Request failed');
  return data;
}
function toast(message,where='#message'){const el=$(where);if(el)el.innerHTML=`<div class="toast">${esc(message)}</div>`;}
function showCartToast(message,alreadyInCart=false){
 let el=$('#cartToast');
 if(!el){el=document.createElement('div');el.id='cartToast';el.className='cart-toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el);}
 el.innerHTML=`<span class="cart-toast-icon">${alreadyInCart?'ℹ':'✓'}</span><span class="cart-toast-message">${esc(message)}</span><a href="/cart.html">View Cart</a><button type="button" class="cart-toast-close" aria-label="Close notification">×</button>`;
 el.classList.add('visible');el.querySelector('.cart-toast-close').onclick=()=>el.classList.remove('visible');
 clearTimeout(window.vmCartToastTimer);window.vmCartToastTimer=setTimeout(()=>el.classList.remove('visible'),5500);
}
function getCart(){try{return JSON.parse(localStorage.getItem('vm-cart')||'[]')}catch{return []}}
function saveCart(cart){localStorage.setItem('vm-cart',JSON.stringify(cart));}
function addCart(id,name='Medicine'){
 const cart=getCart(),item=cart.find(x=>String(x.medicine_id)===String(id));
 if(item){showCartToast(`${name} is already in your cart.`,true);return false;}
 cart.push({medicine_id:Number(id),quantity:1});saveCart(cart);showCartToast(`${name} added to your cart.`);return true;
}
function productImage(category){
 const c=(category||'').toLowerCase();
 if(c.includes('pain'))return '/images/pain-relief.svg';
 if(c.includes('cold')||c.includes('cough')||c.includes('fever'))return '/images/cold-cough.svg';
 if(c.includes('vitamin')||c.includes('supplement'))return '/images/vitamins.svg';
 if(c.includes('first')||c.includes('aid'))return '/images/first-aid.svg';
 if(c.includes('digest'))return '/images/digestive.svg';
 return '/images/personal-care.svg';
}

function imageFallback(img,category){
 img.onerror=null;
 img.src='/images/healthcare-hero.svg';
}

function setupTheme(){const saved=localStorage.getItem('vm-theme');if(saved)document.documentElement.dataset.theme=saved;const b=$('#themeToggle');if(b)b.addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;localStorage.setItem('vm-theme',t);});}
async function setupNav(){const el=$('#navAuth');if(!el)return;try{const {user}=await api('/auth/me');el.innerHTML=user?`<span class="muted">Hi, ${esc(user.name)}</span> <a href="${user.role==='admin'?'/admin-dashboard.html':'/profile.html'}">My account</a> <button id="logoutBtn" class="btn-light">Logout</button>`:'<a href="/login.html">Login</a> <a class="btn" href="/register.html">Sign up</a>';const b=$('#logoutBtn');if(b)b.onclick=async()=>{await api('/auth/logout',{method:'POST'});location.href='/';};}catch{}}
document.addEventListener('DOMContentLoaded',()=>{setupTheme();setupNav();});
