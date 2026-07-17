// Serverless-Funktion: nimmt das Kontaktformular entgegen und verschickt die
// Anfrage als formatierte E-Mail über das eigene Postfach (SMTP, Strato).
// Kein Drittanbieter, kein Netlify Forms — die Mail geht direkt an die Kanzlei.
//
// Datenschutz-Prinzipien dieser Funktion:
//   - Es werden AUSSCHLIESSLICH die vom Nutzer eingegebenen Formularfelder
//     verarbeitet. Die Funktion liest KEINE Netzwerk-Header (kein
//     x-forwarded-for, client-ip, user-agent) und speichert diese NICHT.
//   - Es findet KEIN persistentes Logging statt. `console.error` wird nur
//     bei technischen SMTP-/Konfigurationsfehlern aufgerufen und enthält
//     keine Besucher-Identifikatoren.
//   - Keine Datenbank, kein externer Dienst — die Formulardaten verlassen
//     Netlify direkt in Richtung des SMTP-Postfachs der Kanzlei.
//
// Benötigte Environment-Variablen (im Netlify-Dashboard setzen, NICHT im Code):
//   SMTP_HOST   z.B. smtp.strato.de
//   SMTP_PORT   z.B. 465
//   SMTP_USER   das Postfach, z.B. kanzlei@steuer-recht-celik.de
//   SMTP_PASS   das Postfach-Passwort
//   MAIL_TO     Empfänger (optional, Standard = SMTP_USER)
//   MAIL_CC     optionale Kopie, z.B. contact@dnmarketing.de (optional)

const Busboy = require('busboy');
const nodemailer = require('nodemailer');

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB pro Datei (wie im Frontend)
const MAX_TOTAL_BYTES = 30 * 1024 * 1024; // Sicherheitslimit gesamt

const GEBIET_LABELS = {
  insolvenz: 'Insolvenzrecht',
  steuer: 'Unternehmenssteuerrecht',
  arbeit: 'Arbeitsrecht',
  miet: 'Mietrecht',
  familie: 'Familienrecht',
  andere: 'Anderes Anliegen',
};

// Multipart-Body in Felder + Dateien zerlegen.
function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const contentType =
      event.headers['content-type'] || event.headers['Content-Type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      reject(new Error('Erwarte multipart/form-data'));
      return;
    }

    const busboy = Busboy({
      headers: { 'content-type': contentType },
      limits: { fileSize: MAX_FILE_BYTES, files: 10 },
    });

    const fields = {};
    const files = [];
    let totalBytes = 0;
    let aborted = false;

    busboy.on('field', (name, val) => {
      fields[name] = val;
    });

    busboy.on('file', (name, stream, info) => {
      const chunks = [];
      stream.on('data', (d) => {
        totalBytes += d.length;
        if (totalBytes > MAX_TOTAL_BYTES) {
          aborted = true;
          stream.resume();
          return;
        }
        chunks.push(d);
      });
      stream.on('limit', () => {
        aborted = true;
      });
      stream.on('end', () => {
        if (aborted || !info.filename) return;
        const content = Buffer.concat(chunks);
        if (content.length > 0) {
          files.push({
            filename: info.filename,
            content,
            contentType: info.mimeType,
          });
        }
      });
    });

    busboy.on('error', reject);
    busboy.on('close', () => {
      if (aborted) {
        reject(new Error('Datei zu groß'));
        return;
      }
      resolve({ fields, files });
    });

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body || '', 'utf8');
    busboy.end(body);
  });
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(f, gebietLabel) {
  const row = (label, value) =>
    value
      ? `<tr>
           <td style="padding:6px 16px 6px 0;color:#8a8170;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;vertical-align:top;white-space:nowrap">${label}</td>
           <td style="padding:6px 0;color:#1c1a17;font:400 15px/1.5 Arial,sans-serif">${value}</td>
         </tr>`
      : '';

  const message = f.anliegen
    ? `<div style="margin-top:24px">
         <div style="color:#8a8170;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">Nachricht</div>
         <div style="color:#1c1a17;font:400 15px/1.6 Arial,sans-serif;white-space:pre-wrap">${escapeHtml(f.anliegen)}</div>
       </div>`
    : '';

  return `<!doctype html><html><body style="margin:0;background:#fbf8f0;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #ece5d6;border-radius:14px;overflow:hidden">
      <div style="background:#1c1a17;padding:20px 28px">
        <div style="color:#c8a96a;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase">Neue Anfrage · Kontaktformular</div>
        <div style="color:#ffffff;font:600 20px/1.3 Arial,sans-serif;margin-top:6px">${escapeHtml(gebietLabel)}</div>
      </div>
      <div style="padding:24px 28px">
        <table style="border-collapse:collapse;width:100%">
          ${row('Name', escapeHtml((f.vorname || '') + ' ' + (f.nachname || '')))}
          ${row('E-Mail', f.email ? `<a href="mailto:${escapeHtml(f.email)}" style="color:#9a7b3f">${escapeHtml(f.email)}</a>` : '')}
          ${row('Telefon', escapeHtml(f.telefon))}
          ${row('Rechtsgebiet', escapeHtml(gebietLabel))}
        </table>
        ${message}
      </div>
      <div style="padding:14px 28px;border-top:1px solid #ece5d6;color:#8a8170;font:400 12px/1.5 Arial,sans-serif">
        Gesendet über das Kontaktformular von steuer-recht-celik.de
      </div>
    </div>
  </body></html>`;
}

function buildText(f, gebietLabel) {
  return [
    'Neue Anfrage über das Kontaktformular',
    '',
    `Name:        ${(f.vorname || '') + ' ' + (f.nachname || '')}`.trim(),
    `E-Mail:      ${f.email || '-'}`,
    `Telefon:     ${f.telefon || '-'}`,
    `Rechtsgebiet:${' ' + gebietLabel}`,
    '',
    'Nachricht:',
    f.anliegen || '-',
  ].join('\n');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Pflicht-Env-Variablen prüfen
  for (const key of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']) {
    if (!process.env[key]) {
      console.error('Fehlende Environment-Variable:', key);
      return { statusCode: 500, body: JSON.stringify({ error: 'Server nicht konfiguriert' }) };
    }
  }

  let fields, files;
  try {
    ({ fields, files } = await parseMultipart(event));
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }

  // Honeypot: wenn ausgefüllt, freundlich "ok" zurückgeben, aber nichts senden.
  if (fields['bot-field'] && fields['bot-field'].trim()) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  // Pflichtfelder serverseitig prüfen
  for (const k of ['vorname', 'nachname', 'email', 'gebiet']) {
    if (!fields[k] || !String(fields[k]).trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: `Feld fehlt: ${k}` }) };
    }
  }

  const gebietLabel = GEBIET_LABELS[fields.gebiet] || fields.gebiet || 'Anfrage';
  const port = Number(process.env.SMTP_PORT) || 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const fullName = `${fields.vorname} ${fields.nachname}`.trim();

  try {
    await transporter.sendMail({
      from: `"Kanzlei Celik · Kontaktformular" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      cc: process.env.MAIL_CC || undefined,
      replyTo: fields.email ? `"${fullName}" <${fields.email}>` : undefined,
      subject: `Neue Anfrage · ${gebietLabel} · ${fullName}`,
      text: buildText(fields, gebietLabel),
      html: buildHtml(fields, gebietLabel),
      attachments: files.map((f) => ({
        filename: f.filename,
        content: f.content,
        contentType: f.contentType,
      })),
    });
  } catch (err) {
    console.error('SMTP-Fehler:', err);
    return { statusCode: 502, body: JSON.stringify({ error: 'Versand fehlgeschlagen' }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
