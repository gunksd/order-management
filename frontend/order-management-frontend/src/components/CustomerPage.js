import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CustomerPage() {
  const [dishes, setDishes] = useState([]);
  const [order, setOrder] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [orderSummary, setOrderSummary] = useState([]);
  const navigate = useNavigate(); // 使用 useNavigate 进行导航

  // 从 localStorage 中获取用户名
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录');
      navigate('/login'); // 使用 useNavigate 重定向到登录页面
      return;
    }
    fetchDishes();
    fetchPreviousOrders(token);
    fetchOrderSummary(token);
  }, [navigate, sortOrder]);

  const fetchDishes = () => {
    axios.get('http://localhost:5000/api/dishes')
      .then(response => {
        const sortedDishes = response.data.sort((a, b) => {
          return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
        });
        setDishes(sortedDishes);
      })
      .catch(error => {
        console.error('Error fetching dishes:', error);
      });
  };

  const fetchPreviousOrders = (token) => {
    setLoadingOrders(true);
    axios.get(`http://localhost:5000/api/orders?user_id=${userId}`, {
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

  const fetchOrderSummary = (token) => {
    axios.get(`http://localhost:5000/api/orders/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId: userId, // 确保这里传入了 `userId`
      },
    })
    .then(response => {
      console.log('Order Summary Response:', response.data);
      setOrderSummary(response.data);
    })
    .catch(error => {
      console.error('Error fetching order summary:', error);
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

    if (!userId) {
      alert('用户 ID 不存在，请重新登录');
      navigate('/login'); // 使用 useNavigate 重定向到登录页面
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
      const { orderId } = response.data;

      if (orderId) {
        // 跳转到支付页面
        navigate(`/payment/${orderId}`);
        
        // 新增：重新获取订单统计信息和历史订单
        fetchOrderSummary(token);
        fetchPreviousOrders(token);
      } else {
        alert('订单提交失败，请稍后重试。');
      }
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
        <h1 style={styles.header}>欢迎使用点菜系统，{username || '顾客'}</h1>

        <div style={styles.section}>
          <h2 style={styles.subHeader}>菜品列表</h2>
          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} style={{ ...styles.button, marginBottom: '10px' }}>
            {sortOrder === 'asc' ? '按价格降序排序' : '按价格升序排序'}
          </button>
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
              {previousOrders.map((order) => {
                const formattedTime = order.created_at
                  .replace('T', ' ')
                  .replace('Z', '')
                  .replace(/\.\d+/, '') // 移除毫秒部分
                  .replace(/-/g, '年')
                  .replace(/(\d{4}年\d{2})/, '$1月')
                  .replace(/(\d{2}) (\d{2}):(\d{2}):(\d{2})/, '$1日 $2时$3分$4秒');
                return (
                  <li key={order.order_id}>
                    订单号: {order.order_id}, 金额: ¥{order.total_amount}, 创建时间: {formattedTime}
                    <button onClick={() => deleteOrder(order.order_id)} style={{ ...styles.button, marginLeft: '10px' }}>删除订单</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.subHeader}>订单统计信息</h2>
          {orderSummary.length === 0 ? (
            <div>暂无订单统计信息</div>
          ) : (
            <ul>
              {orderSummary.map((summary, index) => (
                <li key={index}>
                  用户 ID: {summary.user_id}, 订单数: {summary.order_count}, 总消费: ¥{summary.total_spent}
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
