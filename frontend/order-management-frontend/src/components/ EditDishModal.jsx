import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

function EditDishModal({ isOpen, onClose, onSave, dish }) {
  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    if (dish) {
      setDishName(dish.dish_name);
      setPrice(dish.price);
      setStock(dish.stock);
    } else {
      setDishName('');
      setPrice('');
      setStock('');
    }
  }, [dish]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      dish_id: dish ? dish.dish_id : null,
      dish_name: dishName,
      price: parseFloat(price),
      stock: parseInt(stock),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={styles.overlay}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            style={styles.modal}
          >
            <button onClick={onClose} style={styles.closeButton}>
              <FaTimes />
            </button>
            <h2 style={styles.header}>{dish ? '编辑菜品' : '添加新菜品'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label htmlFor="dishName" style={styles.label}>菜品名称</label>
                <input
                  id="dishName"
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="price" style={styles.label}>价格</label>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label htmlFor="stock" style={styles.label}>库存</label>
                <input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  min="0"
                  style={styles.input}
                />
              </div>
              <button type="submit" style={styles.submitButton}>
                {dish ? '更新菜品' : '添加菜品'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    maxWidth: '500px',
    width: '100%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#333',
  },
  header: {
    marginBottom: '20px',
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '16px',
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #d9d9d9',
    fontSize: '16px',
  },
  submitButton: {
    backgroundColor: '#1890ff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    marginTop: '10px',
  },
};

export default EditDishModal;

