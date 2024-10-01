import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { callMsGraph } from '../utils/graph';
import { ProfileData } from './ProfileData';
import { GraphData } from '../interfaces/graphData'

export const Dashboard = () => {
  const { accounts } = useMsal();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');
    
    if (accessToken) {
      callMsGraph(accessToken)
        .then((data) => setGraphData(data))
        .catch((err) => {
          console.error("Error fetching MS Graph data:", err);
          setError("Error fetching MS Graph data");
        });
    }
  }, [accounts]);
  

  return (
    <div>
      <h2>Tervetuloa OSSIIN</h2>
      
      {error && <p>{error}</p>}
      
      {/* If graphData is available, render ProfileData */}
      {graphData ? (
        <ProfileData graphData={graphData} />
      ) : (
        <p></p>
      )}
    </div>
  );
};



