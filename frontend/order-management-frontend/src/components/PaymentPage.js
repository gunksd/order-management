import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Lottie from 'lottie-react';
import { FaQrcode, FaMoneyBillWave, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaList } from 'react-icons/fa';
import successAnimation from '../assets/payment-success.json';
import { motion, AnimatePresence } from 'framer-motion';

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentLink, setPaymentLink] = useState(null);
  const [amount, setAmount] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const audioRef = useRef(new Audio('/sounds/payment-success.mp3'));
  const [orderIds, setOrderIds] = useState([]);
  const [isBatchPayment, setIsBatchPayment] = useState(false);

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('未找到用户令牌，请重新登录。');
        }

        let response;
        if (location.pathname === '/payment/batch') {
          setIsBatchPayment(true);
          const { orderIds, totalAmount } = location.state;
          setOrderIds(orderIds);
          setAmount(totalAmount);
          response = await axios.post(
            'http://localhost:5000/api/payment/generate-batch',
            { orderIds, totalAmount },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          response = await axios.post(
            'http://localhost:5000/api/payment/generate',
            { orderId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        if (response.data && response.data.payUrl) {
          setPaymentLink(response.data.payUrl);
          if (!isBatchPayment) {
            setAmount(response.data.amount);
          }
        } else {
          alert('无法生成支付链接，请稍后重试。');
          setError('无法生成支付链接，请稍后重试。');
          setTimeout(() => navigate('/customer'), 3000);
        }
      } catch (error) {
        console.error('Payment initiation error:', error);
        alert('支付请求失败，请稍后重试。');
        setError('支付请求失败，请稍后重试。');
        setTimeout(() => navigate('/customer'), 3000);
      }
    };

    initiatePayment();
  }, [orderId, navigate, location]);

  const handleCancel = async () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('用户令牌缺失，请重新登录');
        navigate('/login');
        return;
      }

      if (isBatchPayment) {
        await Promise.all(orderIds.map(id => 
          axios.delete(`http://localhost:5000/api/orders/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ));
        alert('批量订单已取消');
      } else {
        await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('订单已取消');
      }
      
      navigate('/customer');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('取消订单失败，请稍后重试。');
    } finally {
      setShowCancelConfirm(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowSuccessAnimation(true);
    audioRef.current.volume = 1; // Set volume to maximum
    audioRef.current.play().catch(error => console.error('Error playing audio:', error));
    setTimeout(() => {
      navigate('/customer');
    }, 2000);
  };

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
        style={styles.card}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={styles.errorContainer}>
                <FaTimesCircle style={styles.icon} />
                <h2 style={styles.error}>{error}</h2>
              </div>
            </motion.div>
          ) : paymentLink ? (
            <motion.div
              key="payment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 style={styles.header}>
                <FaQrcode style={styles.icon} />
                请使用支付宝扫描二维码支付
              </h2>
              <motion.img
                src={paymentLink}
                alt="支付二维码"
                style={styles.qrCode}
                whileHover={{ scale: 1.05 }}
              />
              <p style={styles.amount}>
                <FaMoneyBillWave style={styles.icon} />
                支付金额：{amount} 元
              </p>
              <div style={styles.instructionContainer}>
                <FaInfoCircle style={styles.icon} />
                <p style={styles.instruction}>
                  {isBatchPayment ? (
                    <>
                      <FaList style={{...styles.icon, marginRight: '5px'}} />
                      批量支付 {orderIds.length} 个订单
                      <br />
                      订单号: {orderIds.join(', ')}
                    </>
                  ) : (
                    <>请务必在支付时备注订单号：{orderId}</>
                  )}
                  <br />
                  支付完成后请耐心等待订单确认...
                </p>
              </div>
              <motion.button
                onClick={handlePaymentSuccess}
                style={styles.successButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaCheckCircle style={styles.buttonIcon} />
                我已支付，返回上一级页面
              </motion.button>
              <motion.button
                onClick={handleCancel}
                style={styles.cancelButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimesCircle style={styles.buttonIcon} />
                取消订单
              </motion.button>
            </motion.div>
          ) : (
            <motion.h2
              key="loading"
              style={styles.loading}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              正在生成支付链接，请稍候...
            </motion.h2>
          )}
        </AnimatePresence>
      </motion.div>
      {showCancelConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={styles.confirmOverlay}
        >
          <motion.div
            style={styles.confirmDialog}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3>确认取消订单？</h3>
            <p>您确定要取消{isBatchPayment ? '这些' : '此'}订单吗？此操作无法撤销。</p>
            <div style={styles.confirmButtons}>
              <motion.button
                onClick={confirmCancel}
                style={{ ...styles.confirmButton, backgroundColor: '#e74c3c' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                确认取消
              </motion.button>
              <motion.button
                onClick={() => setShowCancelConfirm(false)}
                style={styles.confirmButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                返回
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f7fa',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    animation: 'fadeIn 0.8s ease',
  },
  header: {
    color: '#333',
    marginBottom: '30px',
    fontSize: '24px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCode: {
    width: '200px',
    height: '200px',
    marginTop: '20px',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  amount: {
    marginTop: '25px',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#2ecc71',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'flex-start',
  },
  instruction: {
    color: '#555',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
    textAlign: 'left',
    marginLeft: '10px',
  },
  loading: {
    color: '#888',
    fontSize: '18px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  error: {
    color: '#e74c3c',
    fontSize: '18px',
    marginTop: '10px',
  },
  successButton: {
    marginTop: '30px',
    padding: '12px 24px',
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cancelButton: {
    marginTop: '15px',
    padding: '12px 24px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    marginRight: '10px',
    fontSize: '24px',
  },
  buttonIcon: {
    marginRight: '8px',
    fontSize: '18px',
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
    width: '600px',
    height: '600px',
  },
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  confirmOverlay: {
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
  confirmDialog: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  confirmButtons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  confirmButton: {
    padding: '10px 20px',
    margin: '0 10px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
};

export default PaymentPage;

