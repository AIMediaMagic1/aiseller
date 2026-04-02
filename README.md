# SEMSA AI Licitaciones

Analizador inteligente de bases de licitación para SEMSA. Sube un PDF y obtén análisis instantáneo con IA.

## Funciones

- Resumen ejecutivo de la licitación
- Requisitos técnicos obligatorios
- Detección de riesgos ocultos
- Checklist de cumplimiento
- Veredicto: ¿Es viable para SEMSA?

## Stack

- **Backend:** Python + Flask
- **IA:** Claude API (Anthropic)
- **Deploy:** Render / Railway / Heroku

## Configuración local

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/semsa-licitaciones.git
cd semsa-licitaciones

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variable de entorno
export ANTHROPIC_API_KEY=tu_api_key_aqui

# 5. Correr la app
python app.py
```

Abre http://localhost:5000

## Deploy en Render (recomendado)

1. Sube este repositorio a GitHub
2. Ve a [render.com](https://render.com) → New Web Service
3. Conecta el repositorio
4. Configura:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn app:app`
5. Agrega la variable de entorno `ANTHROPIC_API_KEY`
6. Deploy

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Tu API key de Anthropic (obligatoria) |
