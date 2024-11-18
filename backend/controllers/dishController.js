const sql = require('mssql');
const { getAllDishes, insertDish, updateDish, deleteDish } = require('../models/sqlQueries');

// 获取所有菜品
async function getDishes(req, res) {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query(getAllDishes);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching dishes:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}

// 添加新菜品（管理员权限）
async function addDish(req, res) {
    const { dish_name, price, stock } = req.body;

    try {
        const pool = await sql.connect();
        await pool.request()
            .input('dish_name', sql.NVarChar, dish_name)
            .input('price', sql.Decimal(10, 2), price)
            .input('stock', sql.Int, stock)
            .query(insertDish);
        res.status(201).json({ message: '菜品已添加' });
    } catch (error) {
        console.error('Error adding dish:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}

module.exports = { getDishes, addDish };
