const express=require('express');const router=express.Router();const db=require('../config/db');const {requireAdmin}=require('../middleware/auth');
router.use(requireAdmin);
router.get('/stats',async(req,res)=>{
 try{
 const [[u]]=await db.promise().query("SELECT COUNT(*) customers FROM users WHERE role='customer'");
 const [[m]]=await db.promise().query("SELECT COUNT(*) medicines FROM medicines");
 const [[o]]=await db.promise().query("SELECT COUNT(*) orders,COALESCE(SUM(total_amount),0) sales FROM orders");
 const [low]=await db.promise().query("SELECT medicine_id,medicine_name,stock FROM medicines WHERE stock<10 ORDER BY stock");
 const [exp]=await db.promise().query("SELECT medicine_id,medicine_name,expiry_date FROM medicines WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(),INTERVAL 30 DAY)");
 const [recent]=await db.promise().query("SELECT o.order_id,o.order_date,o.total_amount,o.status,u.name FROM orders o JOIN users u ON o.user_id=u.user_id ORDER BY o.order_id DESC LIMIT 6");
 res.json({customers:u.customers,medicines:m.medicines,orders:o.orders,sales:o.sales,low,exp,recent});
 }catch(e){res.status(500).json({message:'Could not load dashboard.'});}
});
router.get('/stock',async(req,res)=>{
 const [rows]=await db.promise().query("SELECT * FROM medicines ORDER BY stock ASC");res.json(rows);
});
module.exports=router;
