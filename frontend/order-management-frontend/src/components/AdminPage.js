import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPage() {
  const [dishes, setDishes] = useState([]);
  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // 获取所有菜品列表
    const fetchDishes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dishes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setDishes(response.data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
        setError('无法获取菜品列表，请稍后重试。');
      }
    };
    fetchDishes();
  }, []);

  const handleAddDish = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/dishes',
        {
          dish_name: dishName,
          price: parseFloat(price),
          stock: parseInt(stock),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // 添加成功后，重新获取菜品列表
      setDishName('');
      setPrice('');
      setStock('');
      setError(null);
      alert('菜品添加成功');
      window.location.reload(); // 简单的刷新页面重新获取最新的菜品列表
    } catch (error) {
      console.error('Error adding dish:', error);
      setError('添加菜品失败，请检查输入信息。');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>管理员页面</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>添加新菜品</h3>
        <input
          type="text"
          placeholder="菜品名称"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
        />
        <input
          type="number"
          placeholder="价格"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
        />
        <input
          type="number"
          placeholder="库存"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
        />
        <button onClick={handleAddDish} style={{ padding: '10px 20px', cursor: 'pointer' }}>添加菜品</button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <div>
        <h3>当前菜品列表</h3>
        <ul>
          {dishes.map((dish) => (
            <li key={dish.dish_id}>
              {dish.dish_name} - ¥{dish.price} - 库存：{dish.stock}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPage;
