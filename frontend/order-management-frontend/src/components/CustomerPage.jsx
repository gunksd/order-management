import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaUtensils, FaShoppingCart, FaHistory, FaChartBar, FaTrash, FaSort, FaMoneyBillWave, FaCheck } from 'react-icons/fa';
import { IoMdPricetag } from 'react-icons/io';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { motion, AnimatePresence } from 'framer-motion';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#1a1a2e',
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    isolation: 'isolate',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    position: 'relative',
    zIndex: 1,
    backdropFilter: 'blur(10px)',
    pointerEvents: 'auto',
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
    fontSize: '14px',
    width: '120px',
  },
  cancelButton: {
    backgroundColor: '#c0392b',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    marginLeft: '10px',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    width: '120px',
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
  },
  recommendedSection: {
    marginTop: '20px',
    marginBottom: '20px',
    padding: '10px',
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
    padding: '10px',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  recommendedDishName: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  recommendedPriceTag: {
    display: 'flex',
    alignItems: 'center',
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '14px',
  },
  recommendedButton: {
    backgroundColor: '#3498db',
    color: '#ffffff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    position: 'absolute',
    top: '20px',
    right: '20px',
  },
  sortButton: {
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    marginBottom: '20px',
  },
  sortIcon: {
    marginLeft: '10px',
    color: '#ffffff',
  },
  checkbox: {
    appearance: 'none',
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '2px solid #3498db',
    outline: 'none',
    cursor: 'pointer',
    marginRight: '10px',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  checkedCheckbox: {
    backgroundColor: '#2ecc71',
    border: '2px solid #2ecc71',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(45deg)',
      width: '5px',
      height: '10px',
      border: 'solid white',
      borderWidth: '0 2px 2px 0',
    },
  },
  batchPayButton: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '10px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  batchDeleteButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '10px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  pendingPaymentButton: {
    backgroundColor: '#f39c12',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '10px',
  },
  paidLabel: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '5px',
    marginRight: '10px',
  },
};

function CustomerPage({ onLogout }) {
  const [dishes, setDishes] = useState([]);
  const [order, setOrder] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [orderSummary, setOrderSummary] = useState([]);
  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const navigate = useNavigate();

  const updateRecommendedDishes = useCallback((addedDish) => {
    console.log(`Updating recommended dishes based on: ${JSON.stringify(addedDish)}`);
    if (order.length === 0) {
      const priceLowerBound = addedDish.price * 0.9;
      const priceUpperBound = addedDish.price * 1.1;
      
      const recommended = dishes
        .filter(dish => 
          dish.dish_id !== addedDish.dish_id &&
          dish.price >= priceLowerBound &&
          dish.price <= priceUpperBound &&
          !order.some(orderItem => orderItem.dish_id === dish.dish_id)
        )
        .slice(0, 3);

      console.log('Recommended dishes:', recommended);
      setRecommendedDishes(recommended);
    }
  }, [dishes, order]);

  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    console.log('Current order:', order);
  }, [order]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);

      const isExpired = decoded.exp * 1000 < Date.now();
      console.log('Token过期时间:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('当前时间:', new Date(Date.now()).toLocaleString());
      console.log('Token是否过期:', isExpired);
      if (isExpired) {
        alert('Token 已过期，请重新登录');
        navigate('/login');
      } else {
        fetchDishes();
        fetchPreviousOrders(token);
        fetchOrderSummary(token);
      }
    } else {
      fetchDishes();
      setError('请先登录以查看完整功能');
    }
  }, [navigate]);

  useEffect(() => {
    if (dishes.length > 0) {
      const sortedDishes = [...dishes].sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      });
      setDishes(sortedDishes);
    }
  }, [sortOrder, dishes]);

  const fetchDishes = () => {
    console.log('Fetching dishes...');
    axios.get('http://localhost:5000/api/dishes')
      .then(response => {
        console.log('Fetched dishes:', response.data);
        setDishes(response.data);
      })
      .catch(error => {
        console.error('Error fetching dishes:', error);
        setError('无法加载菜品，请稍后重试');
      });
  };

  const fetchPreviousOrders = (token) => {
    console.log('Fetching previous orders...');
    setLoadingOrders(true);
    axios.get(`http://localhost:5000/api/orders?user_id=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      console.log('Fetched previous orders:', response.data);
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
    console.log('Fetching order summary...');
    axios.get(`http://localhost:5000/api/orders/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId: userId,
      },
    })
    .then(response => {
      console.log('Fetched order summary:', response.data);
      setOrderSummary(response.data);
    })
    .catch(error => {
      console.error('Error fetching order summary:', error);
    });
  };

  const updateDishQuantity = (dishId, quantity) => {
    console.log(`Updating dish quantity: dishId=${dishId}, quantity=${quantity}`);
    const dish = dishes.find(d => d.dish_id === dishId);
    if (dish) {
      const newQuantity = Math.max(0, Math.min(quantity, dish.stock));
      setOrder(prevOrder => {
        const existingItem = prevOrder.find(item => item.dish_id === dishId);
        if (existingItem) {
          if (newQuantity === 0) {
            console.log(`Removing dish ${dishId} from order`);
            const newOrder = prevOrder.filter(item => item.dish_id !== dishId);
            if (newOrder.length === 0) {
              setRecommendedDishes([]);
            }
            return newOrder;
          }
          console.log(`Updating quantity for dish ${dishId} to ${newQuantity}`);
          return prevOrder.map(item =>
            item.dish_id === dishId ? { ...item, quantity: newQuantity } : item
          );
        } else if (newQuantity > 0) {
          console.log(`Adding new dish ${dishId} to order with quantity ${newQuantity}`);
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
    console.log(`Adding dish to order: ${JSON.stringify(dish)}`);
    setOrder(prevOrder => {
      const existingOrder = prevOrder.find(item => item.dish_id === dish.dish_id);
      if (existingOrder) {
        if (existingOrder.quantity < dish.stock) {
          console.log(`Increasing quantity for dish ${dish.dish_id}`);
          return prevOrder.map(item =>
            item.dish_id === dish.dish_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        console.log(`Dish ${dish.dish_id} already at max quantity`);
        return prevOrder;
      } else {
        console.log(`Adding new dish ${dish.dish_id} to order`);
        const newOrder = [...prevOrder, { dish_id: dish.dish_id, dish_name: dish.dish_name, price: dish.price, quantity: 1, maxQuantity: dish.stock }];
        if (newOrder.length === 1) {
          updateRecommendedDishes(dish);
        }
        return newOrder;
      }
    });
  };

  const removeFromOrder = (dishId) => {
    console.log(`Removing dish from order: ${dishId}`);
    setOrder(prevOrder => {
      const newOrder = prevOrder.filter(item => item.dish_id !== dishId);
      if (newOrder.length === 0) {
        setRecommendedDishes([]);
      }
      return newOrder;
    });
  };

  const calculateTotal = () => {
    return order.reduce((total, dish) => total + dish.price * dish.quantity, 0).toFixed(2);
  };

  const placeOrder = () => {
    console.log('Placing order...');
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

        console.log(`Order placed successfully. Navigating to payment page for order ${orderId}`);
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
      console.log(`Deleting order: ${orderId}`);
      const token = localStorage.getItem('token');
      axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        console.log(`Order ${orderId} deleted successfully`);
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

  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prevSelected => 
      prevSelected.includes(orderId)
        ? prevSelected.filter(id => id !== orderId)
        : [...prevSelected, orderId]
    );
  };

  const handleBatchDelete = () => {
    if (window.confirm(`确定要删除选中的 ${selectedOrders.length} 个订单吗？`)) {
      const token = localStorage.getItem('token');
      const deletePromises = selectedOrders.map(orderId =>
        axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      Promise.all(deletePromises)
        .then(() => {
          const updatedOrders = previousOrders.filter(order => !selectedOrders.includes(order.order_id));
          setPreviousOrders(updatedOrders);
          setSelectedOrders([]);
          if (updatedOrders.length === 0) {
            setError('历史订单为空');
          } else {
            setError(null);
          }
          alert('选中的订单已全部删除');
        })
        .catch(error => {
          console.error('Error deleting orders:', error);
          alert('删除订单失败，请稍后重试。');
        });
    }
  };

  const handleBatchPayment = () => {
    const pendingOrders = selectedOrders.filter(orderId => 
      previousOrders.find(order => order.order_id === orderId && order.status === 'pending')
    );

    if (pendingOrders.length === 0) {
      alert('没有选中待支付的订单');
      return;
    }

    const totalAmount = pendingOrders.reduce((total, orderId) => {
      const order = previousOrders.find(o => o.order_id === orderId);
      return total + parseFloat(order.total_amount);
    }, 0);

    navigate(`/payment/batch`, { state: { orderIds: pendingOrders, totalAmount } });
  };

  const handleSinglePayment = (orderId) => {
    navigate(`/payment/${orderId}`);
  };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesOptions = {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: "#ffffff"
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.5,
        random: true,
      },
      size: {
        value: 3,
        random: true,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse"
        },
        onclick: {
          enable: true,
          mode: "push"
        }
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4
        },
        push: {
          particles_nb: 4
        }
      }
    },
    retina_detect: true
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      style={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1}} />
      <motion.div style={styles.card} variants={itemVariants}>
        <motion.h1 style={styles.header} variants={itemVariants}>欢迎使用点菜系统，{username || '顾客'}</motion.h1>
        <motion.button
          onClick={onLogout}
          style={styles.logoutButton}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          登出
        </motion.button>

        <motion.div style={styles.section} variants={itemVariants}>
          <h2 style={styles.subHeader}>
            <FaUtensils style={styles.icon} />
            菜品列表
          </h2>
          <motion.button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={styles.sortButton}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {sortOrder === 'asc' ? '按价格升序排序' : '按价格降序排序'}
            <FaSort style={styles.sortIcon} />
          </motion.button>
          <motion.div 
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}
            variants={itemVariants}
          >
            <AnimatePresence>
              {dishes.map(dish => (
                <motion.div
                  key={dish.dish_id}
                  style={styles.dishCard}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                >
                  <h3>{dish.dish_name}</h3>
                  <p style={styles.priceTag}>
                    <IoMdPricetag style={styles.icon} />
                    价格: ¥{dish.price}
                  </p>
                  <p>库存: {dish.stock}</p>
                  <div style={styles.quantityControl}>
                    <motion.button
                      type="button"
                      style={styles.quantityButton}
                      onClick={() => updateDishQuantity(dish.dish_id, (order.find(item => item.dish_id === dish.dish_id)?.quantity || 0) - 1)}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      -
                    </motion.button>
                    <input
                      type="number"
                      value={order.find(item => item.dish_id === dish.dish_id)?.quantity || 0}
                      readOnly
                      style={styles.quantityInput}
                    />
                    <motion.button
                      type="button"
                      style={styles.quantityButton}
                      onClick={() => updateDishQuantity(dish.dish_id, (order.find(item => item.dish_id === dish.dish_id)?.quantity || 0) + 1)}
                      disabled={dish.stock === 0}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      +
                    </motion.button>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => addToOrder(dish)}
                    style={styles.button}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    添加到订单
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => removeFromOrder(dish.dish_id)}
                    style={styles.cancelButton}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    取消添加
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div style={styles.recommendedSection} variants={itemVariants}>
          <h2 style={styles.recommendedHeader}>
            <FaUtensils style={styles.icon} />
            推荐菜品
          </h2>
          {recommendedDishes.length > 0 ? (
            <motion.div 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}
              variants={itemVariants}
            >
              <AnimatePresence>
                {recommendedDishes.map(dish => (
                  <motion.div
                    key={dish.dish_id}
                    style={styles.recommendedDishCard}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    layout
                  >
                    <div>
                      <h3 style={styles.recommendedDishName}>{dish.dish_name}</h3>
                      <p style={styles.recommendedPriceTag}>
                        <IoMdPricetag style={{...styles.icon, marginRight: '5px'}} />
                        ¥{dish.price}
                      </p>
                      <p style={{fontSize: '12px', marginBottom: '5px'}}>库存: {dish.stock}</p>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => addToOrder(dish)}
                      style={{...styles.recommendedButton, fontSize: '12px', padding: '5px 10px'}}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      添加到订单
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <p>暂无推荐菜品</p>
          )}
        </motion.div>

        <AnimatePresence>
          {order.length > 0 && (
            <motion.div
              style={styles.section}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h2 style={styles.subHeader}>
                <FaShoppingCart style={styles.icon} />
                我的订单
              </h2>
              <ul>
                <AnimatePresence>
                  {order.map((dish, index) => (
                    <motion.li
                      key={index}
                      style={styles.orderItem}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      layout
                    >
                      <span>{dish.dish_name}</span>
                      <span>¥{dish.price} x {dish.quantity}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <motion.h3 style={styles.totalAmount} variants={itemVariants}>
                总金额: ¥{calculateTotal()}
              </motion.h3>
              <motion.button
                type="button"
                onClick={placeOrder}
                style={styles.button}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                提交订单
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div style={styles.section} variants={itemVariants}>
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
            <>
              <div>
                {selectedOrders.length > 0 && (
                  <>
                    <motion.button
                      type="button"
                      onClick={handleBatchPayment}
                      style={styles.batchPayButton}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      批量支付
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleBatchDelete}
                      style={styles.batchDeleteButton}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      批量删除 ({selectedOrders.length})
                    </motion.button>
                  </>
                )}
              </div>
              <ul>
                <AnimatePresence>
                  {previousOrders.map((order) => {
                    const formattedTime = order.created_at
                      .replace('T', ' ')
                      .replace('Z', '')
                      .replace(/\.\d+/, '')
                      .replace(/-/g, '年')
                      .replace(/(\d{4}年\d{2})/, '$1月')
                      .replace(/(\d{2}) (\d{2}):(\d{2}):(\d{2})/, '$1日 $2时$3分$4秒');
                  return (
                    <motion.li
                      key={order.order_id}
                      style={styles.historyItem}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      layout
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.order_id)}
                          onChange={() => handleOrderSelect(order.order_id)}
                          style={{
                            ...styles.checkbox,
                            ...(selectedOrders.includes(order.order_id) ? styles.checkedCheckbox : {}),
                          }}
                        />
                        订单号: {order.order_id}, 金额: ¥{order.total_amount}, 创建时间: {formattedTime}
                      </span>
                      <div>
                        {order.status === 'pending' ? (
                          <motion.button
                            type="button"
                            onClick={() => handleSinglePayment(order.order_id)}
                            style={styles.pendingPaymentButton}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <FaMoneyBillWave style={{ marginRight: '5px' }} />
                            待支付
                          </motion.button>
                        ) : (
                          <span style={styles.paidLabel}>已支付</span>
                        )}
                        <motion.button
                          type="button"
                          onClick={() => deleteOrder(order.order_id)}
                          style={styles.deleteButton}
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </>
        )}
      </motion.div>

        <motion.div style={styles.section} variants={itemVariants}>
          <h2 style={styles.subHeader}>
            <FaChartBar style={styles.icon} />
            订单统计信息
          </h2>
          {orderSummary.length === 0 ? (
            <div>暂无订单统计信息</div>
          ) : (
            <ul>
              <AnimatePresence>
                {orderSummary.map((summary, index) => (
                  <motion.li
                    key={index}
                    style={styles.historyItem}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    layout
                  >
                    用户 ID: {summary.username}, 订单数: {summary.order_count}, 总消费: ¥{summary.total_spent.toFixed(2)}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default CustomerPage;

