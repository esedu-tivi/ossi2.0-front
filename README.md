## Getting Started

To run the project locally, follow these steps:

### Prerequisites

Have the following installed:

- [Node.js](https://nodejs.org/) (version 16 or above)
- npm or [Yarn](https://yarnpkg.com/)
- Docker Desktop - https://www.docker.com/products/docker-desktop/

Also clone the Ossi-Api repository and follow the instructions for setting that one up.

Navigate to the project directory:

### Install the dependencies:
npm install

- Remember to add .env file to your project with correct client/tenantId's
  
VITE_CLIENT_ID=client-id-here

VITE_TENANT_ID=tenant-id-here

VITE_REDIRECT_URI=http://localhost:5174/

VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5174/

### Run the development server:

npm run dev

Open localhost to view it in your browser.

