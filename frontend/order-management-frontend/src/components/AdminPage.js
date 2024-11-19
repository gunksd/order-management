import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPage() {
  const [dishes, setDishes] = useState([]);
  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState(null);

  // 获取菜品列表
  const fetchDishes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dishes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDishes(response.data);
      setError(null); // 清除错误信息
    } catch (error) {
      console.error('Error fetching dishes:', error);
      if (error.response && error.response.status === 401) {
        setError('未授权访问，请重新登录。');
        // 如果认证失败，不直接刷新页面，而是引导用户重新登录
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000); // 2 秒后跳转到登录页面
      } else {
        setError('无法获取菜品列表，请稍后重试。');
      }
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  // 添加菜品
  const handleAddDish = async () => {
    // 检查输入的有效性
    if (!dishName || price <= 0 || stock <= 0) {
      setError('请输入有效的菜品信息。');
      return;
    }

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
      // 添加成功后，重新获取菜品列表，而不是刷新页面
      setDishName('');
      setPrice('');
      setStock('');
      setError(null);
      alert('菜品添加成功');
      fetchDishes(); // 调用获取菜品列表函数来更新列表
    } catch (error) {
      console.error('Error adding dish:', error);
      if (error.response && error.response.status === 401) {
        setError('未授权访问，请重新登录。');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000); // 2 秒后跳转到登录页面
      } else {
        setError('添加菜品失败，请检查输入信息。');
      }
    }
  };

  // 删除菜品
  const handleDeleteDish = async (dishId) => {
    try {
      await axios.delete(`http://localhost:5000/api/dishes/${dishId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('菜品删除成功');
      fetchDishes(); // 删除后重新获取菜品列表
    } catch (error) {
      console.error('Error deleting dish:', error);
      if (error.response && error.response.status === 401) {
        setError('未授权访问，请重新登录。');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000); // 2 秒后跳转到登录页面
      } else {
        setError('删除菜品失败，请稍后重试。');
      }
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
              <button 
                onClick={() => handleDeleteDish(dish.dish_id)} 
                style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPage;
