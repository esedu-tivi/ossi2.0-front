/**
 * Attaches a given access token to a MS Graph API call. Returns information about the user
 * @param accessToken 
 */
export async function callMsGraph(accessToken: string) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;
  
    headers.append("Authorization", bearer);
  
    const options = {
      method: "GET",
      headers: headers
    };
  
    try {
      console.log("Initiating API call to Microsoft Graph with token:", accessToken);  // Log the token
      const response = await fetch("https://graph.microsoft.com/v1.0/me", options);  // Make sure the endpoint is correct
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("API response data:", data);  // Log the response data
      return data;
    } catch (error) {
      console.error("Error fetching data from MS Graph:", error);
      throw error;
    }
  }
