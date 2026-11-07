const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

router.get('/', async (req,res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT medicine_id, medicine_name, category, manufacturer, price, stock, expiry_date
       FROM medicines WHERE expiry_date >= CURDATE() ORDER BY medicine_name`);
    res.json(rows);
  } catch(e) { res.status(500).json({message:'Could not load medicines.'}); }
});
router.get('/:id', async (req,res) => {
  try {
    const [rows] = await db.promise().execute('SELECT * FROM medicines WHERE medicine_id=?',[req.params.id]);
    if (!rows.length) return res.status(404).json({message:'Medicine not found.'});
    res.json(rows[0]);
  } catch(e) { res.status(500).json({message:'Could not load medicine.'}); }
});
router.post('/', requireAdmin, async (req,res) => {
  const {medicine_name,category,manufacturer,price,stock,expiry_date}=req.body;
  if(!medicine_name || !category || !manufacturer || Number(price)<0 || Number(stock)<0 || !expiry_date)
    return res.status(400).json({message:'Please complete all medicine fields.'});
  try {
    const [r]=await db.promise().execute('INSERT INTO medicines (medicine_name,category,manufacturer,price,stock,expiry_date) VALUES (?,?,?,?,?,?)',[medicine_name,category,manufacturer,price,stock,expiry_date]);
    res.status(201).json({medicine_id:r.insertId});
  } catch(e){res.status(500).json({message:'Could not add medicine.'});}
});
router.put('/:id', requireAdmin, async (req,res) => {
  const {medicine_name,category,manufacturer,price,stock,expiry_date}=req.body;
  try {
    await db.promise().execute('UPDATE medicines SET medicine_name=?,category=?,manufacturer=?,price=?,stock=?,expiry_date=? WHERE medicine_id=?',[medicine_name,category,manufacturer,price,stock,expiry_date,req.params.id]);
    res.json({message:'Medicine updated.'});
  } catch(e){res.status(500).json({message:'Could not update medicine.'});}
});
router.delete('/:id', requireAdmin, async (req,res) => {
  try { await db.promise().execute('DELETE FROM medicines WHERE medicine_id=?',[req.params.id]); res.json({message:'Medicine deleted.'}); }
  catch(e){res.status(409).json({message:'This medicine may be linked to an order and cannot be deleted.'});}
});
module.exports = router;
