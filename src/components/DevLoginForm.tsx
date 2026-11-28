// Development-only login with a made-up email, for demos without real Entra accounts.
// Rendered only by the Vite dev server with VITE_DEV_LOGIN=true (see Login.tsx);
// production builds leave it out. The backend must also allow it
// (NODE_ENV=development and DEV_LOGIN_ENABLED=true for auth-api).

import { useState, type FormEvent } from "react";
import { useMutation } from "@apollo/client";
import { DEV_LOGIN_MUTATION } from "@/graphql/DevLoginMutation";
import { useAuth } from "@/utils/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const newDemoEmail = () => `demo.opiskelija${Date.now().toString().slice(-5)}@esedulainen.fi`;

const DevLoginForm = () => {
  const { setIsAuthenticated, setUserEmail } = useAuth();
  const [email, setEmail] = useState(newDemoEmail);
  const [firstName, setFirstName] = useState("Demo");
  const [lastName, setLastName] = useState("Opiskelija");
  const [groupName, setGroupName] = useState("DEMO");
  const [error, setError] = useState<string | null>(null);
  const [devLogin, { loading }] = useMutation(DEV_LOGIN_MUTATION);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const { data } = await devLogin({ variables: { email, firstName, lastName, groupName } });
      const result = data?.devLogin;

      if (!result?.success || !result.token) {
        setError(result?.message ?? "Kirjautuminen epäonnistui.");
        return;
      }

      // Same session keys as the Microsoft login in auth-provider.tsx.
      const normalizedEmail = email.trim().toLowerCase();
      sessionStorage.setItem("mutatedToken", result.token);
      sessionStorage.setItem("ossi.email", normalizedEmail);
      sessionStorage.setItem("ossi.authenticated", JSON.stringify(true));
      setUserEmail(normalizedEmail);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 border-t border-dashed pt-4 text-left">
      <p className="text-sm font-semibold text-amber-700">Kehityskirjautuminen (vain paikallinen kehitys)</p>
      <p className="text-xs text-muted-foreground">
        Uusi sähköpostiosoite luo uuden käyttäjän, kuten ensimmäinen kirjautuminen.
        @esedulainen.fi = opiskelija, @esedu.fi = opettaja.
      </p>

      <div className="space-y-1">
        <Label htmlFor="dev-email">Sähköposti</Label>
        <div className="flex gap-2">
          <Input id="dev-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <Button type="button" variant="outline" onClick={() => setEmail(newDemoEmail())}>
            Uusi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="dev-first">Etunimi</Label>
          <Input id="dev-first" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="dev-last">Sukunimi</Label>
          <Input id="dev-last" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="dev-group">Ryhmä (opiskelijalle)</Label>
        <Input id="dev-group" value={groupName} onChange={e => setGroupName(e.target.value)} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
        {loading ? "Kirjaudutaan..." : "Kirjaudu kehityskäyttäjänä"}
      </Button>
    </form>
  );
};

export default DevLoginForm;
