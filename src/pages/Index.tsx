import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Shield, Zap, Users } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Chavan Hero</span>
          </div>
          <Link to="/auth">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            The Ultimate Dashboard Platform
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Build, customize, and deploy beautiful dashboards with powerful analytics, 
            real-time data visualization, and enterprise-grade security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Start Building
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-4 p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Real-time data visualization with 20+ chart types and custom widgets
            </p>
          </div>
          
          <div className="text-center space-y-4 p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Enterprise Security</h3>
            <p className="text-muted-foreground">
              Role-based access control, secure authentication, and data encryption
            </p>
          </div>
          
          <div className="text-center space-y-4 p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Optimized performance with instant updates and responsive design
            </p>
          </div>
          
          <div className="text-center space-y-4 p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Share dashboards, manage permissions, and collaborate in real-time
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center space-y-6 p-12 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border">
          <h2 className="text-3xl lg:text-4xl font-bold">Ready to Transform Your Data?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of teams already using Chavan Hero to make data-driven decisions
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-12 bg-background/95">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Chavan Hero. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
