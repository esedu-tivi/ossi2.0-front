import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Login = () => {
  const { instance } = useMsal();

  // Starts login using redirect flow
  // User is navigated to Microsoft login screen
  // When login is successful user is redirected back to program with the authentication data
  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Ossi 2.0
          </CardTitle>
          <CardDescription className="text-base">
            Etel&auml;-Savon ammattiopisto
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button size="lg" onClick={handleLogin}>
            <LogIn />
            Kirjaudu Sis&auml;&auml;n
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
