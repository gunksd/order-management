import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaUtensils, FaShoppingCart, FaHistory, FaChartBar, FaTrash } from 'react-icons/fa';
import { IoMdPricetag } from 'react-icons/io';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
  },
  header: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  section: {
    marginBottom: '20px',
  },
  subHeader: {
    fontSize: '22px',
    color: '#34495e',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  },
  icon: {
    marginRight: '10px',
  },
  dishCard: {
    backgroundColor: '#fff',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    },
  },
  priceTag: {
    display: 'flex',
    alignItems: 'center',
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  quantityControl: {
    backgroundColor: '#ecf0f1',
    borderRadius: '5px',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px',
    width: '120px',
  },
  quantityButton: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    width: '30px',
    height: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '18px',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#2980b9',
    },
  },
  quantityInput: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '40px',
    textAlign: 'center',
    fontSize: '16px',
    marginLeft: '10px',
    marginRight: '10px',
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
    margin: '5px',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
  },
  cancelButton: {
    backgroundColor: '#c0392b',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    marginLeft: '10px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #ecf0f1',
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: '15px',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #ecf0f1',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#c0392b',
    },
  },
  recommendedSection: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  recommendedHeader: {
    fontSize: '22px',
    color: '#2c3e50',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  recommendedDishCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    },
  },
  recommendedDishName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  recommendedPriceTag: {
    display: 'flex',
    alignItems: 'center',
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  recommendedButton: {
    backgroundColor: '#3498db',
    color: '#ffffff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#2980b9',
    },
  },
};

function CustomerPage() {
  const [dishes, setDishes] = useState([]);
  const [order, setOrder] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [orderSummary, setOrderSummary] = useState([]);
  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const navigate = useNavigate();

  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded);

      const isExpired = decoded.exp * 1000 < Date.now();
      console.log('Token过期时间:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('当前时间:', new Date(Date.now()).toLocaleString());
      console.log('Token是否过期:', isExpired);
      if (isExpired) {
        alert('Token 已过期');
        navigate('/login');
      } else {
        fetchDishes();
        fetchPreviousOrders(token);
        fetchOrderSummary(token);
      }
    } else {
      alert('请先登录');
      navigate('/login');
    }
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
        userId: userId,
      },
    })
    .then(response => {
      setOrderSummary(response.data);
    })
    .catch(error => {
      console.error('Error fetching order summary:', error);
    });
  };

  const updateDishQuantity = (dishId, quantity) => {
    const dish = dishes.find(d => d.dish_id === dishId);
    if (dish) {
      const newQuantity = Math.max(0, Math.min(quantity, dish.stock));
      setOrder(prevOrder => {
        const existingItem = prevOrder.find(item => item.dish_id === dishId);
        if (existingItem) {
          if (newQuantity === 0) {
            setRecommendedDishes([]); // 清除推荐菜品
            return prevOrder.filter(item => item.dish_id !== dishId);
          }
          return prevOrder.map(item =>
            item.dish_id === dishId ? { ...item, quantity: newQuantity } : item
          );
        } else if (newQuantity > 0) {
          return [...prevOrder, { dish_id: dishId, dish_name: dish.dish_name, price: dish.price, quantity: newQuantity, maxQuantity: dish.stock }];
        }
        return prevOrder;
      });
      if (quantity > 0) {
        updateRecommendedDishes(dish);
      }
    }
  };

  const addToOrder = (dish) => {
    const existingOrder = order.find(item => item.dish_id === dish.dish_id);
    if (existingOrder) {
      if (existingOrder.quantity < dish.stock) {
        updateDishQuantity(dish.dish_id, existingOrder.quantity + 1);
      }
    } else {
      setOrder(prevOrder => [...prevOrder, { dish_id: dish.dish_id, dish_name: dish.dish_name, price: dish.price, quantity: 1, maxQuantity: dish.stock }]);
    }
    if (order.length > 0) { // 只有当订单中有菜品时才更新推荐
      updateRecommendedDishes(dish);
    }
  };

  const removeFromOrder = (dishId) => {
    setOrder(prevOrder => {
      const newOrder = prevOrder.filter(item => item.dish_id !== dishId);
      if (newOrder.length === 0) {
        setRecommendedDishes([]); // 如果订单为空，清除所有推荐
      }
      return newOrder;
    });
  };

  const calculateTotal = () => {
    return order.reduce((total, dish) => total + dish.price * dish.quantity, 0).toFixed(2);
  };

  const placeOrder = () => {
    const token = localStorage.getItem('token');

    if (!userId) {
      alert('用户 ID 不存在，请重新登录');
      navigate('/login');
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
        order.forEach(dish => {
          axios.put(`http://localhost:5000/api/dishes/${dish.dish_id}/sales`, {
            quantity: dish.quantity,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).catch(error => {
            console.error('Error updating sales:', error);
          });
        });

        navigate(`/payment/${orderId}`);
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
    if (window.confirm('确定要删除这个订单吗？')) {
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
    }
  };

  const updateRecommendedDishes = (addedDish) => {
    // 推荐价格相近（±10%）的其他菜品
    const priceLowerBound = addedDish.price * 0.9;
    const priceUpperBound = addedDish.price * 1.1;
    
    const recommended = dishes.filter(dish => 
      dish.dish_id !== addedDish.dish_id &&
      dish.price >= priceLowerBound &&
      dish.price <= priceUpperBound
    ).slice(0, 3);  // 最多推荐3个菜品

    console.log('Recommended dishes:', recommended); // 添加日志
    setRecommendedDishes(recommended);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>欢迎使用点菜系统，{username || '顾客'}</h1>

        <div style={styles.section}>
          <h2 style={styles.subHeader}>
            <FaUtensils style={styles.icon} />
            菜品列表
          </h2>
          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} style={styles.button}>
            {sortOrder === 'asc' ? '按价格降序排序' : '按价格升序排序'}
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {dishes.map(dish => (
              <div key={dish.dish_id} style={styles.dishCard}>
                <h3>{dish.dish_name}</h3>
                <p style={styles.priceTag}>
                  <IoMdPricetag style={styles.icon} />
                  价格: ¥{dish.price}
                </p>
                <p>库存: {dish.stock}</p>
                <div style={styles.quantityControl}>
                  <button
                    style={styles.quantityButton}
                    onClick={() => updateDishQuantity(dish.dish_id, (order.find(item => item.dish_id === dish.dish_id)?.quantity || 0) - 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={order.find(item => item.dish_id === dish.dish_id)?.quantity || 0}
                    readOnly
                    style={styles.quantityInput}
                  />
                  <button
                    style={styles.quantityButton}
                    onClick={() => updateDishQuantity(dish.dish_id, (order.find(item => item.dish_id === dish.dish_id)?.quantity || 0) + 1)}
                    disabled={dish.stock === 0}
                  >
                    +
                  </button>
                </div>
                <button onClick={() => addToOrder(dish)} style={styles.button}>添加到订单</button>
                <button onClick={() => removeFromOrder(dish.dish_id)} style={styles.cancelButton}>取消添加</button>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.recommendedSection}>
          <h2 style={styles.recommendedHeader}>
            <FaUtensils style={styles.icon} />
            推荐菜品
          </h2>
          {recommendedDishes.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {recommendedDishes.map(dish => (
                <div key={dish.dish_id} style={styles.recommendedDishCard}>
                  <h3 style={styles.recommendedDishName}>{dish.dish_name}</h3>
                  <p style={styles.recommendedPriceTag}>
                    <IoMdPricetag style={styles.icon} />
                    价格: ¥{dish.price}
                  </p>
                  <p>库存: {dish.stock}</p>
                  <button onClick={() => addToOrder(dish)} style={styles.recommendedButton}>添加到订单</button>
                </div>
              ))}
            </div>
          ) : (
            <p>暂无推荐菜品</p>
          )}
        </div>

        {order.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.subHeader}>
              <FaShoppingCart style={styles.icon} />
              我的订单
            </h2>
            <ul>
              {order.map((dish, index) => (
                <li key={index} style={styles.orderItem}>
                  <span>{dish.dish_name}</span>
                  <span>¥{dish.price} x {dish.quantity}</span>
                </li>
              ))}
            </ul>
            <h3 style={styles.totalAmount}>总金额: ¥{calculateTotal()}</h3>
            <button onClick={placeOrder} style={styles.button}>提交订单</button>
          </div>
        )}


        <div style={styles.section}>
          <h2 style={styles.subHeader}>
            <FaHistory style={styles.icon} />
            历史订单
          </h2>
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
                  .replace(/\.\d+/, '')
                  .replace(/-/g, '年')
                  .replace(/(\d{4}年\d{2})/, '$1月')
                  .replace(/(\d{2}) (\d{2}):(\d{2}):(\d{2})/, '$1日 $2时$3分$4秒');
                return (
                  <li key={order.order_id} style={styles.historyItem}>
                    <span>
                      订单号: {order.order_id}, 金额: ¥{order.total_amount}, 创建时间: {formattedTime}
                    </span>
                    <button onClick={() => deleteOrder(order.order_id)} style={styles.deleteButton}>
                      <FaTrash />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.subHeader}>
            <FaChartBar style={styles.icon} />
            订单统计信息
          </h2>
          {orderSummary.length === 0 ? (
            <div>暂无订单统计信息</div>
          ) : (
            <ul>
              {orderSummary.map((summary, index) => (
                <li key={index} style={styles.historyItem}>
                  用户 ID: {summary.username}, 订单数: {summary.order_count}, 总消费: ¥{summary.total_spent.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerPage;

