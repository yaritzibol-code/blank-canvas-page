import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Plane, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const SCHOOLS = [
  "CENCA",
  "UAEM Aviación",
  "ENAH",
  "Escuela Mexicana de Aviación",
  "Colegio de Pilotos",
  "Otra escuela",
];

const PROFILES = [
  { value: "piloto_privado", label: "Piloto Privado (PPL)" },
  { value: "piloto_comercial", label: "Piloto Comercial (CPL)" },
  { value: "habilitacion", label: "Habilitación de aeronave" },
  { value: "otro", label: "Otro" },
];

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptPromos, setAcceptPromos] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    school: "",
    profile: "",
    examDate: "",
    whatsapp: "",
  });

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2DCDB]/30 via-white to-[#F2DCDB]/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#3D5D91] flex items-center justify-center shadow-lg">
            <span className="text-[#F2AEBC] font-extrabold text-xl leading-none">F</span>
          </div>
          <span className="font-extrabold text-[#3D5D91] text-2xl">FlightPath</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#F2DCDB] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-[#3D5D91] mb-1">Crea tu cuenta</h1>
            <p className="text-slate-400 text-sm">Empieza a estudiar para el CIAAC hoy mismo</p>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full border-slate-200 hover:bg-[#F2DCDB]/30 text-slate-700 font-medium h-11 mb-5"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Registrarse con Google
          </Button>

          <div className="flex items-center gap-3 mb-5">
            <Separator className="flex-1 bg-[#F2DCDB]" />
            <span className="text-slate-400 text-xs font-medium">o crea tu cuenta</span>
            <Separator className="flex-1 bg-[#F2DCDB]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-700 font-medium text-sm">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                className="h-11 border-[#F2DCDB] focus:border-[#3D5D91]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className="h-11 border-[#F2DCDB] focus:border-[#3D5D91]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  className="h-11 border-[#F2DCDB] focus:border-[#3D5D91] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="text-slate-700 font-medium text-sm">
                WhatsApp{" "}
                <span className="text-slate-400 font-normal">(para recordatorios)</span>
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+52 55 1234 5678"
                value={form.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                className="h-11 border-[#F2DCDB] focus:border-[#3D5D91]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-sm">Escuela</Label>
                <Select onValueChange={(v) => handleChange("school", v)}>
                  <SelectTrigger className="h-11 border-[#F2DCDB] focus:border-[#3D5D91]">
                    <SelectValue placeholder="Tu escuela" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOLS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium text-sm">Perfil CIAAC</Label>
                <Select onValueChange={(v) => handleChange("profile", v)}>
                  <SelectTrigger className="h-11 border-[#F2DCDB] focus:border-[#3D5D91]">
                    <SelectValue placeholder="Licencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="examDate" className="text-slate-700 font-medium text-sm flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                Fecha aproximada de tu examen{" "}
                <span className="text-slate-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="examDate"
                type="date"
                value={form.examDate}
                onChange={(e) => handleChange("examDate", e.target.value)}
                className="h-11 border-[#F2DCDB] focus:border-[#3D5D91]"
              />
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="promos"
                checked={acceptPromos}
                onCheckedChange={(v) => setAcceptPromos(!!v)}
                className="mt-0.5 border-[#F2DCDB] data-[state=checked]:bg-[#3D5D91] data-[state=checked]:border-[#3D5D91]"
              />
              <Label htmlFor="promos" className="text-slate-500 text-xs leading-relaxed cursor-pointer">
                Quiero recibir consejos de estudio, recordatorios y novedades de FlightPath por WhatsApp y correo
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3D5D91] hover:bg-[#5A86CB] text-white font-bold h-11 shadow-md shadow-[#3D5D91]/20 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Plane className="w-4 h-4 animate-bounce" />
                  Creando tu cuenta...
                </span>
              ) : (
                "Crear cuenta gratis"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
            Al crear tu cuenta aceptas nuestros{" "}
            <a href="#" className="text-[#3D5D91] underline">Términos de servicio</a>{" "}
            y{" "}
            <a href="#" className="text-[#3D5D91] underline">Política de privacidad</a>
          </p>

          <p className="text-center text-sm text-slate-500 mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-[#3D5D91] font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Aprende, Domina y Vuela ✈️ · FlightPath
        </p>
      </div>
    </div>
  );
}
