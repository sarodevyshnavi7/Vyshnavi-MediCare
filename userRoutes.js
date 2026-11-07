const express=require('express'); const router=express.Router(); const db=require('../config/db');
const {requireLogin,requireAdmin}=require('../middleware/auth');
router.get('/me',requireLogin,async(req,res)=>{
 const [rows]=await db.promise().execute('SELECT user_id,name,email,phone,role FROM users WHERE user_id=?',[req.session.user.user_id]);
 res.json(rows[0]||{});
});
router.put('/me',requireLogin,async(req,res)=>{
 try{await db.promise().execute('UPDATE users SET name=?,phone=? WHERE user_id=?',[req.body.name,req.body.phone,req.session.user.user_id]);req.session.user.name=req.body.name;res.json({message:'Profile updated.'});}
 catch(e){res.status(500).json({message:'Could not update profile.'});}
});
router.get('/',requireAdmin,async(req,res)=>{
 const [rows]=await db.promise().query("SELECT user_id,name,email,phone,role FROM users WHERE role='customer' ORDER BY user_id DESC");res.json(rows);
});
module.exports=router;
