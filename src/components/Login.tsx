import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { OVERLAY_TRANSITION, SURFACE_ENTER_TRANSITION } from "../motion";

interface LoginProps {
  onLogin: (token: string) => void;
  onBack: () => void;
}

export default function Login({ onLogin, onBack }: LoginProps) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("prisma_token", data.token);
        onLogin(data.token);
      } else {
        setError("Contraseña incorrecta");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-prisma-dark px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-prisma-purple/10 rounded-full blur-[200px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-prisma-deep/15 rounded-full blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SURFACE_ENTER_TRANSITION, opacity: OVERLAY_TRANSITION }}
        className="w-full max-w-md relative z-10"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm uppercase tracking-widest font-medium">Volver</span>
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-prisma-purple/20 border border-prisma-purple/30 rounded-2xl flex items-center justify-center">
              <Lock size={24} className="text-prisma-purple" />
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl uppercase text-white tracking-tighter">
            Acceso<br /><span className="text-prisma-purple">Admin</span>
          </h1>
          <p className="text-gray-400 mt-3 text-sm uppercase tracking-wider font-medium">
            Panel de gestión de Prisma Pub
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce la contraseña de admin"
              className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:border-prisma-accent focus:bg-white/10 outline-none transition-all text-lg"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={OVERLAY_TRANSITION}
              className="text-prisma-accent text-sm font-semibold uppercase tracking-wider bg-prisma-accent/10 border border-prisma-accent/20 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-prisma-purple text-white py-4 rounded-full font-display text-xl uppercase tracking-wider hover:bg-white hover:text-prisma-dark transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(139,92,246,0.4)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verificando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
