import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/protected-route', { withCredentials: true })
      .then(res => {
        // access granted, maybe set user state
      })
      .catch(err => {
        if (err.response?.status === 401) {
          console.log('Session expired');
          navigate('/login'); // redirect to login
        }
      });
  }, []);

  return (
    <div>
      <h1>Welcome to Dashboard</h1>
    </div>
  );
};

export default Dashboard;
