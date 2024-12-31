import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

const AuthenticatedComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const response = await axios.get('http://localhost:5000/api/protected-data', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>认证后的组件</h2>
      {data ? <p>{JSON.stringify(data)}</p> : <p>加载中...</p>}
    </div>
  );
};

export default AuthenticatedComponent;

