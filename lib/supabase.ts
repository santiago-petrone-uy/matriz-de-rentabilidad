import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función de prueba para verificar conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("_test_connection").select("*").limit(1)

    if (error && error.code === "42P01") {
      // Tabla no existe, pero conexión OK
      return { success: true, message: "Conexión exitosa - Base de datos lista" }
    }

    return { success: true, message: "Conexión exitosa", data }
  } catch (error) {
    return { success: false, message: "Error de conexión", error }
  }
}
