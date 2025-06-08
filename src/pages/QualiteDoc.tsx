import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QualiteDoc = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the unified /documents page
    navigate('/documents', { replace: true });
  }, [navigate]);

  return null; // This component will not render anything, just redirect
};

export default QualiteDoc;