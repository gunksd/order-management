import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CustomerPage() {
  const [dishes, setDishes] = useState([]);
  const [order, setOrder] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/dishes')
      .then(response => {
        setDishes(response.data);
      })
      .catch(error => {
        console.error('Error fetching dishes:', error);
      });
  }, []);

  const addToOrder = (dish) => {
    setOrder([...order, dish]);
  };

  const calculateTotal = () => {
    return order.reduce((total, dish) => total + dish.price, 0).toFixed(2);
  };

  const placeOrder = () => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/orders', {
      user_id: 1, // 假设已登录顾客ID为1
      total_amount: calculateTotal(),
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      alert('订单提交成功！');
      setOrder([]);
    }).catch(error => {
      console.error('Error placing order:', error);
      alert('订单提交失败！');
    });
  };

  return (
    <div>
      <h1>欢迎，顾客</h1>
      <div className="dishes">
        {dishes.map(dish => (
          <div key={dish.dish_id}>
            <h3>{dish.dish_name}</h3>
            <p>价格: ¥{dish.price}</p>
            <button onClick={() => addToOrder(dish)}>添加到订单</button>
          </div>
        ))}
      </div>
      {order.length > 0 && (
        <div>
          <h2>我的订单</h2>
          <ul>
            {order.map((dish, index) => (
              <li key={index}>{dish.dish_name} - ¥{dish.price}</li>
            ))}
          </ul>
          <h3>总金额: ¥{calculateTotal()}</h3>
          <button onClick={placeOrder}>提交订单</button>
        </div>
      )}
    </div>
  );
}

export default CustomerPage;
