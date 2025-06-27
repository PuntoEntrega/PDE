import { Suspense } from "react"
import CompleteRegistrationForm from "@/Components/Users/CompleteRegistrationForm"
import { Loader2 } from "lucide-react"

export default function CompleteRegistrationPage() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Fondo con gradientes y formas */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* Formas decorativas */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    {/* Círculo grande superior izquierdo */}
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-300/20 rounded-full blur-3xl"></div>

                    {/* Círculo mediano superior derecho */}
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-purple-200/30 to-pink-300/20 rounded-full blur-2xl"></div>

                    {/* Círculo pequeño centro */}
                    <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-gradient-to-br from-indigo-200/20 to-blue-300/15 rounded-full blur-xl"></div>

                    {/* Círculo inferior derecho */}
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-indigo-400/15 rounded-full blur-3xl"></div>

                    {/* Círculo inferior izquierdo */}
                    <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-gradient-to-br from-purple-300/25 to-indigo-300/20 rounded-full blur-2xl"></div>
                </div>

                {/* Patrón de puntos sutil */}
                <div className="absolute inset-0 opacity-30">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
                            backgroundSize: "20px 20px",
                        }}
                    ></div>
                </div>

                {/* Líneas decorativas */}
                <div className="absolute inset-0">
                    <svg className="absolute top-20 left-10 w-32 h-32 text-blue-200/40" fill="currentColor" viewBox="0 0 100 100">
                        <path
                            d="M20 20 L80 20 L80 80 L20 80 Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            strokeDasharray="5,5"
                        />
                    </svg>

                    <svg
                        className="absolute bottom-32 right-16 w-24 h-24 text-purple-200/40"
                        fill="currentColor"
                        viewBox="0 0 100 100"
                    >
                        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                    </svg>

                    <svg
                        className="absolute top-1/3 right-1/4 w-16 h-16 text-indigo-200/40"
                        fill="currentColor"
                        viewBox="0 0 100 100"
                    >
                        <polygon
                            points="50,10 90,90 10,90"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            strokeDasharray="4,4"
                        />
                    </svg>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
                <Suspense
                    fallback={
                        <div className="flex flex-col items-center justify-center space-y-4 p-8">
                            <div className="relative">
                                <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-700 font-medium">Cargando formulario de registro...</p>
                                <p className="text-gray-500 text-sm mt-1">Preparando tu experiencia</p>
                            </div>
                        </div>
                    }
                >
                    <CompleteRegistrationForm />
                </Suspense>
            </div>

            {/* Elementos flotantes animados */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
                <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-ping"></div>
                <div
                    className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-indigo-400/35 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-300/40 rounded-full animate-ping"
                    style={{ animationDelay: "2s" }}
                ></div>
            </div>
        </div>
    )
}
