const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const pino = require("pino");

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
      console.log("✅ Bot connecté !");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    const jid = msg.key.remoteJid;

    if (text === ".ping") {
      await sock.sendMessage(jid, {
        text: "🏓 Pong ! Le bot fonctionne."
      });
    }

    if (text === ".menu") {
      await sock.sendMessage(jid, {
        text: "🤖 MENU\n\n.ping\n.menu"
      });
    }
  });
}

startBot();
