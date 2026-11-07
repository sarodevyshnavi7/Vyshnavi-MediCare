document.addEventListener('DOMContentLoaded', async()=>{
 const page=document.body.dataset.page;
 try{
 if(page==='medicines') await renderMedicines();
 if(page==='cart') renderCart();
 if(page==='checkout') setupCheckout();
 if(page==='login') setupLogin();
 if(page==='register') setupRegister();
 if(page==='profile') await setupProfile();
 if(page==='orders') await renderOrders();
 if(page==='admin') await renderAdmin();
 if(page==='admin-medicines'||page==='admin-stock') await renderAdminMedicines();
 if(page==='admin-orders') await renderAdminOrders();
 if(page==='admin-users') await renderUsers();
 if(page==='medicine-details') await renderDetails();
 if(page==='add-medicine') setupMedicineForm();
 }catch(e){toast(e.message);}
});
let allMedicines=[];
async function renderMedicines(){
 allMedicines=await api('/medicines');
 const q=$('#search'),cat=$('#category'),sort=$('#sort');
 const draw=()=>{let a=allMedicines.filter(m=>m.medicine_name.toLowerCase().includes(q.value.toLowerCase())&&(!cat.value||m.category===cat.value));if(sort.value==='name')a.sort((x,y)=>x.medicine_name.localeCompare(y.medicine_name));if(sort.value==='price-low')a.sort((x,y)=>x.price-y.price);if(sort.value==='price-high')a.sort((x,y)=>y.price-x.price);
 $('#medicineRows').innerHTML=a.length?a.map(m=>`<tr><td><img class="catalogue-medicine-image" src="${productImage(m.category)}" onerror="imageFallback(this,'${esc(m.category)}')" alt="${esc(m.medicine_name)}"></td><td><b>${esc(m.medicine_name)}</b><br><small class="muted">#${m.medicine_id}</small></td><td>${esc(m.category)}</td><td>${esc(m.manufacturer)}</td><td class="price">${money(m.price)}</td><td>${m.stock>0?`<span class="${m.stock<10?'stock-low':''}">${m.stock} available</span>`:'Out of stock'}</td><td>${esc(m.expiry_date)}</td><td><div class="actions"><a class="btn btn-light" href="/medicine-details.html?id=${m.medicine_id}">Details</a><button onclick="addCart(${m.medicine_id},${JSON.stringify(m.medicine_name).replace(/\"/g,'&quot;').replace(/</g,'\\u003c')})" ${m.stock<1?'disabled':''}>Add</button></div></td></tr>`).join(''):'<tr><td colspan="8" class="empty">No medicines found. Try another search.</td></tr>';};
 [q,cat,sort].forEach(x=>x.addEventListener('input',draw));draw();
}
function renderCart(){
 const cart=getCart();api('/medicines').then(ms=>{const rows=cart.map(c=>({...c,m:ms.find(m=>m.medicine_id===c.medicine_id)})).filter(x=>x.m);
 let total=0;$('#cartRows').innerHTML=rows.length?rows.map(x=>{total+=x.m.price*x.quantity;return `<tr><td>${esc(x.m.medicine_name)}</td><td>${money(x.m.price)}</td><td><input aria-label="Quantity" type="number" min="1" max="${x.m.stock}" value="${x.quantity}" style="width:75px" onchange="changeQty(${x.m.medicine_id},this.value)"></td><td>${money(x.m.price*x.quantity)}</td><td><button class="btn-danger" onclick="removeCart(${x.m.medicine_id})">Remove</button></td></tr>`}).join(''):'<tr><td colspan="5" class="empty">Your cart is empty.</td></tr>';
 $('#cartTotal').textContent=money(total);$('#checkoutLink').style.display=rows.length?'inline-flex':'none';
 }).catch(e=>toast(e.message));
}
window.changeQty=(id,v)=>{let c=getCart();c=c.map(x=>x.medicine_id===id?{...x,quantity:Math.max(1,Math.min(50,Number(v)||1))}:x);saveCart(c);renderCart();};
window.removeCart=id=>{saveCart(getCart().filter(x=>x.medicine_id!==id));renderCart();};
function setupCheckout(){
 const form=$('#checkoutForm');form.onsubmit=async e=>{e.preventDefault();try{const result=await api('/orders',{method:'POST',body:JSON.stringify({items:getCart()})});saveCart([]);location.href='/order-success.html?id='+result.order_id;}catch(err){toast(err.message);}};
}
function setupLogin(){$('#loginForm').onsubmit=async e=>{e.preventDefault();try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email:$('#email').value,password:$('#password').value})});location.href=d.redirect;}catch(err){toast(err.message);}};}
function setupRegister(){$('#registerForm').onsubmit=async e=>{e.preventDefault();try{await api('/auth/register',{method:'POST',body:JSON.stringify({name:$('#name').value,email:$('#email').value,password:$('#password').value,phone:$('#phone').value})});location.href='/index.html';}catch(err){toast(err.message);}};}
async function setupProfile(){const u=await api('/users/me');$('#name').value=u.name||'';$('#email').value=u.email||'';$('#phone').value=u.phone||'';$('#profileForm').onsubmit=async e=>{e.preventDefault();try{await api('/users/me',{method:'PUT',body:JSON.stringify({name:$('#name').value,phone:$('#phone').value})});toast('Profile updated.');}catch(err){toast(err.message);}};}
async function renderOrders(){const a=await api('/orders/mine');$('#ordersRows').innerHTML=a.length?a.map(o=>`<tr><td>#${o.order_id}</td><td>${o.order_date}</td><td>${money(o.total_amount)}</td><td><span class="status">${esc(o.status)}</span></td></tr>`).join(''):'<tr><td colspan="4" class="empty">No orders yet.</td></tr>';}
async function renderDetails(){const id=new URLSearchParams(location.search).get('id');const m=await api('/medicines/'+id);$('#detail').innerHTML=`<div class="medicine-detail-grid"><div class="panel medicine-detail-photo"><img src="${productImage(m.category)}" onerror="imageFallback(this,'${esc(m.category)}')" alt="${esc(m.medicine_name)}"></div><div class="panel"><p class="eyebrow">${esc(m.category)}</p><h1>${esc(m.medicine_name)}</h1><p>Manufacturer: ${esc(m.manufacturer)}</p><p class="price">${money(m.price)}</p><p>${m.stock} units available · Expires ${m.expiry_date}</p><button onclick="addCart(${m.medicine_id},${JSON.stringify(m.medicine_name).replace(/\"/g,'&quot;').replace(/</g,'\\u003c')})" ${m.stock<1?'disabled':''}>Add to cart</button><p class="muted">Educational demo listing. Follow a qualified healthcare professional's advice.</p></div></div>`;}
async function renderAdmin(){const d=await api('/admin/stats');$('#stats').innerHTML=[['Customers',d.customers],['Medicines',d.medicines],['Orders',d.orders],['Demo sales',money(d.sales)]].map(x=>`<div class="panel stat"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');$('#lowAlerts').innerHTML=d.low.map(x=>`<p class="stock-low">${esc(x.medicine_name)} — ${x.stock} left</p>`).join('')||'<p class="muted">No low-stock alerts.</p>';$('#expiryAlerts').innerHTML=d.exp.map(x=>`<p>${esc(x.medicine_name)} — expires ${x.expiry_date}</p>`).join('')||'<p class="muted">No upcoming expiry alerts.</p>';$('#recentRows').innerHTML=d.recent.map(x=>`<tr><td>#${x.order_id}</td><td>${esc(x.name)}</td><td>${money(x.total_amount)}</td><td>${esc(x.status)}</td></tr>`).join('');}
async function renderAdminMedicines(){const a=await api('/admin/stock');$('#adminMedicineRows').innerHTML=a.map(m=>`<tr><td>${m.medicine_id}</td><td>${esc(m.medicine_name)}</td><td>${esc(m.category)}</td><td>${money(m.price)}</td><td class="${m.stock<10?'stock-low':''}">${m.stock}</td><td>${m.expiry_date}</td><td><a class="btn btn-light" href="/edit-medicine.html?id=${m.medicine_id}">Edit</a> <button class="btn-danger" onclick="deleteMedicine(${m.medicine_id})">Delete</button></td></tr>`).join('');}
window.deleteMedicine=async id=>{if(!confirm('Delete this medicine?'))return;try{await api('/medicines/'+id,{method:'DELETE'});location.reload();}catch(e){toast(e.message);}};
async function renderAdminOrders(){const a=await api('/orders');$('#adminOrderRows').innerHTML=a.map(o=>`<tr><td>#${o.order_id}</td><td>${esc(o.name)}</td><td>${o.order_date}</td><td>${money(o.total_amount)}</td><td><select onchange="updateStatus(${o.order_id},this.value)">${['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'].map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('');}
window.updateStatus=async(id,status)=>{try{await api('/orders/'+id+'/status',{method:'PATCH',body:JSON.stringify({status})});toast('Order status updated.');}catch(e){toast(e.message);}};
async function renderUsers(){const a=await api('/users');$('#usersRows').innerHTML=a.map(u=>`<tr><td>${u.user_id}</td><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone||'—')}</td></tr>`).join('');}
function setupMedicineForm(){const id=new URLSearchParams(location.search).get('id');if(id)api('/medicines/'+id).then(m=>Object.keys(m).forEach(k=>{const el=$(`[name="${k}"]`);if(el)el.value=m[k]}));$('#medicineForm').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));try{await api('/medicines'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify(data)});location.href='/admin-medicines.html';}catch(err){toast(err.message);}};}
