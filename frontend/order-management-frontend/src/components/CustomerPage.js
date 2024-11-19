import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CustomerPage() {
  const [dishes, setDishes] = useState([]);
  const [order, setOrder] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录');
      window.location.href = '/login';
      return;
    }
    fetchDishes();
    fetchPreviousOrders(token);
  }, []);

  const fetchDishes = () => {
    axios.get('http://localhost:5000/api/dishes')
      .then(response => {
        setDishes(response.data);
      })
      .catch(error => {
        console.error('Error fetching dishes:', error);
      });
  };

  const fetchPreviousOrders = (token) => {
    setLoadingOrders(true);
    axios.get('http://localhost:5000/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      if (response.data.length === 0) {
        setPreviousOrders([]);
      } else {
        setPreviousOrders(response.data);
      }
      setError(null);
    })
    .catch(error => {
      console.error('Error fetching previous orders:', error);
      setError('无历史订单，请稍后重试。');
    })
    .finally(() => {
      setLoadingOrders(false);
    });
  };

  const addToOrder = (dish) => {
    setOrder([...order, { dish_id: dish.dish_id, dish_name: dish.dish_name, price: dish.price, quantity: 1 }]);
  };

  const calculateTotal = () => {
    return order.reduce((total, dish) => total + dish.price * dish.quantity, 0).toFixed(2);
  };

  const placeOrder = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!userId) {
      alert('用户 ID 不存在，请重新登录');
      window.location.href = '/login';
      return;
    }

    const orderItems = order.map(dish => ({
      dish_id: dish.dish_id,
      quantity: dish.quantity,
    }));

    axios.post('http://localhost:5000/api/orders', {
      user_id: parseInt(userId),
      order_items: orderItems,
      total_amount: calculateTotal(),
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => {
      alert('订单提交成功！');
      setOrder([]);
      fetchPreviousOrders(token);
    }).catch(error => {
      console.error('Error placing order:', error);
      alert('订单提交失败！');
    });
  };

  const deleteOrder = (orderId) => {
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      const updatedOrders = previousOrders.filter(order => order.order_id !== orderId);
      setPreviousOrders(updatedOrders);
      if (updatedOrders.length === 0) {
        setError('历史订单为空');
      } else {
        setError(null);
      }
      alert('订单已删除');
    })
    .catch(error => {
      console.error('Error deleting order:', error);
      alert('删除订单失败，请稍后重试。');
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>欢迎，顾客</h1>

        <div style={styles.section}>
          <h2 style={styles.subHeader}>菜品列表</h2>
          <div style={styles.dishes}>
            {dishes.map(dish => (
              <div key={dish.dish_id} style={styles.dishCard}>
                <h3>{dish.dish_name}</h3>
                <p>价格: ¥{dish.price}</p>
                <button onClick={() => addToOrder(dish)} style={styles.button}>添加到订单</button>
              </div>
            ))}
          </div>
        </div>

        {order.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.subHeader}>我的订单</h2>
            <ul>
              {order.map((dish, index) => (
                <li key={index}>
                  {dish.dish_name} - ¥{dish.price} x {dish.quantity}
                </li>
              ))}
            </ul>
            <h3>总金额: ¥{calculateTotal()}</h3>
            <button onClick={placeOrder} style={styles.button}>提交订单</button>
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.subHeader}>历史订单</h2>
          {loadingOrders ? (
            <div>加载历史订单中...</div>
          ) : error ? (
            <div style={{ color: 'red' }}>{error}</div>
          ) : previousOrders.length === 0 ? (
            <div>历史订单为空</div>
          ) : (
            <ul>
              {previousOrders.map((order) => (
                <li key={order.order_id}>
                  订单号: {order.order_id}, 金额: ¥{order.total_amount}, 创建时间: {order.created_at}
                  <button onClick={() => deleteOrder(order.order_id)} style={{ ...styles.button, marginLeft: '10px' }}>删除订单</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// 样式对象
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  subHeader: {
    marginTop: '20px',
    color: '#444',
  },
  section: {
    marginBottom: '20px',
  },
  dishes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  dishCard: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
};

document.addEventListener('mouseover', (event) => {
  if (event.target.tagName === 'BUTTON') {
    event.target.style.transform = 'scale(1.05)';
  }
});

document.addEventListener('mouseout', (event) => {
  if (event.target.tagName === 'BUTTON') {
    event.target.style.transform = 'scale(1)';
  }
});

export default CustomerPage;
