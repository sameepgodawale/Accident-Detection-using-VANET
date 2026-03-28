import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // CHANGED: email -> username
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // CHANGED: username instead of email
      await login(username, password);

      navigate('/', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>

          <CardTitle className="text-2xl">V2X Command Center</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to access the dashboard
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* CHANGED: Email -> Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>

              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}

              {loading ? 'Signing in…' : 'Sign In'}
            </Button>

          </form>

          {/* Updated credentials section */}
          <div className="mt-4 p-3 rounded-md bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Default Admin Credentials
            </p>

            <p className="text-xs text-muted-foreground font-mono-data">
              Username: admin
            </p>

            <p className="text-xs text-muted-foreground font-mono-data">
              Password: admin123
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
