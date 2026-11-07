const express=require('express');
const router=express.Router();
const db=require('../config/db');
const {requireLogin,requireAdmin}=require('../middleware/auth');

router.post('/',requireLogin,async(req,res)=>{
 const items=req.body.items;
 if(!Array.isArray(items)||!items.length) return res.status(400).json({message:'Your cart is empty.'});
 const conn=await db.promise().getConnection();
 try{
  await conn.beginTransaction(); let total=0; const validated=[];
  for(const item of items){
   const qty=Math.floor(Number(item.quantity));
   if(!Number.isInteger(qty)||qty<1||qty>50) throw new Error('Invalid quantity.');
   const [rows]=await conn.execute('SELECT * FROM medicines WHERE medicine_id=? AND expiry_date>=CURDATE() FOR UPDATE',[item.medicine_id]);
   if(!rows.length||rows[0].stock<qty) throw new Error('A medicine is unavailable, expired or has insufficient stock.');
   const m=rows[0]; total+=Number(m.price)*qty; validated.push({m,qty});
  }
  const [order]=await conn.execute('INSERT INTO orders(user_id,order_date,total_amount,status) VALUES(?,CURDATE(),?,?)',[req.session.user.user_id,total,'Pending']);
  for(const x of validated){
   await conn.execute('INSERT INTO order_items(order_id,medicine_id,quantity,price) VALUES(?,?,?,?)',[order.insertId,x.m.medicine_id,x.qty,x.m.price]);
   await conn.execute('UPDATE medicines SET stock=stock-? WHERE medicine_id=?',[x.qty,x.m.medicine_id]);
  }
  await conn.commit(); res.status(201).json({order_id:order.insertId,total_amount:total});
 }catch(e){await conn.rollback();res.status(400).json({message:e.message||'Order could not be placed.'});}
 finally{conn.release();}
});
router.get('/mine',requireLogin,async(req,res)=>{
 try{const [rows]=await db.promise().execute('SELECT * FROM orders WHERE user_id=? ORDER BY order_id DESC',[req.session.user.user_id]);res.json(rows);}
 catch(e){res.status(500).json({message:'Could not load orders.'});}
});
router.get('/',requireAdmin,async(req,res)=>{
 try{const [rows]=await db.promise().query('SELECT o.*,u.name,u.email FROM orders o JOIN users u ON o.user_id=u.user_id ORDER BY o.order_id DESC');res.json(rows);}
 catch(e){res.status(500).json({message:'Could not load orders.'});}
});
router.patch('/:id/status',requireAdmin,async(req,res)=>{
 const allowed=['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'];
 if(!allowed.includes(req.body.status)) return res.status(400).json({message:'Invalid order status.'});
 try{await db.promise().execute('UPDATE orders SET status=? WHERE order_id=?',[req.body.status,req.params.id]);res.json({message:'Order status updated.'});}
 catch(e){res.status(500).json({message:'Could not update order.'});}
});
module.exports=router;
