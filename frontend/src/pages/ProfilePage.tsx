import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth.store";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  const profileItems = [
    { icon: User, label: "Full Name", value: user.name },
    { icon: Mail, label: "Email", value: user.email },
    { icon: Shield, label: "Role", value: user.role },
    {
      icon: Calendar,
      label: "Member Since",
      value: new Date(user.createdAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-muted-foreground">Your account information</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle>{user.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      user.role === "ADMIN" ? "default" : "secondary"
                    }
                  >
                    {user.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profileItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 py-3 border-b last:border-0"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "React 19",
                "TypeScript",
                "Vite",
                "Zustand",
                "Tailwind CSS",
                "Shadcn UI",
                "React Hook Form",
                "Zod",
                "Framer Motion",
                "Express.js",
                "Prisma",
                "PostgreSQL",
                "JWT",
                "Docker",
              ].map((tech) => (
                <Badge key={tech} variant="outline">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
