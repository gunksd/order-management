import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function AdminPage() {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editDishId, setEditDishId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderError, setOrderError] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const searchButtonRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [orderSummary, setOrderSummary] = useState([]); // 新增：订单统计信息

  useEffect(() => {
    fetchDishes();
    fetchOrders();
    ensureOrderSummaryView();  // 新增：确保订单概要视图被创建
    fetchOrderSummary(); 
  }, []);

  // 获取菜品列表
  const fetchDishes = async () => {
    const token = localStorage.getItem('token');
    console.log('Using token to fetch dishes:', token);
    try {
      const response = await axios.get('http://localhost:5000/api/dishes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDishes(response.data);
      setFilteredDishes(response.data);
      setError(null);
    } catch (error) {
      handleAuthError(error, '无法获取菜品列表，请稍后重试。');
    }
  };

  // 获取历史订单
  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    console.log('Using token to fetch orders:', token);
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
      setOrderError(null);
    } catch (error) {
      handleAuthError(error, '无法获取订单列表，请稍后重试。');
    }
  };
  // 确保用户订单概要视图存在
  const ensureOrderSummaryView = async () => {
    const token = localStorage.getItem('token');
    console.log('Ensuring UserOrderSummary view:', token);
    try {
      await axios.post('http://localhost:5000/api/views/create', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('UserOrderSummary view created or already exists');
    } catch (error) {
      console.error('Error ensuring UserOrderSummary view:', error);
      handleAuthError(error, '无法创建视图，请稍后重试。');
    }
  };

    // 获取订单统计信息
    const fetchOrderSummary = async () => {
      const token = localStorage.getItem('token');
      try {
        console.log('Fetching order summary...'); // 添加此行
        const response = await axios.get('http://localhost:5000/api/orders/summary', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Order summary response:', response.data); // 添加此行
        setOrderSummary(response.data);
      } catch (error) {
        console.error('Error fetching order summary:', error);
        handleAuthError(error, '无法获取订单统计信息，请稍后重试。');
      }
    };
    

  // 处理错误和未授权跳转
  const handleAuthError = (error, fallbackMessage) => {
    if (error.response) {
      console.error('Error response:', error.response);
      if (error.response.status === 401) {
        setError('未授权访问，请重新登录。');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(fallbackMessage);
      }
    } else if (error.request) {
      console.error('Error request (no response received):', error.request);
      setError('无法连接到服务器，请检查网络连接。');
    } else {
      console.error('Error setting up request:', error.message);
      setError(fallbackMessage);
    }
  };

  // 确认支付
const handleConfirmPayment = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到用户令牌，请重新登录。');
    }

    // 发起请求更新订单的支付状态为 "paid"
    const response = await axios.put(
      `http://localhost:5000/api/orders/confirm-payment`,
      { orderId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      alert('支付状态更新成功');
      fetchOrders(); // 更新订单列表，以显示最新状态
    } else {
      alert('支付状态更新失败，请稍后重试。');
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    setOrderError('支付确认失败，请稍后重试。');
  }
};

  // 取消订单
  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Using token to cancel order:', token);
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('订单取消成功');
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      setOrderError('取消订单失败，请稍后重试。');
    }
  };

  // 处理搜索框输入
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

  // 分页处理
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // 添加菜品
  const handleAddDish = async () => {
    if (!dishName || price <= 0 || stock <= 0) {
      setError('请输入有效的菜品信息。');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Using token to add dish:', token);
      await axios.post(
        'http://localhost:5000/api/dishes',
        {
          dish_name: dishName,
          price: parseFloat(price),
          stock: parseInt(stock),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDishName('');
      setPrice('');
      setStock('');
      setError(null);
      alert('菜品添加成功');
      fetchDishes();
    } catch (error) {
      console.error('Error adding dish:', error);
      handleAuthError(error, '添加菜品失败，请检查输入信息。');
    }
  };

  // 删除菜品
  const handleDeleteDish = async (dishId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Using token to delete dish:', token);
      await axios.delete(`http://localhost:5000/api/dishes/${dishId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('菜品删除成功');
      fetchDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
      handleAuthError(error, '删除菜品失败，请稍后重试。');
    }
  };

  // 编辑菜品
  const handleEditDish = (dish) => {
    setDishName(dish.dish_name);
    setPrice(dish.price);
    setStock(dish.stock);
    setEditMode(true);
    setEditDishId(dish.dish_id);
  };

  // 更新菜品
  const handleUpdateDish = async () => {
    if (!dishName || price <= 0 || stock <= 0) {
      setError('请输入有效的菜品信息。');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Using token to update dish:', token);
      await axios.put(
        `http://localhost:5000/api/dishes/${editDishId}`,
        {
          dish_name: dishName,
          price: parseFloat(price),
          stock: parseInt(stock),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDishName('');
      setPrice('');
      setStock('');
      setEditMode(false);
      setEditDishId(null);
      setError(null);
      alert('菜品更新成功');
      fetchDishes();
    } catch (error) {
      console.error('Error updating dish:', error);
      handleAuthError(error, '更新菜品失败，请检查输入信息。');
    }
  };
  const summaryCards = document.querySelectorAll('.summaryListItem');
  summaryCards.forEach(card => {
    card.addEventListener('mouseover', () => {
      card.style.transform = 'scale(1.02)';
    });
    card.addEventListener('mouseout', () => {
      card.style.transform = 'scale(1)';
    });
  });
  // 鼠标拖动放大镜按钮
  useEffect(() => {
    const searchButton = searchButtonRef.current;

    if (searchButton) {
      let offsetX, offsetY;
      const handleMouseDown = (e) => {
        offsetX = e.clientX - searchButton.getBoundingClientRect().left;
        offsetY = e.clientY - searchButton.getBoundingClientRect().top;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };
      const handleMouseMove = (e) => {
        searchButton.style.left = `${e.clientX - offsetX}px`;
        searchButton.style.top = `${e.clientY - offsetY}px`;
      };
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      searchButton.addEventListener('mousedown', handleMouseDown);

      return () => {
        searchButton.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, []);

  // 绑定 Enter 键以添加菜品
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (editMode) {
          handleUpdateDish();
        } else {
          handleAddDish();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dishName, price, stock, editMode]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>
          管理员页面
          <div ref={searchButtonRef} style={styles.searchIconContainer}>
            <button
              style={styles.searchButton}
              onClick={() => setSearchActive(!searchActive)}
            >
              🔍
            </button>
            {searchActive && (
              <input
                type="text"
                placeholder="搜索菜品名称..."
                value={searchTerm}
                onChange={handleSearch}
                style={styles.searchInput}
              />
            )}
          </div>
        </h2>


        <div style={styles.form}>
          <h3 style={styles.subHeader}>{editMode ? '编辑菜品' : '添加新菜品'}</h3>
          <input
            type="text"
            placeholder="菜品名称"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="价格"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="库存"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            style={styles.input}
          />
          {editMode ? (
            <button onClick={handleUpdateDish} style={styles.button}>
              更新菜品
            </button>
          ) : (
            <button onClick={handleAddDish} style={styles.button}>
              添加菜品
            </button>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div>
          <h3 style={styles.subHeader}>当前菜品列表</h3>
          <ul style={styles.dishList}>
            {filteredDishes.map((dish) => (
              <li key={dish.dish_id} style={styles.dishItem}>
                {dish.dish_name} - ¥{dish.price} - 库存：{dish.stock}
                <div>
                  <button
                    onClick={() => handleEditDish(dish)}
                    style={styles.editButton}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteDish(dish.dish_id)}
                    style={styles.deleteButton}
                  >
                    删除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h3 style={styles.subHeader}>订单统计信息</h3>
        {orderSummary.length === 0 ? (
          <div style={styles.noSummary}>暂无订单统计信息</div>
        ) : (
          <div style={styles.summaryListContainer}>
            {orderSummary.map((summary, index) => (
              <div key={index} style={styles.summaryListItem} className="summaryListItem">
                <div style={styles.summaryListContent}>
                  <span style={styles.summaryListText}><strong>用户名:</strong> {summary.username}</span>
                  <span style={styles.summaryListText}><strong>订单数:</strong> {summary.order_count}</span>
                  <span style={styles.summaryListText}><strong>总消费:</strong> ¥{summary.total_spent.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
                <div>
          <h3 style={styles.subHeader}>历史订单列表</h3>
          {orderError && <div style={styles.error}>{orderError}</div>}
          <ul style={styles.orderList}>
            {currentOrders.map((order) => (
              <li key={order.order_id} style={styles.orderItem}>
                <div>
                  订单编号: {order.order_id} - 总金额: ¥{order.total_amount} - 状态: {order.status}
                </div>
                <div>
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConfirmPayment(order.order_id)}
                        style={styles.confirmButton}
                      >
                        确认支付
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.order_id)}
                        style={styles.cancelButton}
                      >
                        取消订单
                      </button>
                    </>
                  )}
                  {order.status === 'paid' && (
                    <button
                      onClick={() => handleCancelOrder(order.order_id)}
                      style={styles.cancelButton}
                    >
                      取消订单
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div style={styles.pagination}>
            {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                style={
                  currentPage === index + 1
                    ? { ...styles.pageButton, ...styles.activePageButton }
                    : styles.pageButton
                }
              >
                {index + 1}
              </button>
            ))}
          </div>
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
    backgroundColor: '#f0f0f0',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
  },
  header: {
    marginBottom: '20px',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchIconContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    cursor: 'move',
  },
  searchButton: {
    backgroundColor: 'white',
    color: '#333',
    border: 'none',
    borderRadius: '50%',
    padding: '15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontSize: '16px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  searchInput: {
    marginLeft: '10px',
    padding: '10px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '200px',
    transition: 'width 0.3s ease',
  },
  subHeader: {
    marginBottom: '15px',
    color: '#555',
  },
  form: {
    marginBottom: '20px',
  },
  input: {
    marginBottom: '10px',
    padding: '10px',
    width: '100%',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  editButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'all 0.3s ease',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  error: {
    color: 'red',
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
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  orderList: {
    listStyleType: 'none',
    padding: '0',
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  pagination: {
    marginTop: '20px',
  },
  pageButton: {
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ccc',
    padding: '5px 10px',
    margin: '0 5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  activePageButton: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  summaryListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px',
    width: '100%',
    border: '1px solid #e0e0e0',
    padding: '20px',
    borderRadius: '10px',
  },
  summaryListItem: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    width: '100%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
  },
  summaryListContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: '30px',
  },
  summaryListText: {
    fontSize: '16px',
    color: '#333',
  },
  noSummary: {
    fontSize: '16px',
    color: '#888',
    textAlign: 'center',
    padding: '20px',
  },
};

export default AdminPage;
