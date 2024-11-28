import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [paymentLink, setPaymentLink] = useState(null);
  const [amount, setAmount] = useState(null);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const token = localStorage.getItem('token'); // 获取用户的 token

        if (!token) {
          throw new Error('未找到用户令牌，请重新登录。');
        }

        // 请求支付链接
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
          // 设置支付链接和金额
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

      // 发起删除订单请求
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
    setShowConfetti(true);
    setTimeout(() => {
      navigate('/customer');
    }, 5000);
  };

  return (
    <div style={styles.container}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <div style={styles.card}>
        {error ? (
          <h2 style={styles.error}>{error}</h2>
        ) : paymentLink ? (
          <>
            <h2 style={styles.header}>请使用支付宝扫描下方二维码进行支付</h2>
            <img src={paymentLink} alt="支付二维码" style={styles.qrCode} />
            <p style={styles.amount}>支付金额：{amount} 元</p>
            <p style={styles.instruction}>请务必在支付时备注订单号：{orderId}</p>
            <p style={styles.instruction}>支付完成后请耐心等待订单确认...</p>
            <button onClick={handlePaymentSuccess} style={styles.successButton}>我已支付，返回上一级页面</button>
            <button onClick={handleCancel} style={styles.cancelButton}>取消</button>
          </>
        ) : (
          <h2 style={styles.loading}>正在生成支付链接，请稍候...</h2>
        )}
      </div>
    </div>
  );
}

// 样式
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
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    animation: 'fadeIn 0.8s ease',
  },
  header: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: '500',
  },
  qrCode: {
    width: '300px',
    height: '300px',
    marginTop: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  amount: {
    marginTop: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  instruction: {
    color: '#555',
    marginTop: '10px',
    fontSize: '14px',
  },
  loading: {
    color: '#888',
    fontSize: '18px',
  },
  error: {
    color: 'red',
    fontSize: '18px',
  },
  successButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cancelButton: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'scale(0.9)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
};

export default PaymentPage;
