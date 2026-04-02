import os
import base64
import json
import anthropic
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20MB max

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """Eres un experto en licitaciones gubernamentales mexicanas, especializado en HVAC,
eléctrico, data centers y mantenimiento industrial. Analizas bases de licitación para la empresa
SEMSA (30+ años de experiencia en el sector).

Tu análisis debe ser preciso, conciso y orientado a tomar decisiones rápidas."""

ANALYSIS_PROMPT = """Analiza esta base de licitación y responde SOLO con un JSON válido con esta
estructura exacta, sin texto adicional ni bloques de código:

{
  "veredicto": "SI|NO|PARCIAL",
  "veredicto_razon": "Explicación de 2-3 líneas de por qué SEMSA puede o no ganar esta licitación",
  "resumen": "Resumen ejecutivo en 3-4 líneas: qué se pide, quién licita, monto estimado, plazo",
  "requisitos": "Lista de requisitos técnicos obligatorios, uno por línea con guión al inicio",
  "riesgos": "Lista de riesgos ocultos o factores que pueden descalificar, uno por línea con guión",
  "checklist": "Checklist de cumplimiento con ✓ o ✗ según si SEMSA puede cumplir, uno por línea"
}"""


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/analizar", methods=["POST"])
def analizar():
    if "pdf" not in request.files:
        return jsonify({"error": "No se recibió ningún archivo"}), 400

    pdf_file = request.files["pdf"]
    if not pdf_file.filename.endswith(".pdf"):
        return jsonify({"error": "Solo se aceptan archivos PDF"}), 400

    pdf_bytes = pdf_file.read()
    pdf_base64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "document",
                            "source": {
                                "type": "base64",
                                "media_type": "application/pdf",
                                "data": pdf_base64,
                            },
                        },
                        {"type": "text", "text": ANALYSIS_PROMPT},
                    ],
                }
            ],
        )

        text = response.content[0].text.strip()
        resultado = json.loads(text)
        return jsonify(resultado)

    except json.JSONDecodeError:
        return jsonify({"error": "Error al procesar la respuesta del análisis"}), 500
    except anthropic.APIError as e:
        return jsonify({"error": f"Error de API: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
