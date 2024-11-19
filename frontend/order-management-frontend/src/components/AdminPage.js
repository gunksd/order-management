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
  const [searchActive, setSearchActive] = useState(false);
  const searchButtonRef = useRef(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  // 获取菜品列表
  const fetchDishes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dishes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDishes(response.data);
      setFilteredDishes(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      if (error.response && error.response.status === 401) {
        setError('未授权访问，请重新登录。');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('无法获取菜品列表，请稍后重试。');
      }
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

  // 添加菜品
  const handleAddDish = async () => {
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
      setDishName('');
      setPrice('');
      setStock('');
      setError(null);
      alert('菜品添加成功');
      fetchDishes();
    } catch (error) {
      console.error('Error adding dish:', error);
      if (error.response && error.response.status === 401) {
        setError('未授权访问，请重新登录。');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
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
      fetchDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
      if (error.response && error.response.status === 401) {
        setError('未授权访问，请重新登录。');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('删除菜品失败，请稍后重试。');
      }
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
      await axios.put(
        `http://localhost:5000/api/dishes/${editDishId}`,
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
      if (error.response && error.response.status === 401) {
        setError('未授权访问，请重新登录。');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('更新菜品失败，请检查输入信息。');
      }
    }
  };

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
      </div>
    </div>
  );
}

// 样式对象，采用黑白配色和简约风格
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
    maxWidth: '500px',
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
    backgroundColor: 'white', // 将背景颜色改为白色
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
};

export default AdminPage;
