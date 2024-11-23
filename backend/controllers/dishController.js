const sql = require('mssql');
const { getAllDishes, insertDish, updateDishQuery, deleteDishQuery } = require('../models/sqlQueries');

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

// 删除菜品
async function deleteDish(req, res) {
    const { dishId } = req.params;

    try {
        const pool = await sql.connect();
        await pool.request()
            .input('dish_id', sql.Int, dishId)
            .query(deleteDishQuery);
        res.status(200).json({ message: '菜品已删除' });
    } catch (error) {
        console.error('Error deleting dish:', error);
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

// 更新菜品销量
const updateDishSales = async (req, res) => {
    const { dishId } = req.params; // 获取菜品 ID
    const { quantity } = req.body; // 从请求体中获取要增加的销量数量
  
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: '无效的销量数量' });
    }
  
    try {
      // 连接到数据库
      const pool = await sql.connect();
  
      // 更新销量
      const request = new sql.Request(pool);
      request.input('dishId', sql.Int, dishId);
      request.input('quantity', sql.Int, quantity);
  
      // 更新销量字段
      const result = await request.query(`
        UPDATE dish
        SET sales = ISNULL(sales, 0) + @quantity, stock = stock - @quantity
        WHERE dish_id = @dishId
      `);
  
      // 检查是否有受影响的行
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message: '菜品未找到' });
      }
  
      res.status(200).json({ message: '销量更新成功' });
    } catch (error) {
      console.error('Error updating dish sales:', error);
      res.status(500).json({ message: '服务器错误', error: error.message });
    }
  };

// 更新菜品（管理员权限）
async function updateDish(req, res) {
    const { dishId } = req.params;
    const { dish_name, price, stock } = req.body;

    try {
        const pool = await sql.connect();
        await pool.request()
            .input('dish_id', sql.Int, dishId)
            .input('dish_name', sql.NVarChar, dish_name)
            .input('price', sql.Decimal(10, 2), price)
            .input('stock', sql.Int, stock)
            .query(updateDishQuery);
        res.status(200).json({ message: '菜品已更新' });
    } catch (error) {
        console.error('Error updating dish:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}

module.exports = { getDishes, addDish, deleteDish, updateDishSales, updateDish };
