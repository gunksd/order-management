import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Lottie from 'lottie-react';
import successAnimation from '../assets/dish-added-success.json';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import EditDishModal from './ EditDishModal';

function AdminPage({ onLogout }) {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderError, setOrderError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderSummary, setOrderSummary] = useState([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState('dishes');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  const audioRef = useRef(new Audio('/sounds/payment-success.mp3'));

  const navigate = useNavigate();
  const ordersPerPage = 5;

  useEffect(() => {
    fetchDishes();
    fetchOrders();
    ensureOrderSummaryView();
    fetchOrderSummary();
  }, []);

  const fetchDishes = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/dishes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDishes(response.data);
      setFilteredDishes(response.data);
      setError(null);
    } catch (error) {
      handleAuthError(error, '无法获取菜品列表，请稍后重试。');
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
      setOrderError(null);
    } catch (error) {
      handleAuthError(error, '无法获取订单列表，请稍后重试。');
    }
  };

  const ensureOrderSummaryView = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/views/create', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('创建 UserOrderSummary 视图时出错:', error);
      handleAuthError(error, '无法创建视图，请稍后重试。');
    }
  };

  const fetchOrderSummary = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/orders/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderSummary(response.data);
    } catch (error) {
      handleAuthError(error, '无法获取订单统计信息，请稍后重试。');
    }
  };

  const handleAuthError = (error, fallbackMessage) => {
    if (error.response && error.response.status === 401) {
      setError('未授权访问，请重新登录。');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      setError(fallbackMessage);
    }
  };

  const handleConfirmPayment = async (orderId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/confirm-payment`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        alert('支付状态更新成功');
        fetchOrders();
      } else {
        alert('支付状态更新失败，请稍后重试。');
      }
    } catch (error) {
      console.error('确认支付时出错:', error);
      setOrderError('支付确认失败，请稍后重试。');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('确定要取消这个订单吗？')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('订单取消成功');
        fetchOrders();
      } catch (error) {
        console.error('取消订单时出错:', error);
        setOrderError('取消订单失败，请稍后重试。');
      }
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === '') {
      setFilteredDishes(dishes);
    } else {
      const filtered = dishes.filter((dish) =>
        dish.dish_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDishes(filtered);
    }
  };

  const handleAddDish = () => {
    setEditingDish(null);
    setIsEditModalOpen(true);
  };

  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setIsEditModalOpen(true);
  };

  const handleDeleteDish = async (dishId) => {
    if (window.confirm('确定要删除这个菜品吗？')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/dishes/${dishId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('菜品删除成功');
        fetchDishes();
      } catch (error) {
        console.error('删除菜品时出错:', error);
        handleAuthError(error, '删除菜品失败，请稍后重试。');
      }
    }
  };

  const handleSaveDish = async (dish) => {
    const token = localStorage.getItem('token');
    try {
      if (dish.dish_id) {
        await axios.put(
          `http://localhost:5000/api/dishes/${dish.dish_id}`,
          dish,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/dishes',
          dish,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowSuccessAnimation(true);
      audioRef.current.play();
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
      fetchDishes();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('保存菜品时出错:', error);
      handleAuthError(error, '保存菜品失败，请检查输入信息。');
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const currentOrders = orders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

  return (
    <div style={styles.container}>
      {showSuccessAnimation && (
        <div style={styles.successAnimationOverlay}>
          <Lottie
            animationData={successAnimation}
            loop={false}
            style={styles.successAnimation}
          />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          style={styles.logoutButton}
        >
          登出
        </motion.button>
        <h2 style={styles.header}>管理员控制台</h2>
        <div style={styles.tabContainer}>
          <button
            style={activeTab === 'dishes' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('dishes')}
          >
            菜品管理
          </button>
          <button
            style={activeTab === 'orders' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('orders')}
          >
            订单管理
          </button>
          <button
            style={activeTab === 'summary' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('summary')}
          >
            统计信息
          </button>
        </div>

        <AnimatePresence mode='wait'>
          {activeTab === 'dishes' && (
            <motion.div
              key="dishes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.searchContainer}>
                <FaSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="搜索菜品..."
                  value={searchTerm}
                  onChange={handleSearch}
                  style={styles.searchInput}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddDish}
                style={styles.addButton}
              >
                <FaPlus /> 添加新菜品
              </motion.button>

              {error && <div style={styles.error}>{error}</div>}

              <div>
                <h3 style={styles.subHeader}>当前菜品列表</h3>
                <ul style={styles.dishList}>
                  {filteredDishes.map((dish) => (
                    <motion.li
                      key={dish.dish_id}
                      style={styles.dishItem}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={styles.dishInfo}>
                        <span style={styles.dishName}>{dish.dish_name}</span>
                        <span style={styles.dishPrice}>¥{dish.price}</span>
                        <span style={styles.dishStock}>库存：{dish.stock}</span>
                        <span style={styles.dishSales}>销量：{dish.sales || 0}</span>
                      </div>
                      <div style={styles.dishActions}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditDish(dish)}
                          style={styles.editButton}
                        >
                          <FaEdit /> 编辑
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteDish(dish.dish_id)}
                          style={styles.deleteButton}
                        >
                          <FaTrash /> 删除
                        </motion.button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={styles.subHeader}>历史订单列表</h3>
              {orderError && <div style={styles.error}>{orderError}</div>}
              <ul style={styles.orderList}>
                {currentOrders.map((order) => (
                  <motion.li
                    key={order.order_id}
                    style={styles.orderItem}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={styles.orderInfo}>
                      <span style={styles.orderId}>订单编号: {order.order_id}</span>
                      <span style={styles.orderAmount}>总金额: ¥{order.total_amount}</span>
                      <span style={styles.orderStatus}>状态: {order.status}</span>
                    </div>
                    <div style={styles.orderActions}>
                      {order.status === 'pending' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleConfirmPayment(order.order_id)}
                            style={styles.confirmButton}
                          >
                            <FaCheckCircle /> 确认支付
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCancelOrder(order.order_id)}
                            style={styles.cancelButton}
                          >
                            <FaTimesCircle /> 取消订单
                          </motion.button>
                        </>
                      )}
                      {order.status === 'paid' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCancelOrder(order.order_id)}
                          style={styles.cancelButton}
                        >
                          <FaTimesCircle /> 取消订单
                        </motion.button>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
              <div style={styles.pagination}>
                {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }, (_, index) => (
                  <motion.button
                    key={index + 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentPage(index + 1)}
                    style={
                      currentPage === index + 1
                        ? { ...styles.pageButton, ...styles.activePageButton }
                        : styles.pageButton
                    }
                  >
                    {index + 1}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 style={styles.subHeader}>订单统计信息</h3>
              {orderSummary.length === 0 ? (
                <div style={styles.noSummary}>暂无订单统计信息</div>
              ) : (
                <div style={styles.summaryListContainer}>
                  {orderSummary.map((summary, index) => (
                    <motion.div
                      key={index}
                      style={styles.summaryListItem}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div style={styles.summaryListContent}>
                        <span style={styles.summaryListText}><strong>用户名:</strong> {summary.username}</span>
                        <span style={styles.summaryListText}><strong>订单数:</strong> {summary.order_count}</span>
                        <span style={styles.summaryListText}><strong>总消费:</strong> ¥{summary.total_spent.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <EditDishModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveDish}
        dish={editingDish}
      />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
  },
  header: {
    marginBottom: '20px',
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 20px',
    margin: '0 5px',
    backgroundColor: '#e6f7ff',
    color: '#1890ff',
    border: '1px solid #91d5ff',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  activeTab: {
    padding: '10px 20px',
    margin: '0 5px',
    backgroundColor: '#1890ff',
    color: '#fff',
    border: '1px solid #1890ff',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '20px',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#8c8c8c',
  },
  searchInput: {
    width: '100%',
    padding: '10px 10px 10px 35px',
    borderRadius: '20px',
    border: '1px solid #d9d9d9',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  },
  subHeader: {
    marginBottom: '15px',
    color: '#1a1a1a',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#1890ff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    marginBottom: '20px',
  },
  error: {
    color: '#ff4d4f',
    marginBottom: '20px',
  },
  dishList: {
    listStyleType: 'none',
    padding: '0',
  },
  dishItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'all 0.3s ease',
  },
  dishInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  dishName: {
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  dishPrice: {
    color: '#1890ff',
  },
  dishStock: {
    color: '#000000',
  },
  dishSales: {
    color: '#000000',
  },
  dishActions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    backgroundColor: '#1890ff',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  deleteButton: {
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  orderList: {
    listStyleType: 'none',
    padding: '0',
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'all 0.3s ease',
  },
  orderInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '5px',
  },
  orderId: {
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  orderAmount: {
    color: '#1890ff',
  },
  orderStatus: {
    color: '#52c41a',
  },
  orderActions: {
    display: 'flex',
    gap: '10px',
  },
  confirmButton: {
    backgroundColor: '#52c41a',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  cancelButton: {
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  pagination: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  pageButton: {
    backgroundColor: '#fff',
    color: '#1890ff',
    border: '1px solid #1890ff',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  activePageButton: {
    backgroundColor: '#1890ff',
    color: '#fff',
  },
  summaryListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px',
  },
  summaryListItem: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  summaryListContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryListText: {
    fontSize: '16px',
    color: '#1a1a1a',
  },
  noSummary: {
    fontSize: '16px',
    color: '#8c8c8c',
    textAlign: 'center',
    padding: '20px',
  },
  successAnimationOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successAnimation: {
    width: '300px',
    height: '300px',
  },
  logoutButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
  },
};

export default AdminPage;

