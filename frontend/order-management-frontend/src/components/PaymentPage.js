import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Lottie from 'lottie-react';
import { FaQrcode, FaMoneyBillWave, FaInfoCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import successAnimation from '../assets/payment-success.json';

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [paymentLink, setPaymentLink] = useState(null);
  const [amount, setAmount] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('未找到用户令牌，请重新登录。');
        }

        const response = await axios.post(
          'http://localhost:5000/api/payment/generate',
          { orderId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.payUrl) {
          setPaymentLink(response.data.payUrl);
          setAmount(response.data.amount);
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
  }, [orderId, navigate]);

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('用户令牌缺失，请重新登录');
        navigate('/login');
        return;
      }

      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('订单已取消');
      navigate('/customer');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('取消订单失败，请稍后重试。');
    }
  };

  const handlePaymentSuccess = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => {
      navigate('/customer');
    }, 2000);
  };

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
      <div style={styles.card}>
        {error ? (
          <div style={styles.errorContainer}>
            <FaTimesCircle style={styles.icon} />
            <h2 style={styles.error}>{error}</h2>
          </div>
        ) : paymentLink ? (
          <>
            <h2 style={styles.header}>
              <FaQrcode style={styles.icon} />
              请使用支付宝扫描二维码支付
            </h2>
            <img src={paymentLink} alt="支付二维码" style={styles.qrCode} />
            <p style={styles.amount}>
              <FaMoneyBillWave style={styles.icon} />
              支付金额：{amount} 元
            </p>
            <div style={styles.instructionContainer}>
              <FaInfoCircle style={styles.icon} />
              <p style={styles.instruction}>
                请务必在支付时备注订单号：{orderId}
                <br />
                支付完成后请耐心等待订单确认...
              </p>
            </div>
            <button onClick={handlePaymentSuccess} style={styles.successButton}>
              <FaCheckCircle style={styles.buttonIcon} />
              我已支付，返回上一级页面
            </button>
            <button onClick={handleCancel} style={styles.cancelButton}>
              <FaTimesCircle style={styles.buttonIcon} />
              取消订单
            </button>
          </>
        ) : (
          <h2 style={styles.loading}>正在生成支付链接，请稍候...</h2>
        )}
      </div>
    </div>
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
    width: '250px',
    height: '250px',
    marginTop: '20px',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
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
    width: '400px',
    height: '400px',
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
};

export default PaymentPage;

